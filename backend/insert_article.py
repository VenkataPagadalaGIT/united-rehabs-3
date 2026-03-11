"""
Insert a news article about federal funding cuts threatening overdose prevention progress into MongoDB.
"""

import os
from datetime import datetime, timezone
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "united_rehabs")

TITLE = "Federal Funding Cuts Threaten to Reverse Historic Drop in U.S. Overdose Deaths"
SLUG = "federal-funding-cuts-threaten-overdose-death-progress"

CONTENT = """
<article>

<nav class="table-of-contents">
<h2>Table of Contents</h2>
<ul>
<li><a href="#historic-decline">A Historic Decline, Now at Risk</a></li>
<li><a href="#federal-cuts">Billions Slashed From Overdose Prevention</a></li>
<li><a href="#medicaid-impact">Medicaid Cuts Hit Treatment Access Hardest</a></li>
<li><a href="#samhsa-gutted">SAMHSA Gutted From the Inside</a></li>
<li><a href="#polysubstance">The Shifting Nature of the Crisis</a></li>
<li><a href="#what-worked">What Worked, and What Could Unravel</a></li>
<li><a href="#states-respond">States and Cities Scramble to Fill the Gap</a></li>
<li><a href="#faq">Frequently Asked Questions</a></li>
<li><a href="#further-reading">Further Reading</a></li>
<li><a href="#crisis-resources">Crisis Resources</a></li>
</ul>
</nav>

<section id="historic-decline">
<h2>A Historic Decline, Now at Risk</h2>

<p>For the first time in nearly a decade, the United States recorded fewer than 75,000 drug overdose deaths in a single year. Provisional data from the Centers for Disease Control and Prevention show approximately 72,108 overdose fatalities for the 12-month period ending September 2025, an 18.9% decline from the previous year and a sharp reversal from the record 108,000 deaths logged in 2022.</p>

<p>Public health officials called the numbers a turning point. Naloxone distribution programs, expanded access to buprenorphine, fentanyl test strips, and data-driven surveillance systems had combined to pull the country back from its worst overdose crisis in history.</p>

<p>Then the federal government began cutting the programs responsible for that progress.</p>
</section>

<section id="federal-cuts">
<h2>Billions Slashed From Overdose Prevention</h2>

<p>The Trump administration's fiscal year 2026 budget proposed cutting over $28.6 billion in discretionary spending, including $1 billion from the Substance Abuse and Mental Health Services Administration (SAMHSA), the federal agency that anchors the nation's addiction treatment and prevention infrastructure. Block grant reductions to SAMHSA alone total $465 million less than previous funding levels, according to the Drug Policy Alliance.</p>

<p>Across agencies, the federal government is on track to slash $26 billion from overdose prevention and addiction care, gutting programs funded by SAMHSA, the CDC, the National Institutes of Health, and the Department of Justice. The DOJ's budget faces nearly $3 billion in cuts under the proposed restructuring.</p>

<p>In January 2026, the administration sent hundreds of letters terminating federal grants supporting mental health and drug addiction services, with cuts potentially totaling $2 billion. NPR reported that the administration briefly reversed course on some of those cancellations after public backlash, but many programs remain unfunded or in limbo.</p>
</section>

<section id="medicaid-impact">
<h2>Medicaid Cuts Hit Treatment Access Hardest</h2>

<p>Perhaps the most consequential blow comes from Medicaid, the single largest payer for addiction treatment in the United States. The One Big Beautiful Bill Act, signed in July 2025, includes nearly $1 trillion in Medicaid cuts over the next decade starting in 2026, along with new work requirements that addiction medicine specialists warn will push vulnerable patients off their coverage.</p>

<p>Medicaid covers more than 40% of all adults with opioid use disorder, according to KFF. In states that expanded Medicaid under the Affordable Care Act, overdose death rates declined significantly compared to non-expansion states. Cutting that lifeline now, just as treatment access was finally reaching scale, amounts to pulling the parachute mid-descent, according to a Brookings Institution analysis published in March 2026.</p>

<p>"The devastating but avoidable outcome will likely be a significant increase in drug overdoses and increased economic costs and trauma to U.S. society," the Brookings researchers wrote.</p>
</section>

<section id="samhsa-gutted">
<h2>SAMHSA Gutted From the Inside</h2>

<p>Beyond budget numbers, the operational damage to SAMHSA has been severe. The administration reduced the agency's staff by more than half since January 2025, according to reporting from STAT News. Layoffs and funding disruptions have ground much of the agency's grant-making and oversight work to a halt.</p>

<p>Approximately 40 grant programs historically funded at over $1 billion face elimination. Many of these programs target reentry services for people leaving incarceration, alternatives to jail for drug offenses, and community-based substance use disorder treatment, the populations most at risk of fatal overdose.</p>

<p>AJMC reported that the terminated grants threatened mental health and addiction services in every state, with rural communities and tribal nations facing disproportionate impact due to their reliance on federal funding.</p>
</section>

<section id="polysubstance">
<h2>The Shifting Nature of the Crisis</h2>

<p>Even as overall deaths decline, the drug supply itself grows more dangerous and complex. CDC data published March 5, 2026 confirmed that fentanyl remains the dominant killer, present in 71.9% of all overdose deaths in 2023. But the crisis has evolved into what researchers call the "fourth wave," defined by polysubstance use.</p>

<p>Methamphetamine now appears in 33.9% of overdose deaths, cocaine in 31%, and nearly 47% of all drug overdose fatalities in 2023 involved both opioids and stimulants simultaneously. Heroin, once the second most common drug in overdose deaths, dropped to seventh place.</p>

<p>This shift matters for treatment. Programs designed around opioid-only addiction miss the reality that most people dying from overdoses are using multiple substances. Buprenorphine treats opioid dependence but does nothing for methamphetamine. Comprehensive treatment programs that address polysubstance use require more funding, not less.</p>
</section>

<section id="what-worked">
<h2>What Worked, and What Could Unravel</h2>

<p>The 27% decline in overdose deaths from 2023 to 2024 did not happen by accident. STAT News outlined the key interventions in a March 9, 2026 analysis: widespread naloxone distribution made the overdose-reversal drug available in pharmacies, schools, and community centers; buprenorphine prescriptions rose from 1.4 million in 2012 to 15.4 million in 2024; fentanyl test strips allowed people who use drugs to check their supply; and real-time overdose surveillance helped health departments target resources to emerging hotspots.</p>

<p>Every one of those interventions depends on federal funding. Naloxone distribution programs receive SAMHSA grants. Buprenorphine access expanded through changes in federal prescribing regulations and Medicaid coverage. Test strip legalization was driven by CDC harm reduction funding. Surveillance systems run on CDC data infrastructure that faces proposed budget cuts.</p>

<p>"72,000 drug overdoses a year is not acceptable," STAT's editorial board wrote. "Defunding the programs that got us from 108,000 to 72,000 is not a strategy. It is abandonment."</p>
</section>

<section id="states-respond">
<h2>States and Cities Scramble to Fill the Gap</h2>

<p>With federal support disappearing, state and local governments face impossible choices. Several states have attempted to backfill lost federal grants with their own funds, but the scale of the cuts dwarfs what most state budgets can absorb. Opioid settlement funds from pharmaceutical companies provide some cushion, but those dollars were already allocated to long-term infrastructure, not emergency gap-filling.</p>

<p>Health law experts at the National Health Law Program warned that the combination of Medicaid coverage losses, SAMHSA grant terminations, and CDC surveillance cuts creates a "perfect storm" that could erase years of progress in months.</p>

<p>The question facing the country, as the Brookings analysis framed it, is straightforward: will the United States protect the investments that drove overdose deaths down by 27%, or defund them and watch the numbers climb back toward six figures?</p>
</section>

<section id="faq">
<h2>Frequently Asked Questions</h2>

<h3>How much have U.S. overdose deaths declined recently?</h3>
<p>U.S. overdose deaths fell from a record high of approximately 108,000 in 2022 to about 72,108 in the 12 months ending September 2025, a decline of roughly 33%. The CDC reported a 27% year-over-year drop from 2023 to 2024 alone, driven by expanded naloxone access, buprenorphine treatment, and harm reduction programs.</p>

<h3>What federal funding cuts threaten overdose prevention in 2026?</h3>
<p>The federal government is cutting an estimated $26 billion from overdose prevention and addiction care across SAMHSA, the CDC, NIH, and DOJ. SAMHSA alone faces $1 billion in cuts and a $465 million reduction in block grants. Nearly $1 trillion in Medicaid cuts over the next decade, enacted through the One Big Beautiful Bill Act, will further reduce treatment access for people with substance use disorders.</p>

<h3>Why is fentanyl still the leading cause of overdose deaths?</h3>
<p>Illicitly manufactured fentanyl was present in 71.9% of all U.S. overdose deaths in 2023, according to CDC data. Fentanyl is cheap to produce, extremely potent (50 to 100 times stronger than morphine), and frequently mixed into other drugs including counterfeit pills, cocaine, and methamphetamine without the buyer's knowledge.</p>

<h3>Where can someone get help for drug addiction right now?</h3>
<p>SAMHSA's National Helpline (1-800-662-4357) provides free, confidential, 24/7 referrals to treatment facilities, support groups, and community organizations. The 988 Suicide and Crisis Lifeline also connects callers with trained counselors. Both services are available in English and Spanish.</p>
</section>

<section id="further-reading">
<h2>Further Reading</h2>
<ul>
<li><a href="https://www.statnews.com/2026/03/09/drug-overdose-deaths-opioids-decline-plateau/" target="_blank" rel="noopener">72,000 Drug Overdoses a Year Is Not Acceptable - STAT News</a></li>
<li><a href="https://www.brookings.edu/articles/progress-under-threat-the-future-of-overdose-prevention-in-the-united-states/" target="_blank" rel="noopener">Progress Under Threat: The Future of Overdose Prevention - Brookings Institution</a></li>
<li><a href="https://drugpolicy.org/resource/federal-cuts-threaten-overdose-prevention/" target="_blank" rel="noopener">Federal Cuts to Overdose Prevention and Addiction Treatment - Drug Policy Alliance</a></li>
<li><a href="https://www.npr.org/2026/01/14/nx-s1-5677104/trump-administration-letter-terminating-addiction-mental-health-grants" target="_blank" rel="noopener">Trump Administration Sends Letter Terminating Addiction, Mental Health Grants - NPR</a></li>
<li><a href="https://blogs.cdc.gov/nchs/2026/03/05/7892/" target="_blank" rel="noopener">Most Common Drugs in U.S. Overdose Deaths: 2017-2023 - CDC</a></li>
<li><a href="https://www.cdc.gov/nchs/pressroom/releases/20250514.html" target="_blank" rel="noopener">U.S. Overdose Deaths Decrease Almost 27% in 2024 - CDC</a></li>
<li><a href="https://www.kff.org/quick-take/opioid-deaths-are-falling-though-proposed-medicaid-changes-could-disrupt-access-to-treatment/" target="_blank" rel="noopener">Opioid Deaths Are Falling, Though Proposed Medicaid Changes Could Disrupt Access - KFF</a></li>
</ul>
</section>

<section id="crisis-resources">
<h2>Crisis Resources</h2>
<p>If you or someone you know is struggling with substance use or addiction, help is available right now:</p>
<ul>
<li><strong>SAMHSA National Helpline:</strong> 1-800-662-4357 (free, confidential, 24/7)</li>
<li><strong>988 Suicide and Crisis Lifeline:</strong> Call or text 988</li>
<li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
</ul>
</section>

</article>
"""

