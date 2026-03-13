"""
Content Pipeline: Research → Write → QA → Launch
Uses Gemini 3 Flash for research, Claude Sonnet 4.5 for writing, DB for QA
"""
import os
import json
import uuid
import re
from datetime import datetime, timezone
from typing import List, Dict, Optional
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    LlmChat = None
    UserMessage = None
    print("Warning: emergentintegrations not installed. Content pipeline AI features disabled.")

API_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# All valid state/country slugs for internal link validation
VALID_LINK_PATTERNS = []  # populated at runtime

# ============================================
# INTERNATIONAL CRISIS HELPLINES (Rule 5)
# ============================================
CRISIS_HELPLINES = {
    "USA": {"name": "SAMHSA National Helpline", "number": "1-800-662-4357", "extra": "988 Suicide & Crisis Lifeline: call or text 988"},
    "GBR": {"name": "Frank Drug Helpline", "number": "0300 123 6600", "extra": "Samaritans: 116 123"},
    "CAN": {"name": "Canada Crisis Services", "number": "1-833-456-4566", "extra": "Text HOME to 686868"},
    "AUS": {"name": "Lifeline Australia", "number": "13 11 14", "extra": "DirectLine (alcohol/drugs): 1800 888 236"},
    "DEU": {"name": "Telefonseelsorge", "number": "0800 111 0 111", "extra": "Drug emergency: 112"},
    "MEX": {"name": "SAPTEL Mexico", "number": "55 5259-8121", "extra": "CONADIC: 800-911-2000"},
    "COL": {"name": "Linea 106 Colombia", "number": "106", "extra": "Ministerio de Salud"},
    "BRA": {"name": "CVV Brazil", "number": "188", "extra": "CAPS (Centro de Atencao Psicossocial)"},
    "IND": {"name": "Vandrevala Foundation", "number": "+91 9999 666 555", "extra": "iCall: 9152987821"},
    "PHL": {"name": "NCMH Crisis Hotline", "number": "0917-899-8727", "extra": "DOH Mental Health: 1553"},
    "NGA": {"name": "SURPIN Nigeria", "number": "+234 8062106493", "extra": "NDLEA Helpline"},
    "ZAF": {"name": "SADAG South Africa", "number": "0800 12 13 14", "extra": "Substance Abuse Helpline: 0800 12 13 14"},
    "FRA": {"name": "Drogues Info Service", "number": "0 800 23 13 13", "extra": "SOS Amitie: 09 72 39 40 50"},
    "ESP": {"name": "Telefono de la Esperanza", "number": "717 003 717", "extra": "FAD: 900 16 15 15"},
    "NLD": {"name": "Trimbos-instituut", "number": "0900-1995", "extra": "113 Suicide Prevention: 0900-0113"},
    "ITA": {"name": "Telefono Amico", "number": "02 2327 2327", "extra": "Droga? No Grazie: 800 186 070"},
}

# Day-of-week tier rotation
TIER_SCHEDULE = {
    0: {"tier": "T1", "label": "USA National", "queries": ["fentanyl news today", "drug overdose deaths today", "DEA drug raid news", "opioid crisis news today"], "focus": "USA"},
    1: {"tier": "T1-states", "label": "USA States Rotation", "queries": ["drug overdose news {state}", "addiction crisis {state} news", "fentanyl {state} news"], "focus": "USA States"},
    2: {"tier": "T2", "label": "North America", "queries": ["Mexico cartel news today", "Canada opioid crisis news", "US Mexico border drug news", "fentanyl trafficking news"], "focus": "Mexico, Canada, USA"},
    3: {"tier": "T1", "label": "USA Policy", "queries": ["drug policy news today", "FDA opioid news", "naloxone news today", "addiction legislation news"], "focus": "USA"},
    4: {"tier": "T2", "label": "Europe & UK", "queries": ["UK drug deaths news", "Europe drug crisis news", "Netherlands drug news", "Germany addiction news"], "focus": "UK, Germany, France, Netherlands, Spain"},
    5: {"tier": "T3", "label": "Latin America & Asia", "queries": ["Colombia drug trafficking news", "Brazil drug crisis news", "Philippines drug news", "India drug abuse news"], "focus": "Colombia, Brazil, Philippines, India"},
    6: {"tier": "T4", "label": "Africa & Global", "queries": ["Nigeria drug trafficking news", "South Africa drug crisis", "Australia drug news", "drug trafficking news Africa"], "focus": "Nigeria, South Africa, Australia, global"},
}

# All 50 US states for rotation
US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming"
]

DAILY_ARTICLE_CAP = 4
NEWS_SEARCH_WINDOW_HOURS = 12

