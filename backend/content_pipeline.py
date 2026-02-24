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
    chat = LlmChat(
        api_key=API_KEY,
        session_id=session_id,
        system_message="You are an addiction data research analyst. Your job is to identify trending topics in addiction, substance abuse, and public health that would make high-ranking SEO content. Focus on data-driven topics with specific statistics."
    )
    chat.with_model("gemini", "gemini-3-flash-preview")
    return chat


def _get_writer_chat(session_id: str) -> LlmChat:
    chat = LlmChat(
        api_key=API_KEY,
        session_id=session_id,
        system_message="""You are an expert health data journalist writing for United Rehabs (unitedrehabs.com), a global addiction statistics resource. Write authoritative, data-driven content optimized for Google ranking and AI citation.

WRITING RULES:
- Start with a concise summary paragraph (2-3 sentences with key numbers)
- Use H2 headings for major sections
- Include exact statistics with source attribution: "According to [SOURCE] [YEAR]..."
- Use bullet points for data lists
- Write in active voice, present tense
- Include a "Data Sources" section at the end
- Keep paragraphs short (2-3 sentences max)
- Use bold for key statistics

OUTPUT FORMAT: Return valid JSON with these fields:
{
  "title": "SEO title under 60 chars",
  "slug": "url-friendly-slug",
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
    """Stage 1: Research trending topics using Gemini"""
    session_id = f"research-{uuid.uuid4().hex[:8]}"
    chat = _get_research_chat(session_id)

    # Get context from DB
    context_parts = []
    if db is not None:
        # Get recent stats for context
        top_states = await db.state_addiction_statistics.find(
            {"year": 2025}, {"_id": 0, "state_name": 1, "overdose_deaths": 1, "total_affected": 1}
        ).sort("overdose_deaths", -1).limit(5).to_list(5)
        if top_states:
            context_parts.append(f"Top US states by overdose deaths (2025): {json.dumps(top_states, default=str)}")

        # Get existing articles to avoid duplicates
        existing = await db.articles.find(
            {"content_type": "news", "is_published": True}, {"_id": 0, "title": 1, "slug": 1}
        ).to_list(50)
        if existing:
            context_parts.append(f"Already published articles (avoid duplicates): {json.dumps([a['title'] for a in existing])}")

    prompt = f"""Generate 3 trending topic ideas for addiction/substance abuse news articles that would rank well on Google.

Context from our database:
{chr(10).join(context_parts) if context_parts else 'No context available'}

{f'User suggested topic area: {topic_hint}' if topic_hint else 'Find topics that are currently trending or have high search volume.'}

For each topic, provide:
1. Title (SEO optimized, under 60 chars)
2. Why it would rank (search intent)
3. Key data points to include
4. Target keywords
5. Related countries/states

Return as JSON array of objects with fields: title, search_intent, key_data_points, target_keywords, related_countries, related_states"""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)

    # Parse response
    try:
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            topics = json.loads(json_match.group())
        else:
            topics = [{"title": topic_hint or "Addiction Statistics Update", "search_intent": "informational", "key_data_points": [], "target_keywords": [], "related_countries": ["USA"], "related_states": []}]
    except:
        topics = [{"title": topic_hint or "Addiction Statistics Update", "search_intent": "informational", "key_data_points": [], "target_keywords": [], "related_countries": ["USA"], "related_states": []}]

    return {"stage": "research", "topics": topics, "session_id": session_id}


async def stage_write(topic: Dict, db=None) -> Dict:
    """Stage 2: Write article using Claude Sonnet 4.5"""
    session_id = f"write-{uuid.uuid4().hex[:8]}"
    chat = _get_writer_chat(session_id)

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

    prompt = f"""Write a comprehensive, SEO-optimized news article on this topic:

TOPIC: {topic.get('title', '')}
SEARCH INTENT: {topic.get('search_intent', 'informational')}
KEY DATA POINTS TO INCLUDE: {json.dumps(topic.get('key_data_points', []))}
TARGET KEYWORDS: {json.dumps(topic.get('target_keywords', []))}
RELATED COUNTRIES: {json.dumps(topic.get('related_countries', []))}
RELATED STATES: {json.dumps(topic.get('related_states', []))}

DATABASE STATS (use these exact numbers for accuracy):
{db_context if db_context else 'No database stats available - use publicly known data from WHO/CDC/SAMHSA'}

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
    if db and article.get("slug"):
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
    if not db:
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

    # Use first topic
    topic = research["topics"][0]

    # Stage 2: Write
    write = await stage_write(topic, db)
    result["stages"]["write"] = {k: v for k, v in write.items() if k != "article"}

    if write.get("error"):
        result["final_status"] = "failed_write"
        result["stages"]["write"]["error"] = write["error"]
        return result

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

    if not qa["passed"]:
        result["final_status"] = "failed_qa"
        result["qa_issues"] = qa["issues"]
        if not auto_publish:
            return result

    # Stage 4: Launch (only if QA passed or auto_publish forced)
    if qa["passed"] or auto_publish:
        launch = await stage_launch(article, db)
        result["stages"]["launch"] = launch
        result["final_status"] = "published"
        result["url"] = launch.get("url")
    else:
        result["final_status"] = "blocked_by_qa"

    return result