FAQ_ITEMS = [
    {
        "question": "How much have U.S. overdose deaths declined recently?",
        "answer": "U.S. overdose deaths fell from a record high of approximately 108,000 in 2022 to about 72,108 in the 12 months ending September 2025, a decline of roughly 33%. The CDC reported a 27% year-over-year drop from 2023 to 2024 alone."
    },
    {
        "question": "What federal funding cuts threaten overdose prevention in 2026?",
        "answer": "The federal government is cutting an estimated $26 billion from overdose prevention and addiction care across SAMHSA, the CDC, NIH, and DOJ. SAMHSA alone faces $1 billion in cuts. Nearly $1 trillion in Medicaid cuts over the next decade will further reduce treatment access."
    },
    {
        "question": "Why is fentanyl still the leading cause of overdose deaths?",
        "answer": "Illicitly manufactured fentanyl was present in 71.9% of all U.S. overdose deaths in 2023, according to CDC data. It is cheap to produce, extremely potent, and frequently mixed into other drugs without the buyer's knowledge."
    },
    {
        "question": "Where can someone get help for drug addiction right now?",
        "answer": "SAMHSA's National Helpline (1-800-662-4357) provides free, confidential, 24/7 referrals to treatment facilities and support groups. The 988 Suicide and Crisis Lifeline also connects callers with trained counselors."
    }
]