def _get_helplines_for_countries(country_codes: List[str]) -> str:
    """Build helpline text block for the given country codes"""
    lines = []
    has_usa = "USA" in country_codes
    for code in country_codes:
        info = CRISIS_HELPLINES.get(code)
        if info:
            lines.append(f"- {info['name']}: {info['number']}" + (f" ({info['extra']})" if info.get('extra') else ""))
    if not has_usa:
        usa = CRISIS_HELPLINES["USA"]
        lines.append(f"- {usa['name']}: {usa['number']} ({usa['extra']})")
    return "\n".join(lines) if lines else "- SAMHSA National Helpline: 1-800-662-4357\n- 988 Suicide & Crisis Lifeline: call or text 988"


# ============================================
# FUZZY DUPLICATE DETECTION (Rule 1)
# ============================================
def _jaccard_similarity(title_a: str, title_b: str) -> float:
    """Word-level Jaccard similarity between two titles"""
    words_a = set(title_a.lower().split())
    words_b = set(title_b.lower().split())
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union)

def _is_duplicate(new_title: str, existing_titles: List[str], threshold: float = 0.6) -> bool:
    """Check if new_title is too similar to any existing title (>60% word overlap)"""
    for existing in existing_titles:
        if _jaccard_similarity(new_title, existing) > threshold:
            return True
    return False


# ============================================
# FEATURED IMAGE (Rule 2) — unique per article
# ============================================
# 40 unique, verified Unsplash direct URLs covering different topics
IMAGE_POOL = [
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1517120026326-d87759a7b63b?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1581093458791-9d42e3c2fd45?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1560252829-804f1aedf1be?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1569924160399-96f3afdd4753?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1578496781985-452d4a934d50?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1542884748-2b87b36c6b90?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1498758536662-35b82cd15e29?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1495653797063-114787b77b23?w=1200&h=630&fit=crop",
]

async def _get_unique_image(slug: str, db=None) -> str:
    """Get a unique image that no other article is using"""
    used_images = set()
    if db is not None:
        existing = await db.articles.find(
            {"content_type": "news", "featured_image_url": {"$exists": True}},
            {"_id": 0, "featured_image_url": 1}
        ).to_list(200)
        used_images = {a.get("featured_image_url", "") for a in existing}
    
    # Find first unused image
    for img in IMAGE_POOL:
        if img not in used_images:
            return img
    
    # All used — cycle based on slug hash
    import hashlib
    idx = int(hashlib.md5(slug.encode()).hexdigest(), 16) % len(IMAGE_POOL)
    return IMAGE_POOL[idx]


# ============================================
# HUMAN WRITING ENFORCEMENT
# ============================================
BANNED_PHRASES = [
    "it's worth noting", "it is worth noting", "it's important to note",
    "it is important to note", "in conclusion", "let's dive in",
    "let's take a look", "let's explore", "this raises questions",
    "in the wake of", "amid growing concerns", "sheds light on",
    "a growing body of evidence", "navigating the complexities",
    "at the end of the day", "moving forward", "it remains to be seen",
    "only time will tell", "the landscape of", "a nuanced approach",
    "a multifaceted issue", "in today's world", "in recent years",
    "it goes without saying", "needless to say", "as we all know",
    "the fact of the matter", "when all is said and done",
    "a double-edged sword", "a paradigm shift", "the elephant in the room",
    "game changer", "deep dive", "unpack", "leverage", "robust",
    "holistic approach", "synergy", "ecosystem", "stakeholders",
    "at the forefront", "cutting-edge", "groundbreaking",
]

def _clean_ai_patterns(content: str) -> str:
    """Remove AI writing patterns and enforce human style"""
    if not content:
        return content

    # Remove em dashes
    content = content.replace("\u2014", " - ").replace("\u2013", "-").replace("&mdash;", " - ").replace("&ndash;", "-")

    # Remove banned phrases (case-insensitive)
    for phrase in BANNED_PHRASES:
        content = re.sub(re.escape(phrase), "", content, flags=re.IGNORECASE)

    # Clean up double spaces left by removals
    content = re.sub(r'  +', ' ', content)
    content = re.sub(r'\. \.', '.', content)
    content = re.sub(r'^\s*,\s*', '', content, flags=re.MULTILINE)

    # Replace "stated" / "noted" / "expressed" with "said"
    for word in ["stated", "noted", "expressed", "emphasized", "highlighted", "underscored"]:
        content = re.sub(rf'\b{word}\b', 'said', content, flags=re.IGNORECASE)

    return content.strip()


import logging
logger = logging.getLogger(__name__)


def _get_research_chat(session_id: str) -> LlmChat:
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime("%B %d, %Y")
    chat = LlmChat(
        api_key=API_KEY,
        session_id=session_id,
        system_message=f"""You are a breaking news researcher for an addiction data website. Today is {today}.

Your job: Find REAL breaking news stories from the LAST 4-10 HOURS about drugs, addiction, cartels, overdose deaths, drug policy, or substance abuse.

RULES:
- Only suggest stories that are ACTUALLY happening right now - real events, real people, real places
- These must be verifiable news events (arrests, raids, policy changes, death reports, seizures, court rulings)
- Do NOT suggest evergreen topics or general analysis pieces
- Do NOT make up events
- Include the source where you found the news
- If you cannot find breaking news from today, say so honestly"""
    )
    chat.with_model("gemini", "gemini-3-flash-preview")
    return chat


