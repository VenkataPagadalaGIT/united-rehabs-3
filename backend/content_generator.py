"""
AI Content Generator Service
Uses Gemini 2.5 Flash for research, content generation, and QA review
"""
import os
import asyncio
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

# Import LLM integration
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("Warning: emergentintegrations not installed. AI features disabled.")


class ContentGenerator:
    """AI-powered content generator for rehab statistics and resources."""
    
    def __init__(self):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        self.model_provider = "gemini"
        self.model_name = "gemini-2.5-flash"
        
    def _create_chat(self, session_id: str, system_message: str) -> Optional[Any]:
        """Create a new LLM chat instance."""
        if not LLM_AVAILABLE or not self.api_key:
            return None
            
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model(self.model_provider, self.model_name)
        
        return chat
    
    async def research_state_data(self, state_name: str, state_abbrev: str, data_type: str = "statistics") -> Dict[str, Any]:
        """
        Research addiction data for a specific state.
        
        Args:
            state_name: Full state name (e.g., "California")
            state_abbrev: State abbreviation (e.g., "CA")
            data_type: Type of data to research (statistics, resources, faqs)
            
        Returns:
            Dictionary with researched data and sources
        """
        system_message = """You are an expert research assistant specializing in addiction statistics and treatment resources. 
Your task is to provide accurate, data-driven information about substance abuse and addiction in US states.

When researching, you should:
1. Focus on official government sources (CDC, SAMHSA, NSDUH, DEA)
2. Provide specific numbers and statistics where available
3. Include year of data and source citation
4. Be factual and avoid speculation

Format your response as structured data that can be easily parsed."""

        chat = self._create_chat(f"research-{state_abbrev}-{data_type}", system_message)
        
        if not chat:
            return {"error": "LLM not available", "data": None}
        
        prompts = {
            "statistics": f"""Research addiction statistics for {state_name} ({state_abbrev}). Provide the following data points for the most recent year available:

1. Total number of people affected by substance use disorders
2. Overdose deaths (total, opioid-specific)
3. Drug abuse rate (percentage of population)
4. Alcohol abuse rate (percentage of population)
5. Number of treatment facilities (inpatient, outpatient)
6. Treatment admissions per year
7. Recovery rate estimates
8. Economic impact (if available)

For each data point, include:
- The specific number/statistic
- The year of the data
- The source (CDC, SAMHSA, state health department, etc.)

Format as JSON with this structure:
{{
    "state": "{state_abbrev}",
    "year": 2024,
    "total_affected": number,
    "overdose_deaths": number,
    "opioid_deaths": number,
    "drug_abuse_rate": percentage,
    "alcohol_abuse_rate": percentage,
    "treatment_centers": number,
    "inpatient_facilities": number,
    "outpatient_facilities": number,
    "treatment_admissions": number,
    "recovery_rate": percentage,
    "economic_cost_billions": number,
    "data_source": "source name",
    "sources": ["list of sources with URLs"]
}}""",

            "resources": f"""Research free addiction treatment resources available in {state_name} ({state_abbrev}). Include:

1. State government programs
2. Free/sliding scale treatment centers
3. Crisis hotlines specific to the state
4. Support groups (AA, NA meetings locations)
5. Medicaid-covered treatment options

Format as JSON array with this structure:
{{
    "resources": [
        {{
            "title": "Resource name",
            "description": "Brief description",
            "resource_type": "government_program|hotline|support_group|treatment_locator",
            "phone": "phone number if available",
            "website": "URL if available",
            "is_free": true/false,
            "is_nationwide": false
        }}
    ]
}}""",

            "faqs": f"""Generate 5-10 frequently asked questions about addiction treatment in {state_name} ({state_abbrev}). Include questions about:

1. How to find treatment in the state
2. Insurance coverage and Medicaid
3. Types of treatment available
4. State-specific programs or resources
5. Emergency resources

Format as JSON array:
{{
    "faqs": [
        {{
            "question": "Question text",
            "answer": "Detailed answer (2-3 sentences)",
            "category": "Getting Started|Insurance|Treatment Types|Resources"
        }}
    ]
}}"""
        }
        
        prompt = prompts.get(data_type, prompts["statistics"])
        
        try:
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            return {
                "success": True,
                "data": response,
                "state": state_abbrev,
                "data_type": data_type
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "state": state_abbrev,
                "data_type": data_type
            }
    
    async def generate_content(self, state_name: str, state_abbrev: str, content_type: str, research_data: str) -> Dict[str, Any]:
        """
        Generate SEO-optimized content based on research data.
        
        Args:
            state_name: Full state name
            state_abbrev: State abbreviation
            content_type: Type of content (page_intro, seo_description, article)
            research_data: Previously researched data to base content on
            
        Returns:
            Generated content
        """
        system_message = """You are an expert content writer specializing in addiction treatment and recovery resources.
Your content should be:
1. Compassionate and non-judgmental
2. Accurate and evidence-based
3. SEO-optimized with relevant keywords
4. Helpful for people seeking treatment information

Always maintain a supportive tone and avoid stigmatizing language."""

        chat = self._create_chat(f"generate-{state_abbrev}-{content_type}", system_message)
        
        if not chat:
            return {"error": "LLM not available", "content": None}
        
        prompts = {
            "page_intro": f"""Based on the following research data about addiction in {state_name}:

{research_data}

Write an SEO-optimized introductory paragraph (150-200 words) for a page about addiction treatment in {state_name}. 
Include:
- Key statistics highlighting the need for treatment
- A compassionate message to those seeking help
- Mention of available resources
- A call to action

Target keywords: addiction treatment {state_name}, rehab centers {state_abbrev}, drug rehab {state_name}""",

            "seo_description": f"""Based on this data about {state_name}:

{research_data}

Write an SEO meta description (150-160 characters) for the {state_name} addiction treatment page.
Make it compelling and include a call to action.""",

            "article": f"""Based on this research about addiction in {state_name}:

{research_data}

Write a comprehensive article (500-800 words) about addiction treatment options in {state_name}.

Include sections:
1. Overview of addiction in {state_name} (use specific statistics)
2. Types of treatment available
3. Free and low-cost resources
4. How to get help
5. Recovery support and next steps

Use markdown formatting with headers."""
        }
        
        prompt = prompts.get(content_type, prompts["page_intro"])
        
        try:
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            return {
                "success": True,
                "content": response,
                "state": state_abbrev,
                "content_type": content_type
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "state": state_abbrev,
                "content_type": content_type
            }
    
    async def qa_review(self, content: str, state_name: str, state_abbrev: str) -> Dict[str, Any]:
        """
        QA review of generated content for accuracy and quality.
        
        Args:
            content: Content to review
            state_name: State the content is about
            state_abbrev: State abbreviation
            
        Returns:
            QA review results with suggestions
        """
        system_message = """You are a quality assurance specialist for health and addiction-related content.
Your role is to:
1. Verify factual accuracy
2. Check for compassionate, non-stigmatizing language
3. Ensure content is helpful and actionable
4. Identify any potential issues or improvements

Be thorough but constructive in your feedback."""

        chat = self._create_chat(f"qa-{state_abbrev}", system_message)
        
        if not chat:
            return {"error": "LLM not available", "review": None}
        
        prompt = f"""Review the following content about addiction treatment in {state_name} ({state_abbrev}):

---
{content}
---

Provide a QA review with:
1. Overall quality score (1-10)
2. Factual accuracy assessment
3. Tone and language check
4. SEO optimization level
5. Specific issues found (if any)
6. Suggested improvements

Format as JSON:
{{
    "quality_score": number,
    "accuracy": "assessment",
    "tone": "assessment",
    "seo_score": number,
    "issues": ["list of issues"],
    "improvements": ["list of suggestions"],
    "approved": true/false
}}"""
        
        try:
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            return {
                "success": True,
                "review": response,
                "state": state_abbrev
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "state": state_abbrev
            }


# Create singleton instance
content_generator = ContentGenerator()