article = {
    "title": TITLE,
    "slug": SLUG,
    "excerpt": "Federal cuts totaling $26 billion threaten to reverse the historic 27% decline in U.S. overdose deaths, as Medicaid and SAMHSA face deep reductions.",
    "content": CONTENT.strip(),
    "content_type": "news",
    "meta_title": "Federal Funding Cuts Threaten U.S. Overdose Death Progress | United Rehabs",
    "meta_description": "Federal budget cuts of $26 billion to SAMHSA, CDC, and Medicaid threaten to reverse the historic decline in U.S. overdose deaths from 108,000 to 72,000.",
    "meta_keywords": [
        "overdose deaths", "fentanyl crisis", "SAMHSA funding cuts",
        "Medicaid addiction treatment", "opioid epidemic", "naloxone",
        "buprenorphine", "drug policy", "harm reduction",
        "federal budget cuts addiction", "polysubstance overdose"
    ],
    "tags": [
        "fentanyl", "overdose prevention", "federal funding",
        "SAMHSA", "Medicaid", "opioid crisis", "harm reduction",
        "naloxone", "drug policy", "addiction treatment"
    ],
    "read_time": "5 min read",
    "faq_items": FAQ_ITEMS,
    "related_countries": ["USA"],
    "related_states": [],
    "author_name": "United Rehabs Data Team",
    "is_published": True,
    "published_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc),
    "views_count": 0,
    "featured_image_url": ""
}

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
collection = db["articles"]

result = collection.update_one(
    {"slug": SLUG},
    {"$set": article},
    upsert=True
)

if result.upserted_id:
    print(f"Inserted new article: {TITLE}")
else:
    print(f"Updated existing article: {TITLE}")

print(f"Slug: {SLUG}")
print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")

client.close()