def _get_writer_chat(session_id: str) -> LlmChat:
    chat = LlmChat(
        api_key=API_KEY,
        session_id=session_id,
        system_message="""You are an expert health data journalist writing for United Rehabs (unitedrehabs.com), a global addiction statistics resource. Write authoritative, story-driven content optimized for Google ranking and AI citation.

WRITING RULES:
- Write like the New York Times — story first, data woven in naturally
- Start with a summary box (2-3 sentences)
- Use H2 headings for major sections, H3 for subsections
- 800+ words minimum, aim for topical authority
- Keep paragraphs short (2-3 sentences max) with generous spacing
- Include exact statistics with source attribution: "According to [SOURCE] [YEAR]..."
- Use bold for key numbers and names
- Include a Table of Contents at the top
- Include a "Further Reading and Sources" section at the end with real URLs
- Include 3-4 FAQ items optimized for Google FAQ rich snippets
- End with crisis helpline section using the EXACT helplines provided in the prompt (localized to article's countries)

INTERNAL LINKING RULES (CRITICAL):
- Each country/state name should appear as a link ONLY ONCE (first mention only)
- Use format: <a href="/country-slug-addiction-stats">Country Name</a>
- Do NOT link the same name multiple times — Google penalizes over-linking
- Prefer linking in context where the name naturally appears
- Do NOT force stats into the narrative — let data support the story

CONTENT QUALITY RULES:
- Do NOT make up facts - only use verifiable public information
- Every statistic must cite its source (CDC, WHO, DEA, SAMHSA, UNODC)
- Tell the human story - who, what, when, where, why
- Provide unique analysis/angle that other news sites don't cover
- Connect news to data naturally, don't force it
- NEVER use em dashes. Use hyphens (-) only
- NEVER use AI writing patterns (e.g., "In conclusion", "It's worth noting", "Let's dive in")

HUMAN WRITING STYLE (CRITICAL - violating these will get the article rejected):
- Write like a beat reporter at a local newspaper, not an AI
- Start with the hard news: who did what, where, when. First sentence must have a real fact.
- Short paragraphs. 2-3 sentences max. Vary sentence length.
- Use "said" not "stated" or "noted" or "expressed" or "emphasized"
- NEVER use em dashes (—). Use hyphens (-) or commas instead.
- NEVER start a sentence with "This" referring to the whole situation
- NEVER use these phrases: "it's worth noting", "in conclusion", "let's dive in", "amid growing concerns", "sheds light on", "in the wake of", "moving forward", "it remains to be seen", "a growing body of evidence", "navigating the complexities", "at the end of the day", "deep dive", "unpack", "holistic approach", "stakeholders", "paradigm shift", "game changer", "groundbreaking"
- Use active voice: "DEA seized 500kg" not "500kg was seized"
- Include one unexpected detail or human angle
- No hedging. Don't say "may potentially" — say what happened.

OUTPUT FORMAT: Return valid JSON with these fields:
{
  "title": "SEO title under 60 chars",
  "slug": "url-friendly-slug-NO-YEAR-in-slug",
  "excerpt": "155 char meta description",
  "content": "Full HTML article content",
  "meta_title": "SEO title under 60 chars",
  "meta_description": "155 char description with key stat",
  "meta_keywords": "comma separated keywords",
  "tags": ["tag1", "tag2"],
  "read_time": "X min read",
  "faq_items": [{"question": "...", "answer": "..."}],
  "related_countries": ["USA", "GBR"],
  "related_states": ["CA", "NY"]
}"""
    )
    chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
    return chat


