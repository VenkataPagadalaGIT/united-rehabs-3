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
from emergentintegrations.llm.chat import LlmChat, UserMessage

API_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# All valid state/country slugs for internal link validation
VALID_LINK_PATTERNS = []  # populated at runtime


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
- End with crisis helpline note (988 and SAMHSA 1-800-662-4357)

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
    
    # Mon-Thu: Tier 1 (USA, Canada, UK, Australia, Germany)
    # Fri-Sun: Tier 2 & 3 (rest of world)
    if day_of_week <= 3:  # Monday-Thursday
        search_queries = [
            "fentanyl news today",
            "drug overdose news today",
            "addiction policy news today",
            "drug cartel arrest news",
        ]
        tier = "tier1"
        focus = "USA, Canada, UK, Australia, Germany"
    else:  # Friday-Sunday
        search_queries = [
            "drug cartel news Mexico Colombia",
            "drug trafficking news Asia Africa",
            "addiction crisis news Europe",
            "drug policy news international",
        ]
        tier = "tier2_3"
        focus = "Mexico, Colombia, Brazil, India, Philippines, Nigeria, Southeast Asia, Europe"

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
                                    # MUST be from 2026 and within 48 hours
                                    if pub_dt.year < 2026 or age_hours > 48:
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

    # Search YouTube for a video matching the SPECIFIC story (not generic drug news)
    youtube_videos = {}
    try:
        async with aiohttp.ClientSession() as session:
            # Use the actual news headline for YouTube search
            best_title = news_items[0]["title"] if news_items else search_queries[0]
            yt_query = best_title.replace(" ", "+")
            yt_url = f"https://www.youtube.com/results?search_query={yt_query}"
            try:
                async with session.get(yt_url, timeout=aiohttp.ClientTimeout(total=10), headers={"User-Agent": "Mozilla/5.0"}) as resp:
                    if resp.status == 200:
                        html = await resp.text()
                        import re as _re
                        video_ids = _re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
                        seen = set()
                        for vid in video_ids:
                            if vid not in seen:
                                seen.add(vid)
                                youtube_videos[vid] = True
                            if len(seen) >= 3:
                                break
            except:
                pass
    except:
        pass

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

FOCUS: {focus} ({"Tier 1 countries Mon-Thu" if tier == "tier1" else "Tier 2/3 countries Fri-Sun"})

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

    # Ensure each topic has a source_url and matching YouTube video
    for i, t in enumerate(topics):
        if not t.get("source_url"):
            src = t.get("source_headline", "").lower().strip()
            t["source_url"] = news_lookup.get(src, news_items[0].get("link", "") if news_items else "")
        # Search YouTube via RSS feed (more reliable than HTML scraping)
        yt_id = None
        try:
            import aiohttp as _aio
            topic_query = t.get("source_headline", t.get("title", "")).replace(" ", "+").replace("'", "")
            yt_rss = f"https://www.youtube.com/results?search_query={topic_query}&sp=EgIIAQ%253D%253D"
            async with _aio.ClientSession() as yt_session:
                for attempt_query in [topic_query, topic_query.split("+")[0] + "+drug+news"]:
                    try:
                        async with yt_session.get(
                            f"https://www.youtube.com/results?search_query={attempt_query}",
                            timeout=_aio.ClientTimeout(total=10),
                            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
                        ) as yt_resp:
                            if yt_resp.status == 200:
                                yt_html = await yt_resp.text()
                                yt_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', yt_html)
                                if yt_ids:
                                    yt_id = yt_ids[0]
                                    break
                    except:
                        continue
        except:
            pass
        if not yt_id and youtube_videos:
            yt_id = list(youtube_videos.keys())[0]
        if yt_id:
            t["youtube_id"] = yt_id

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

    prompt = f"""Write a news article for our addiction data website based on this REAL story:

HEADLINE: {topic.get('title', '')}
WHAT HAPPENED: {topic.get('what_happened', '')}
{source_context}
TARGET KEYWORDS: {json.dumps(topic.get('target_keywords', []))}
RELATED COUNTRIES: {json.dumps(topic.get('related_countries', []))}
RELATED STATES: {json.dumps(topic.get('related_states', []))}

DATABASE STATS (use if relevant):
{db_context if db_context else 'No database stats available'}

REQUIREMENTS:
- 800-1200 words
- Start with summary box containing 3-4 key stats
- Include Table of Contents (use H2 headings)
- 3 FAQ items at the end (optimized for Google FAQ rich snippets)
- Include "Data Sources" section with real sources (CDC, WHO, SAMHSA, UNODC, EMCDDA)
- Every statistic must cite its source
- Content must be factual and citable by AI systems

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

    # MANDATORY: YouTube video must be embedded
    yt_id = topic.get("youtube_id", "")
    if not yt_id:
        return {"stage": "write", "error": "No YouTube video found - article rejected (video is mandatory)"}
    
    if article.get("content"):
        video_html = f'<div style="margin: 2rem 0; border-radius: 12px; overflow: hidden;"><div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.youtube.com/embed/{yt_id}" title="Related video" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>'
        content = article["content"]
        # Insert after </nav> or after first </h2> or after first </p>
        for marker in ['</nav>', '</h2>']:
            pos = content.find(marker)
            if pos > 0:
                insert_at = pos + len(marker)
                content = content[:insert_at] + '\n' + video_html + '\n' + content[insert_at:]
                break
        else:
            # Fallback: insert after first paragraph
            p_end = content.find('</p>')
            if p_end > 0:
                insert_at = p_end + 4
                content = content[:insert_at] + '\n' + video_html + '\n' + content[insert_at:]
        article["content"] = content

    # Remove em dashes
    if article.get("content"):
        article["content"] = article["content"].replace("\u2014", " - ").replace("&mdash;", " - ")

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
        "is_published": True,
        "is_featured": False,
        "sort_order": 0,
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
    from server import _sitemap_cache
    _sitemap_cache["xml"] = None
    _sitemap_cache["generated_at"] = 0

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
    for topic in topics:
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
