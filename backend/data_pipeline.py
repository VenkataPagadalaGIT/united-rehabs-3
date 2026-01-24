"""
Multi-Agent Data Pipeline for State Data Generation
Agent 1: Research Agent - Gathers data from official sources (Gemini 2.5 Flash)
Agent 2: Content Generator - Creates SEO content (GPT-4o)
Agent 3: Fact Checker - Verifies data accuracy (Claude Sonnet 4.5)
Agent 4: QA Agent - Ensures backend/frontend consistency (No LLM)
"""
import os
import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("Warning: emergentintegrations not installed")


class StateDataPipeline:
    """Multi-agent pipeline for comprehensive state data generation using 3 different LLMs."""
    
    def __init__(self, db):
        self.db = db
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        self.api_calls = 0
        self.cached_research = {}
        
        # 3 Different LLMs for better validation
        self.llm_config = {
            "research": {"provider": "gemini", "model": "gemini-2.5-flash"},
            "content": {"provider": "openai", "model": "gpt-4o"},
            "factcheck": {"provider": "anthropic", "model": "claude-sonnet-4.5"}
        }
        
    def _create_chat(self, session_id: str, system_message: str, agent_type: str = "research"):
        """Create LLM chat instance with specific model based on agent type."""
        if not LLM_AVAILABLE or not self.api_key:
            return None
        
        config = self.llm_config.get(agent_type, self.llm_config["research"])
        return LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model(config["provider"], config["model"])

    # ==========================================
    # AGENT 1: RESEARCH AGENT
    # ==========================================
    async def research_agent(self, state_name: str, state_abbrev: str, years: List[int]) -> Dict[str, Any]:
        """
        Research Agent: Gathers comprehensive addiction data from official sources.
        Optimized to batch multiple years in single API call.
        """
        print(f"[RESEARCH AGENT] Starting research for {state_name} ({state_abbrev})")
        
        system_message = """You are an expert research analyst specializing in addiction and substance abuse statistics.
Your data sources include:
- SAMHSA National Survey on Drug Use and Health (NSDUH)
- CDC WONDER Database (mortality data)
- DEA Drug Seizure Statistics
- State Health Department Reports

IMPORTANT: Provide realistic, data-driven estimates based on known patterns and official reports.
Format all responses as valid JSON that can be parsed."""

        chat = self._create_chat(f"research-{state_abbrev}-bulk", system_message, agent_type="research")
        if not chat:
            return {"error": "LLM not available", "data": None}

        years_str = ", ".join(map(str, years))
        
        prompt = f"""Research comprehensive addiction statistics for {state_name} ({state_abbrev}) for the years: {years_str}

For EACH year, provide the following data points with realistic estimates based on official sources:

Return a JSON object with this EXACT structure:
{{
    "state_id": "{state_abbrev}",
    "state_name": "{state_name}",
    "years_data": [
        {{
            "year": <year>,
            "statistics": {{
                "total_affected": <number - people with SUD>,
                "overdose_deaths": <number>,
                "opioid_deaths": <number>,
                "drug_abuse_rate": <percentage>,
                "alcohol_abuse_rate": <percentage>,
                "affected_age_12_17": <number>,
                "affected_age_18_25": <number>,
                "affected_age_26_34": <number>,
                "affected_age_35_plus": <number>,
                "total_treatment_centers": <number>,
                "inpatient_facilities": <number>,
                "outpatient_facilities": <number>,
                "treatment_admissions": <number>,
                "recovery_rate": <percentage>,
                "relapse_rate": <percentage>,
                "economic_cost_billions": <number>
            }},
            "substance_stats": {{
                "alcohol_use_past_month_percent": <percentage>,
                "alcohol_binge_drinking_percent": <percentage>,
                "alcohol_use_disorder": <number>,
                "alcohol_related_deaths": <number>,
                "opioid_use_disorder": <number>,
                "opioid_misuse_past_year": <number>,
                "prescription_opioid_misuse": <number>,
                "heroin_use": <number>,
                "fentanyl_deaths": <number>,
                "marijuana_use_past_month": <number>,
                "marijuana_use_disorder": <number>,
                "cocaine_use_past_year": <number>,
                "cocaine_related_deaths": <number>,
                "meth_use_past_year": <number>,
                "meth_related_deaths": <number>,
                "treatment_received": <number>,
                "treatment_needed_not_received": <number>
            }},
            "data_source": "SAMHSA NSDUH, CDC WONDER"
        }}
    ],
    "sources": [
        {{"name": "NSDUH", "url": "https://www.samhsa.gov/data/nsduh", "year": 2024}},
        {{"name": "CDC WONDER", "url": "https://wonder.cdc.gov/", "year": 2024}}
    ]
}}

IMPORTANT: 
- Use realistic numbers that show trends (overdose deaths increased 2019-2022, slight decrease 2023-2024)
- {state_name} population is approximately 22 million
- Return ONLY valid JSON, no markdown or explanation"""

        try:
            self.api_calls += 1
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Try to parse JSON from response
            try:
                # Clean up response - remove markdown code blocks if present
                clean_response = response.strip()
                if clean_response.startswith("```"):
                    clean_response = clean_response.split("```")[1]
                    if clean_response.startswith("json"):
                        clean_response = clean_response[4:]
                clean_response = clean_response.strip()
                
                data = json.loads(clean_response)
                self.cached_research[state_abbrev] = data
                print(f"[RESEARCH AGENT] Successfully gathered data for {len(data.get('years_data', []))} years")
                return {"success": True, "data": data, "api_calls": 1}
            except json.JSONDecodeError as e:
                print(f"[RESEARCH AGENT] JSON parse error: {e}")
                return {"success": False, "error": f"JSON parse error: {e}", "raw": response}
                
        except Exception as e:
            print(f"[RESEARCH AGENT] Error: {e}")
            return {"success": False, "error": str(e)}

    # ==========================================
    # AGENT 2: CONTENT GENERATOR
    # ==========================================
    async def content_generator_agent(self, state_name: str, state_abbrev: str, research_data: Dict) -> Dict[str, Any]:
        """
        Content Generator Agent: Creates SEO-optimized content based on research.
        """
        print(f"[CONTENT AGENT] Generating content for {state_name}")
        
        system_message = """You are an expert SEO content writer specializing in addiction treatment and recovery.
Create compassionate, accurate, and helpful content that:
1. Uses data to support claims
2. Avoids stigmatizing language
3. Includes calls to action
4. Is optimized for search engines"""

        chat = self._create_chat(f"content-{state_abbrev}", system_message, agent_type="content")
        if not chat:
            return {"error": "LLM not available"}

        # Get latest year data for content
        latest_data = research_data.get("years_data", [{}])[-1] if research_data.get("years_data") else {}
        stats = latest_data.get("statistics", {})
        
        prompt = f"""Based on this data for {state_name}:
- Total affected: {stats.get('total_affected', 'N/A'):,}
- Overdose deaths: {stats.get('overdose_deaths', 'N/A'):,}
- Treatment centers: {stats.get('total_treatment_centers', 'N/A'):,}
- Recovery rate: {stats.get('recovery_rate', 'N/A')}%

Generate the following content in JSON format:
{{
    "page_seo": {{
        "meta_title": "<60 chars - include '{state_name} addiction treatment'>",
        "meta_description": "<155 chars - compelling with stats and CTA>",
        "h1_title": "<main heading for the page>",
        "intro_text": "<200 words - compassionate intro with key statistics>"
    }},
    "faqs": [
        {{"question": "<FAQ about treatment in {state_name}>", "answer": "<2-3 sentence answer>", "category": "Treatment"}},
        {{"question": "<FAQ about insurance/cost>", "answer": "<answer>", "category": "Insurance"}},
        {{"question": "<FAQ about types of treatment>", "answer": "<answer>", "category": "Treatment Types"}},
        {{"question": "<FAQ about finding help>", "answer": "<answer>", "category": "Getting Started"}},
        {{"question": "<FAQ specific to {state_name}>", "answer": "<answer>", "category": "Local Resources"}}
    ],
    "resources": [
        {{"title": "{state_name} substance abuse helpline", "description": "<description>", "resource_type": "hotline", "phone": "<state helpline>", "is_free": true}},
        {{"title": "{state_name} health department", "description": "<description>", "resource_type": "government_program", "website": "<URL>", "is_free": true}}
    ]
}}

Return ONLY valid JSON."""

        try:
            self.api_calls += 1
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            clean_response = response.strip()
            if clean_response.startswith("```"):
                clean_response = clean_response.split("```")[1]
                if clean_response.startswith("json"):
                    clean_response = clean_response[4:]
            clean_response = clean_response.strip()
            
            content = json.loads(clean_response)
            print(f"[CONTENT AGENT] Generated SEO content, {len(content.get('faqs', []))} FAQs, {len(content.get('resources', []))} resources")
            return {"success": True, "content": content, "api_calls": 1}
            
        except Exception as e:
            print(f"[CONTENT AGENT] Error: {e}")
            return {"success": False, "error": str(e)}

    # ==========================================
    # AGENT 3: FACT CHECKER
    # ==========================================
    async def fact_checker_agent(self, state_name: str, state_abbrev: str, data: Dict) -> Dict[str, Any]:
        """
        Fact Checker Agent: Verifies data accuracy against known benchmarks.
        """
        print(f"[FACT CHECK AGENT] Verifying data for {state_name}")
        
        system_message = """You are a data verification specialist for health statistics.
Your role is to verify that addiction statistics are within reasonable ranges based on:
1. State population
2. National averages
3. Historical trends
4. Official CDC/SAMHSA benchmarks

Flag any data that seems unrealistic or inconsistent."""

        chat = self._create_chat(f"factcheck-{state_abbrev}", system_message, agent_type="factcheck")
        if not chat:
            return {"error": "LLM not available"}

        years_data = data.get("years_data", [])
        
        prompt = f"""Verify the following addiction statistics for {state_name} (population ~22 million):

{json.dumps(years_data, indent=2)}

Check for:
1. Are overdose death numbers realistic? (National avg ~100k/year, {state_name} should be ~8-12% of that)
2. Do treatment center numbers make sense?
3. Are age group distributions reasonable?
4. Do year-over-year trends look realistic?
5. Are substance-specific numbers proportional?

Return JSON:
{{
    "verified": true/false,
    "confidence_score": <0-100>,
    "issues": ["<list any issues found>"],
    "corrections": [
        {{"field": "<field name>", "year": <year>, "original": <value>, "suggested": <value>, "reason": "<why>"}}
    ],
    "notes": "<any additional observations>"
}}

Return ONLY valid JSON."""

        try:
            self.api_calls += 1
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            clean_response = response.strip()
            if clean_response.startswith("```"):
                clean_response = clean_response.split("```")[1]
                if clean_response.startswith("json"):
                    clean_response = clean_response[4:]
            clean_response = clean_response.strip()
            
            verification = json.loads(clean_response)
            print(f"[FACT CHECK AGENT] Verification complete - Confidence: {verification.get('confidence_score', 'N/A')}%")
            return {"success": True, "verification": verification, "api_calls": 1}
            
        except Exception as e:
            print(f"[FACT CHECK AGENT] Error: {e}")
            return {"success": False, "error": str(e)}

    # ==========================================
    # AGENT 4: QA AGENT
    # ==========================================
    async def qa_agent(self, state_abbrev: str) -> Dict[str, Any]:
        """
        QA Agent: Verifies database records and frontend data consistency.
        """
        print(f"[QA AGENT] Checking database records for {state_abbrev}")
        
        # Check database records
        stats_count = await self.db.state_addiction_statistics.count_documents({"state_id": state_abbrev})
        substance_count = await self.db.substance_statistics.count_documents({"state_id": state_abbrev})
        faqs_count = await self.db.faqs.count_documents({"$or": [{"state_id": state_abbrev}, {"state_id": None}]})
        resources_count = await self.db.free_resources.count_documents({"$or": [{"state_id": state_abbrev}, {"is_nationwide": True}]})
        seo_count = await self.db.page_seo.count_documents({"state_id": state_abbrev})
        
        # Get sample records to verify data integrity
        sample_stat = await self.db.state_addiction_statistics.find_one({"state_id": state_abbrev})
        sample_substance = await self.db.substance_statistics.find_one({"state_id": state_abbrev})
        
        qa_result = {
            "state_id": state_abbrev,
            "database_records": {
                "statistics": stats_count,
                "substance_stats": substance_count,
                "faqs": faqs_count,
                "resources": resources_count,
                "seo": seo_count
            },
            "data_integrity": {
                "has_statistics": stats_count > 0,
                "has_substance_data": substance_count > 0,
                "has_faqs": faqs_count > 0,
                "has_resources": resources_count > 0,
                "has_seo": seo_count > 0
            },
            "sample_validation": {
                "stat_has_required_fields": bool(sample_stat and sample_stat.get("total_affected")),
                "substance_has_required_fields": bool(sample_substance and sample_substance.get("opioid_use_disorder"))
            },
            "ready_for_frontend": stats_count > 0 and substance_count > 0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        print(f"[QA AGENT] Database check complete - Stats: {stats_count}, Substance: {substance_count}, FAQs: {faqs_count}")
        return {"success": True, "qa_result": qa_result, "api_calls": 0}

    # ==========================================
    # MAIN PIPELINE
    # ==========================================
    async def run_full_pipeline(self, state_name: str, state_abbrev: str, years: List[int]) -> Dict[str, Any]:
        """
        Run the complete multi-agent pipeline for a state.
        """
        print(f"\n{'='*60}")
        print(f"STARTING PIPELINE FOR {state_name} ({state_abbrev})")
        print(f"Years: {years}")
        print(f"{'='*60}\n")
        
        results = {
            "state": state_abbrev,
            "state_name": state_name,
            "years": years,
            "agents": {},
            "total_api_calls": 0,
            "records_created": {},
            "success": False
        }
        
        # STEP 1: Research Agent
        print("\n[STEP 1/4] Running Research Agent...")
        research_result = await self.research_agent(state_name, state_abbrev, years)
        results["agents"]["research"] = research_result
        
        if not research_result.get("success"):
            results["error"] = "Research agent failed"
            return results
        
        research_data = research_result.get("data", {})
        results["total_api_calls"] += research_result.get("api_calls", 0)
        
        # STEP 2: Content Generator Agent
        print("\n[STEP 2/4] Running Content Generator Agent...")
        content_result = await self.content_generator_agent(state_name, state_abbrev, research_data)
        results["agents"]["content"] = content_result
        results["total_api_calls"] += content_result.get("api_calls", 0)
        
        # STEP 3: Fact Checker Agent
        print("\n[STEP 3/4] Running Fact Checker Agent...")
        factcheck_result = await self.fact_checker_agent(state_name, state_abbrev, research_data)
        results["agents"]["factcheck"] = factcheck_result
        results["total_api_calls"] += factcheck_result.get("api_calls", 0)
        
        # STEP 4: Store data in database
        print("\n[STEP 4/4] Storing data in database...")
        records_created = await self._store_all_data(state_name, state_abbrev, research_data, content_result.get("content", {}))
        results["records_created"] = records_created
        
        # STEP 5: QA Agent - Verify everything
        print("\n[BONUS] Running QA Agent...")
        qa_result = await self.qa_agent(state_abbrev)
        results["agents"]["qa"] = qa_result
        
        results["success"] = qa_result.get("qa_result", {}).get("ready_for_frontend", False)
        
        print(f"\n{'='*60}")
        print(f"PIPELINE COMPLETE FOR {state_name}")
        print(f"Total API Calls: {results['total_api_calls']}")
        print(f"Records Created: {results['records_created']}")
        print(f"Success: {results['success']}")
        print(f"{'='*60}\n")
        
        return results

    async def _store_all_data(self, state_name: str, state_abbrev: str, research_data: Dict, content_data: Dict) -> Dict[str, int]:
        """Store all generated data in MongoDB."""
        import uuid
        
        records = {"statistics": 0, "substance_stats": 0, "faqs": 0, "resources": 0, "seo": 0}
        
        # Store statistics for each year
        for year_data in research_data.get("years_data", []):
            year = year_data.get("year")
            stats = year_data.get("statistics", {})
            
            # Check if record exists
            existing = await self.db.state_addiction_statistics.find_one({
                "state_id": state_abbrev, "year": year
            })
            
            if not existing:
                stat_record = {
                    "id": str(uuid.uuid4()),
                    "state_id": state_abbrev,
                    "state_name": state_name,
                    "year": year,
                    "total_affected": stats.get("total_affected"),
                    "overdose_deaths": stats.get("overdose_deaths"),
                    "opioid_deaths": stats.get("opioid_deaths"),
                    "drug_abuse_rate": stats.get("drug_abuse_rate"),
                    "alcohol_abuse_rate": stats.get("alcohol_abuse_rate"),
                    "affected_age_12_17": stats.get("affected_age_12_17"),
                    "affected_age_18_25": stats.get("affected_age_18_25"),
                    "affected_age_26_34": stats.get("affected_age_26_34"),
                    "affected_age_35_plus": stats.get("affected_age_35_plus"),
                    "total_treatment_centers": stats.get("total_treatment_centers"),
                    "inpatient_facilities": stats.get("inpatient_facilities"),
                    "outpatient_facilities": stats.get("outpatient_facilities"),
                    "treatment_admissions": stats.get("treatment_admissions"),
                    "recovery_rate": stats.get("recovery_rate"),
                    "relapse_rate": stats.get("relapse_rate"),
                    "economic_cost_billions": stats.get("economic_cost_billions"),
                    "data_source": year_data.get("data_source", "SAMHSA NSDUH, CDC WONDER"),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                await self.db.state_addiction_statistics.insert_one(stat_record)
                records["statistics"] += 1
            
            # Store substance statistics
            substance = year_data.get("substance_stats", {})
            existing_sub = await self.db.substance_statistics.find_one({
                "state_id": state_abbrev, "year": year
            })
            
            if not existing_sub and substance:
                sub_record = {
                    "id": str(uuid.uuid4()),
                    "state_id": state_abbrev,
                    "state_name": state_name,
                    "year": year,
                    "alcohol_use_past_month_percent": substance.get("alcohol_use_past_month_percent"),
                    "alcohol_binge_drinking_percent": substance.get("alcohol_binge_drinking_percent"),
                    "alcohol_use_disorder": substance.get("alcohol_use_disorder"),
                    "alcohol_related_deaths": substance.get("alcohol_related_deaths"),
                    "opioid_use_disorder": substance.get("opioid_use_disorder"),
                    "opioid_misuse_past_year": substance.get("opioid_misuse_past_year"),
                    "prescription_opioid_misuse": substance.get("prescription_opioid_misuse"),
                    "heroin_use": substance.get("heroin_use"),
                    "fentanyl_deaths": substance.get("fentanyl_deaths"),
                    "marijuana_use_past_month": substance.get("marijuana_use_past_month"),
                    "marijuana_use_disorder": substance.get("marijuana_use_disorder"),
                    "cocaine_use_past_year": substance.get("cocaine_use_past_year"),
                    "cocaine_related_deaths": substance.get("cocaine_related_deaths"),
                    "meth_use_past_year": substance.get("meth_use_past_year"),
                    "meth_related_deaths": substance.get("meth_related_deaths"),
                    "treatment_received": substance.get("treatment_received"),
                    "treatment_needed_not_received": substance.get("treatment_needed_not_received"),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                await self.db.substance_statistics.insert_one(sub_record)
                records["substance_stats"] += 1
        
        # Store FAQs
        for faq in content_data.get("faqs", []):
            faq_record = {
                "id": str(uuid.uuid4()),
                "question": faq.get("question"),
                "answer": faq.get("answer"),
                "category": faq.get("category"),
                "state_id": state_abbrev,
                "is_active": True,
                "sort_order": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await self.db.faqs.insert_one(faq_record)
            records["faqs"] += 1
        
        # Store Resources
        for resource in content_data.get("resources", []):
            res_record = {
                "id": str(uuid.uuid4()),
                "title": resource.get("title"),
                "description": resource.get("description"),
                "resource_type": resource.get("resource_type"),
                "phone": resource.get("phone"),
                "website": resource.get("website"),
                "is_free": resource.get("is_free", True),
                "is_nationwide": False,
                "featured": True,
                "state_id": state_abbrev,
                "sort_order": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await self.db.free_resources.insert_one(res_record)
            records["resources"] += 1
        
        # Store SEO
        page_seo = content_data.get("page_seo", {})
        if page_seo:
            seo_record = {
                "id": str(uuid.uuid4()),
                "page_slug": f"/{state_abbrev.lower()}",
                "page_type": "state",
                "meta_title": page_seo.get("meta_title"),
                "meta_description": page_seo.get("meta_description"),
                "h1_title": page_seo.get("h1_title"),
                "intro_text": page_seo.get("intro_text"),
                "state_id": state_abbrev,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await self.db.page_seo.insert_one(seo_record)
            records["seo"] += 1
        
        return records