async def stage_research(topic_hint: Optional[str] = None, db=None) -> Dict:
    """Stage 1: Research REAL breaking news from last 24 hours using web search + Gemini analysis"""
    import aiohttp
    from datetime import datetime, timezone

    session_id = f"research-{uuid.uuid4().hex[:8]}"
    today = datetime.now(timezone.utc)
    day_of_week = today.weekday()  # 0=Mon, 6=Sun

    # Tier rotation by day of week
    schedule = TIER_SCHEDULE.get(day_of_week, TIER_SCHEDULE[0])
    search_queries = schedule["queries"]
    tier = schedule["tier"]
    focus = schedule["focus"]

    # State rotation on Tuesdays
    if tier == "T1-states" and db is not None:
        # Find least-recently covered states
        covered = await db.auto_news_log.find(
            {"status": "published", "tier": "T1-states"},
            {"_id": 0, "focus_states": 1, "created_at": 1}
        ).sort("created_at", -1).to_list(50)
        recently_covered = set()
        for log in covered:
            for s in (log.get("focus_states") or []):
                recently_covered.add(s)
        uncovered = [s for s in US_STATES if s not in recently_covered]
        if not uncovered:
            uncovered = US_STATES  # Reset rotation
        target_states = uncovered[:5]
        search_queries = [q.replace("{state}", s) for q in search_queries for s in target_states]
        focus = ", ".join(target_states)
    else:
        search_queries = [q for q in search_queries if "{state}" not in q]

    # Check daily article cap
    if db is not None:
        today_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
        today_count = await db.articles.count_documents({
            "content_type": "news", "is_published": True,
            "published_at": {"$gte": today_start}
        })
        if today_count >= DAILY_ARTICLE_CAP:
            return {"stage": "research", "topics": [], "skipped": True, "reason": f"Daily cap reached ({today_count}/{DAILY_ARTICLE_CAP})", "tier": tier}

    if topic_hint:
        search_queries = [f"{topic_hint} news today"]

    # Use Google News RSS for real-time news - ONLY last 24 hours
    news_items = []
    from email.utils import parsedate_to_datetime
    now = datetime.now(timezone.utc)
    try:
        async with aiohttp.ClientSession() as session:
            for query in search_queries:
                url = f"https://news.google.com/rss/search?q={query.replace(' ', '+')}&hl=en-US&gl=US&ceid=US:en"
                try:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                        if resp.status == 200:
                            text = await resp.text()
                            import re as _re
                            items = _re.findall(r'<item>.*?<title>(.*?)</title>.*?<link>(.*?)</link>.*?<pubDate>(.*?)</pubDate>.*?</item>', text, _re.DOTALL)
                            for title, link, pub_date in items[:10]:
                                try:
                                    pub_dt = parsedate_to_datetime(pub_date.strip())
                                    age_hours = (now - pub_dt).total_seconds() / 3600
                                    # MUST be from 2026 and within search window
                                    if pub_dt.year < 2026 or age_hours > NEWS_SEARCH_WINDOW_HOURS:
                                        continue
                                except:
                                    continue
                                news_items.append({"title": title.strip(), "link": link.strip(), "date": pub_date.strip(), "age_hours": round(age_hours, 1)})
                except:
                    continue
    except:
        pass

    if not news_items:
        return {"stage": "research", "topics": [], "error": "No news found from web search", "tier": tier}

    # Known major news YouTube channels — prioritize these for credibility + views
    TRUSTED_CHANNELS = [
        "BBC News", "CNN", "CNBC", "Fox News", "ABC News", "CBS News", "NBC News",
        "Reuters", "Al Jazeera", "Sky News", "FRANCE 24", "DW News", "WION",
        "The Guardian", "Vice News", "The Telegraph", "Channel 4 News",
        "PBS NewsHour", "Associated Press", "Bloomberg", "MSNBC",
    ]
    TRUSTED_LOWER = [c.lower() for c in TRUSTED_CHANNELS]

    BLOCKED_CHANNELS = [
        "real life narcos", "true crime daily", "crime watch", "mugshot",
        "arrest compilation", "police activity", "body cam", "dash cam",
    ]
    BLOCKED_LOWER = [c.lower() for c in BLOCKED_CHANNELS]

    async def _find_trending_video(query: str, prefer_channels: bool = True) -> tuple:
        """Search YouTube + Google for trending video from major media channels.
        Returns (video_id, channel_name) or (None, None).
        Strategy: 1) YouTube with trusted channel preference, 2) Google video search, 3) fallback.
        Uses httpx (installed) with aiohttp as fallback.
        """
        import httpx
        ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        yt_query = query.replace(" ", "+").replace("'", "")
        last_seen = []
        last_channels = []

        async with httpx.AsyncClient(timeout=15, headers={"User-Agent": ua}, follow_redirects=True) as client:
            # --- Strategy 1: YouTube search (multiple query variations) ---
            search_queries_yt = [
                yt_query,                                                           # exact headline
                "+".join(yt_query.split("+")[:4]) + "+news",                       # shorter + news
            ]
            for sq in search_queries_yt:
                for sp_filter in ["", "EgIQAQ%3D%3D"]:  # no filter, then Video type only
                    try:
                        url = f"https://www.youtube.com/results?search_query={sq}"
                        if sp_filter:
                            url += f"&sp={sp_filter}"
                        resp = await client.get(url)
                        if resp.status_code == 200:
                            html = resp.text
                            video_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
                            channel_names = re.findall(r'"ownerText":\{"runs":\[\{"text":"([^"]+)"', html)

                            seen = []
                            for vid in video_ids:
                                if vid not in seen:
                                    seen.append(vid)
                                if len(seen) >= 10:
                                    break

                            last_seen = seen
                            last_channels = channel_names

                            if prefer_channels and channel_names:
                                # Pick video from a trusted news channel
                                for i, vid in enumerate(seen):
                                    if i < len(channel_names):
                                        ch = channel_names[i].lower()
                                        # Skip blocked channels
                                        if any(blocked in ch for blocked in BLOCKED_LOWER):
                                            continue
                                        for trusted in TRUSTED_LOWER:
                                            if trusted in ch or ch in trusted:
                                                return (vid, channel_names[i])
                    except:
                        continue

            # --- Strategy 2: Google video search (trending videos across web) ---
            try:
                google_url = f"https://www.google.com/search?q={yt_query}&tbm=vid&tbs=qdr:w"
                resp = await client.get(google_url)
                if resp.status_code == 200:
                    yt_matches = re.findall(r'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})', resp.text)
                    if yt_matches:
                        return (yt_matches[0], "Google Trending")
            except:
                pass

        # --- Fallback: first YouTube result (most relevant), skip blocked ---
        if last_seen:
            for i, vid in enumerate(last_seen):
                channel_name = last_channels[i] if i < len(last_channels) else "Unknown"
                ch_lower = (channel_name or "").lower()
                if any(blocked in ch_lower for blocked in BLOCKED_LOWER):
                    continue
                return (vid, channel_name)

        return (None, None)

    youtube_videos = {}

    # Use Gemini to pick the best 3 stories for our site
    chat = _get_research_chat(session_id)

    news_list = "\n".join([f"- {n['title']} | URL: {n['link']} | {n['date']}" for n in news_items[:15]])

    # Build a lookup for matching titles to URLs
    news_lookup = {n['title'].lower().strip(): n['link'] for n in news_items}

    # Get existing articles to avoid duplicates
    existing_titles = []
    if db is not None:
        existing = await db.articles.find(
            {"content_type": "news", "is_published": True}, {"_id": 0, "title": 1}
        ).to_list(50)
        existing_titles = [a['title'] for a in existing]

    prompt = f"""From these REAL news headlines from the last 24 hours, pick the 3 best stories for our addiction data website.

TODAY'S NEWS:
{news_list}

FOCUS: {focus} ({schedule["label"]})

ALREADY PUBLISHED (skip these): {json.dumps(existing_titles)}

Pick stories that are:
1. About drugs, addiction, cartels, overdoses, drug policy, or substance abuse
2. From the LAST 24 HOURS
3. Newsworthy and would attract readers

Return JSON array: [{{"title": "headline", "what_happened": "1-2 sentences", "source_headline": "original headline from list above", "source_url": "URL from list above", "related_countries": ["USA"], "related_states": ["CA"], "target_keywords": ["keyword1"]}}]"""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)

    try:
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            topics = json.loads(json_match.group())
        else:
            topics = [{"title": news_items[0]["title"], "what_happened": "", "source_url": news_items[0].get("link",""), "related_countries": ["USA"], "related_states": [], "target_keywords": []}]
    except:
        topics = [{"title": news_items[0]["title"], "what_happened": "", "source_url": news_items[0].get("link",""), "related_countries": ["USA"], "related_states": [], "target_keywords": []}]

    # Same-run dedup: remove topics that are too similar to each other
    deduped = []
    for t in topics:
        is_dup = False
        for d in deduped:
            if _jaccard_similarity(t.get("title", ""), d.get("title", "")) > 0.5:
                is_dup = True
                break
        if not is_dup:
            deduped.append(t)
    topics = deduped

    # Ensure each topic has a source_url and matching YouTube video
    for i, t in enumerate(topics):
        if not t.get("source_url"):
            src = t.get("source_headline", "").lower().strip()
            t["source_url"] = news_lookup.get(src, news_items[0].get("link", "") if news_items else "")
        # Find trending video from major media channels (Google + YouTube + news channels)
        topic_headline = t.get("source_headline", t.get("title", ""))
        yt_id, yt_channel = await _find_trending_video(topic_headline, prefer_channels=True)

        # Fallback: try shorter query if exact headline didn't work
        if not yt_id:
            short_query = " ".join(topic_headline.split()[:5]) + " news"
            yt_id, yt_channel = await _find_trending_video(short_query, prefer_channels=True)

        # Last resort: use any video from initial broad search
        if not yt_id and youtube_videos:
            yt_id = list(youtube_videos.keys())[0]
            yt_channel = "Fallback"

        if yt_id:
            t["youtube_id"] = yt_id
            t["youtube_channel"] = yt_channel or "Unknown"
            print(f"[Pipeline] Topic '{topic_headline[:50]}' → YouTube: {yt_id} from {yt_channel}")

    return {"stage": "research", "topics": topics, "raw_news_count": len(news_items), "tier": tier, "session_id": session_id}


async def _fetch_article_text(url: str) -> str:
    """Fetch and extract text from a news article URL"""
    import aiohttp
    try:
        async with aiohttp.ClientSession() as session:
            headers = {"User-Agent": "Mozilla/5.0 (compatible; UnitedRehabs/1.0)"}
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=15), headers=headers) as resp:
                if resp.status == 200:
                    html = await resp.text()
                    # Strip HTML tags, keep text
                    import re as _re
                    text = _re.sub(r'<script[^>]*>.*?</script>', '', html, flags=_re.DOTALL)
                    text = _re.sub(r'<style[^>]*>.*?</style>', '', text, flags=_re.DOTALL)
                    text = _re.sub(r'<[^>]+>', ' ', text)
                    text = _re.sub(r'\s+', ' ', text).strip()
                    # Return first 3000 chars (enough context)
                    return text[:3000]
    except:
        pass
    return ""

async def _fetch_multiple_sources(topic_title: str) -> str:
    """Search Google News for multiple sources on same story for comprehensive coverage"""
    import aiohttp
    sources = []
    try:
        query = topic_title.replace(" ", "+")
        url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    text = await resp.text()
                    import re as _re
                    items = _re.findall(r'<item>.*?<title>(.*?)</title>.*?<link>(.*?)</link>.*?</item>', text, _re.DOTALL)
                    for title, link in items[:3]:
                        article_text = await _fetch_article_text(link.strip())
                        if article_text and len(article_text) > 200:
                            sources.append(f"SOURCE: {title.strip()}\n{article_text[:1500]}")
    except:
        pass
    return "\n\n---\n\n".join(sources) if sources else ""



async def stage_write(topic: Dict, db=None) -> Dict:
    """Stage 2: Write article based on REAL source content"""
    session_id = f"write-{uuid.uuid4().hex[:8]}"
    chat = _get_writer_chat(session_id)

    # CRITICAL: Fetch MULTIPLE real sources for comprehensive, accurate coverage
    source_text = ""
    source_url = topic.get("link", "") or topic.get("source_url", "")
    if source_url:
        source_text = await _fetch_article_text(source_url)

    # Fetch 2-3 additional sources on same topic for cross-referencing
    multi_sources = await _fetch_multiple_sources(topic.get("title", ""))

    # Get relevant stats from DB for accuracy
    db_context = ""
    if db is not None:
        countries = topic.get("related_countries", ["USA"])
        for code in countries[:3]:
            stats = await db.country_statistics.find_one(
                {"country_code": code, "year": 2025}, {"_id": 0, "country_name": 1, "total_affected": 1, "drug_overdose_deaths": 1, "treatment_centers": 1}
            )
            if stats:
                db_context += f"\n{code} (2025): {json.dumps(stats, default=str)}"

        states = topic.get("related_states", [])
        for sid in states[:3]:
            stats = await db.state_addiction_statistics.find_one(
                {"state_id": sid, "year": 2025}, {"_id": 0, "state_name": 1, "total_affected": 1, "overdose_deaths": 1, "recovery_rate": 1}
            )
            if stats:
                db_context += f"\n{sid} (2025): {json.dumps(stats, default=str)}"

    source_context = f"""
PRIMARY SOURCE (write based on these facts):
{source_text[:2500] if source_text else 'Primary source could not be fetched.'}

ADDITIONAL SOURCES (cross-reference for accuracy):
{multi_sources[:3000] if multi_sources else 'No additional sources.'}

CRITICAL: Only write facts that appear in at LEAST one source above. If sources conflict, note the discrepancy. Do NOT invent details.
"""

    # Build localized crisis helplines for this article's countries
    related_countries = topic.get('related_countries', ['USA'])
    helplines_text = _get_helplines_for_countries(related_countries)

    prompt = f"""Write a news article for our addiction data website based on this REAL story:

HEADLINE: {topic.get('title', '')}
WHAT HAPPENED: {topic.get('what_happened', '')}
{source_context}
TARGET KEYWORDS: {json.dumps(topic.get('target_keywords', []))}
RELATED COUNTRIES: {json.dumps(related_countries)}
RELATED STATES: {json.dumps(topic.get('related_states', []))}

DATABASE STATS (use if relevant):
{db_context if db_context else 'No database stats available'}

CRISIS HELPLINES (include these EXACT numbers at the end):
{helplines_text}

REQUIREMENTS:
- 800-1200 words
- Start with summary box containing 3-4 key stats
- Include Table of Contents (use H2 headings)
- 3 FAQ items at the end (optimized for Google FAQ rich snippets)
- Include "Data Sources" section with real sources (CDC, WHO, SAMHSA, UNODC, EMCDDA)
- Every statistic must cite its source
- Content must be factual and citable by AI systems
- End with "If You Need Help" section using the EXACT crisis helplines above

Return ONLY valid JSON."""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)

    # Parse JSON response
    try:
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            article = json.loads(json_match.group())
        else:
            return {"stage": "write", "error": "Failed to parse article JSON", "raw": response[:500]}
    except Exception as e:
        return {"stage": "write", "error": f"JSON parse error: {str(e)}", "raw": response[:500]}

    # Enforce human writing style
    if article.get("content"):
        article["content"] = _clean_ai_patterns(article["content"])
    if article.get("title"):
        article["title"] = _clean_ai_patterns(article["title"])
    if article.get("excerpt"):
        article["excerpt"] = _clean_ai_patterns(article["excerpt"])

    # Video is preferred but not mandatory - use stock image fallback
    yt_id = topic.get("youtube_id", "")
    if yt_id and article.get("content"):
        video_html = f'<div style="margin: 2rem 0; border-radius: 12px; overflow: hidden;"><div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.youtube.com/embed/{yt_id}" title="Related video" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>'
        content = article["content"]
        for marker in ['</nav>', '</h2>']:
            pos = content.find(marker)
            if pos > 0:
                insert_at = pos + len(marker)
                content = content[:insert_at] + '\n' + video_html + '\n' + content[insert_at:]
                break
        else:
            p_end = content.find('</p>')
            if p_end > 0:
                insert_at = p_end + 4
                content = content[:insert_at] + '\n' + video_html + '\n' + content[insert_at:]
        article["content"] = content
    # If no video, article still publishes with featured image only

    # Fetch unique featured image (never duplicates another article)
    featured_image = await _get_unique_image(article.get("slug", ""), db)
    article["featured_image_url"] = featured_image

    return {"stage": "write", "article": article, "session_id": session_id}


async def stage_qa(article: Dict, db=None) -> Dict:
    """Stage 3: QA - validate facts, links, SEO fields"""
    issues = []
    warnings = []

    # SEO field validation
    title = article.get("meta_title") or article.get("title", "")
    if len(title) > 65:
        issues.append(f"Title too long: {len(title)} chars (max 60)")
    if len(title) < 20:
        issues.append(f"Title too short: {len(title)} chars (min 20)")

    desc = article.get("meta_description") or article.get("excerpt", "")
    if len(desc) > 160:
        warnings.append(f"Meta description long: {len(desc)} chars (ideal <155)")
    if len(desc) < 50:
        issues.append(f"Meta description too short: {len(desc)} chars")

    if not article.get("slug"):
        issues.append("Missing slug")

    if not article.get("content"):
        issues.append("Missing content")

    if not article.get("tags") or len(article.get("tags", [])) < 2:
        warnings.append("Less than 2 tags")

    if not article.get("faq_items") or len(article.get("faq_items", [])) < 2:
        warnings.append("Less than 2 FAQ items")

    if not article.get("meta_keywords"):
        warnings.append("Missing meta keywords")

    # Content quality checks
    content = article.get("content", "")
    if len(content) < 500:
        issues.append(f"Content too short: {len(content)} chars (min 500)")

    # Check for data source citations
    source_terms = ["CDC", "WHO", "SAMHSA", "UNODC", "EMCDDA", "NSDUH", "WONDER"]
    found_sources = [s for s in source_terms if s in content]
    if not found_sources:
        issues.append("No data source citations found in content")

    # Check H2 headings exist
    if "<h2" not in content.lower():
        warnings.append("No H2 headings in content")

    # Check for duplicate internal links (each name should link only once)
    import re as _re
    link_hrefs = _re.findall(r'href="(/[^"]*-addiction-stats[^"]*)"', content)
    seen_links = set()
    for href in link_hrefs:
        if href in seen_links:
            issues.append(f"Duplicate internal link: {href} — each name should link only ONCE")
        seen_links.add(href)

    # Validate internal links would resolve
    if db is not None:
        countries = article.get("related_countries", [])
        for code in countries:
            exists = await db.countries.find_one({"country_code": code}, {"_id": 0, "country_code": 1})
            if not exists:
                issues.append(f"Invalid related_country: {code}")

        states = article.get("related_states", [])
        for sid in states:
            exists = await db.state_addiction_statistics.find_one({"state_id": sid}, {"_id": 0, "state_id": 1})
            if not exists:
                warnings.append(f"No data for related_state: {sid}")

    # Check for duplicate slug
    if db is not None and article.get("slug"):
        existing = await db.articles.find_one({"slug": article["slug"], "content_type": "news"})
        if existing:
            warnings.append(f"Slug already exists: {article['slug']} - will update existing")

    # Fuzzy duplicate detection (Rule 1) - check title similarity against recent articles
    if db is not None:
        recent_articles = await db.articles.find(
            {"content_type": "news", "is_published": True},
            {"_id": 0, "title": 1}
        ).sort("created_at", -1).to_list(50)
        existing_titles = [a["title"] for a in recent_articles if a.get("title")]
        if _is_duplicate(article.get("title", ""), existing_titles):
            issues.append(f"Fuzzy duplicate detected: title is >60% similar to an existing article")

    # Missing featured image
    if not article.get("featured_image_url"):
        warnings.append("No featured image - social sharing will use default OG image")

    passed = len(issues) == 0
    return {
        "stage": "qa",
        "passed": passed,
        "issues": issues,
        "warnings": warnings,
        "score": max(0, 100 - len(issues) * 20 - len(warnings) * 5)
    }


async def stage_launch(article: Dict, db=None) -> Dict:
    """Stage 4: Publish article and add to sitemap"""
    if db is None:
        return {"stage": "launch", "error": "No database connection"}

    # DEDUP CHECK: reject if similar title already exists in DB
    title_prefix = article.get("title", "")[:40].lower()
    if title_prefix:
        existing = await db.articles.find(
            {"content_type": "news", "is_published": True},
            {"_id": 0, "title": 1, "slug": 1}
        ).to_list(200)
        for ex in existing:
            if ex.get("title", "")[:40].lower() == title_prefix:
                return {"stage": "launch", "error": f"Duplicate: similar article already exists ({ex.get('slug')})"}

    article_data = {
        "title": article.get("title", ""),
        "slug": article.get("slug", ""),
        "excerpt": article.get("excerpt", article.get("meta_description", "")),
        "content": article.get("content", ""),
        "content_type": "news",
        "author_name": "United Rehabs Data Team",
        "tags": article.get("tags", []),
        "meta_title": article.get("meta_title", article.get("title", "")),
        "meta_description": article.get("meta_description", ""),
        "meta_keywords": article.get("meta_keywords", ""),
        "related_countries": article.get("related_countries", []),
        "related_states": article.get("related_states", []),
        "faq_items": article.get("faq_items", []),
        "read_time": article.get("read_time", "5 min read"),
        "featured_image_url": article.get("featured_image_url", ""),
        "youtube_video_id": article.get("youtube_id", ""),
        "is_published": True,
        "is_featured": False,
        "sort_order": 0,
        "share_count": 0,
    }

    # Check if exists (update) or new (create)
    existing = await db.articles.find_one({"slug": article_data["slug"], "content_type": "news"})
    if existing:
        article_data["updated_at"] = datetime.now(timezone.utc)
        await db.articles.update_one({"id": existing["id"]}, {"$set": article_data})
        article_id = existing["id"]
        action = "updated"
    else:
        article_data["id"] = str(uuid.uuid4())
        article_data["published_at"] = datetime.now(timezone.utc)
        article_data["created_at"] = datetime.now(timezone.utc)
        article_data["updated_at"] = datetime.now(timezone.utc)
        article_data["views_count"] = 0
        await db.articles.insert_one(article_data)
        article_id = article_data["id"]
        action = "created"

    # Clear sitemap cache so new article appears
    from server import _sitemap_caches
    _sitemap_caches.clear()  # Clear all sub-sitemap caches

    # Ping Google to re-crawl sitemap
    try:
        import httpx
        async with httpx.AsyncClient(timeout=10) as ping_client:
            sitemap_url = "https://unitedrehabs.com/api/seo/sitemap.xml"
            await ping_client.get(f"https://www.google.com/ping?sitemap={sitemap_url}")
            await ping_client.get(f"https://www.bing.com/ping?sitemap={sitemap_url}")
            logger.info(f"[Pipeline] Pinged Google & Bing sitemaps")
    except Exception as e:
        logger.warning(f"[Pipeline] Sitemap ping failed: {e}")

    return {
        "stage": "launch",
        "action": action,
        "article_id": article_id,
        "url": f"/news/{article_data['slug']}",
        "published_at": datetime.now(timezone.utc).isoformat()
    }


async def run_pipeline(topic_hint: Optional[str] = None, auto_publish: bool = False, db=None) -> Dict:
    """Run the full content pipeline: Research → Write → QA → Launch"""
    result = {"stages": {}, "final_status": "pending"}

    # Stage 1: Research
    research = await stage_research(topic_hint, db)
    result["stages"]["research"] = research

    if not research.get("topics"):
        result["final_status"] = "failed_research"
        return result

    # Try each topic until one succeeds (has video + passes QA)
    topics = research.get("topics", [])
    
    # Pre-check: get existing titles from DB to skip duplicates BEFORE calling Claude
    existing_titles = []
    if db is not None:
        recent = await db.articles.find(
            {"content_type": "news", "is_published": True},
            {"_id": 0, "title": 1}
        ).sort("created_at", -1).to_list(100)
        existing_titles = [a["title"] for a in recent if a.get("title")]
    
    for topic in topics:
        # EARLY DEDUP: skip topic if too similar to existing article (saves LLM credits)
        if _is_duplicate(topic.get("title", ""), existing_titles):
            result["stages"]["write"] = {"skipped": True, "reason": f"Duplicate topic: {topic.get('title','')[:50]}"}
            continue
        
        # Stage 2: Write
        write = await stage_write(topic, db)
        result["stages"]["write"] = {k: v for k, v in write.items() if k != "article"}

        if write.get("error"):
            continue  # Try next topic

        article = write["article"]
        result["article_preview"] = {
            "title": article.get("title"),
            "slug": article.get("slug"),
            "excerpt": article.get("excerpt"),
            "tags": article.get("tags"),
            "word_count": len(article.get("content", "").split()),
        }

        # Stage 3: QA
        qa = await stage_qa(article, db)
        result["stages"]["qa"] = qa

        if not qa["passed"] and not auto_publish:
            continue  # Try next topic

        # Stage 4: Launch
        if qa["passed"] or auto_publish:
            launch = await stage_launch(article, db)
            result["stages"]["launch"] = launch
            result["final_status"] = "published"
            result["url"] = launch.get("url")
            return result

    # All topics failed
    result["final_status"] = "failed_all_topics"
    return result
