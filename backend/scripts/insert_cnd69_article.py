"""
Insert article: UN Commission on Narcotic Drugs 69th Session - Vienna March 2026
"""

import os
import sys
from datetime import datetime, timezone
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "united_rehabs")

title = "UN Opens 69th Commission on Narcotic Drugs as Global Synthetic Opioid Crisis Deepens"
slug = "un-commission-narcotic-drugs-69th-session-synthetic-opioid-crisis"
excerpt = "Over 2,200 delegates convene in Vienna to confront record cocaine output, 1,400+ new psychoactive substances and the spread of nitazenes across Europe."

meta_title = "UN 69th Commission on Narcotic Drugs: Synthetic Opioid Crisis Deepens | United Rehabs"
meta_description = "The UN opened its 69th Commission on Narcotic Drugs in Vienna as delegates confront record cocaine production, nitazene spread across Europe, and 1,400+ new psychoactive substances."
meta_keywords = [
    "Commission on Narcotic Drugs",
    "CND 69",
    "UNODC",
    "synthetic opioids",
    "nitazenes",
    "new psychoactive substances",
    "cocaine production",
    "global drug policy",
    "Vienna",
    "drug trafficking",
    "overdose crisis",
    "harm reduction"
]

tags = [
    "International Drug Policy",
    "United Nations",
    "Synthetic Opioids",
    "Nitazenes",
    "Cocaine",
    "Europe",
    "Harm Reduction",
    "UNODC",
    "Drug Trafficking",
    "Public Health"
]

faq_items = [
    {
        "question": "What is the UN Commission on Narcotic Drugs?",
        "answer": "The Commission on Narcotic Drugs (CND) is the central policymaking body within the United Nations system on drug-related matters. Established in 1946, it meets annually in Vienna to set global drug control policy, schedule new substances and coordinate international responses to drug trafficking and addiction."
    },
    {
        "question": "What are nitazenes and why are they dangerous?",
        "answer": "Nitazenes are a class of synthetic opioids that can be significantly more potent than fentanyl. First synthesized in the 1950s, they have re-emerged on illicit drug markets across Europe and beyond. Between June 2023 and May 2024, nitazenes were confirmed in 179 deaths in the United Kingdom alone, and they have been detected in fatal overdoses across Estonia, Finland, France, Germany and several other European nations."
    },
    {
        "question": "How many new psychoactive substances has the UN identified?",
        "answer": "The United Nations Office on Drugs and Crime (UNODC) is now monitoring more than 1,400 new psychoactive substances globally. In 2024 alone, 726 new substances were detected, the highest annual figure ever recorded, underscoring the rapid pace at which illicit chemists are creating novel compounds to evade existing drug controls."
    },
    {
        "question": "What is the current scale of global cocaine production?",
        "answer": "Global illegal cocaine production reached a record high of more than 3,708 metric tons in 2023, a 34 percent increase over the previous year according to UNODC data. Seizures also hit a record of 2,275 tons, a 68 percent rise over the 2019-2023 period, reflecting both increased output and intensified law enforcement efforts."
    }
]

content = """<div class="article-body">

<h2>Table of Contents</h2>
<ul>
<li><a href="#vienna-summit">Vienna Summit Draws 2,200 Delegates</a></li>
<li><a href="#new-psychoactive-substances">1,400 New Psychoactive Substances and Counting</a></li>
<li><a href="#cocaine-record">Cocaine Production Hits All-Time High</a></li>
<li><a href="#nitazene-threat">Nitazenes: Europe's Emerging Killer</a></li>
<li><a href="#uk-response">United Kingdom Bets on Technology</a></li>
<li><a href="#scheduling-battles">Scheduling Battles and Policy Divides</a></li>
<li><a href="#what-comes-next">What Comes Next</a></li>
<li><a href="#faq">Frequently Asked Questions</a></li>
<li><a href="#helplines">Crisis Helplines</a></li>
<li><a href="#further-reading">Further Reading</a></li>
</ul>

<h2 id="vienna-summit">Vienna Summit Draws 2,200 Delegates</h2>

<p>The United Nations opened the 69th session of the Commission on Narcotic Drugs in Vienna on March 9, 2026, gathering more than 2,200 representatives from member states, international organizations and civil society groups. For five days, delegates will debate draft resolutions on prevention, treatment, supply-chain integrity and the accelerating spread of synthetic drugs that are rewriting the global overdose map.</p>

<p>Ambassador Andranik Hovhannisyan of Armenia chairs the session. John Brandolino, acting executive director of the UN Office on Drugs and Crime (UNODC), opened proceedings by warning that the drug landscape is shifting faster than international controls can keep up. Alongside the plenary, organizers have scheduled 166 side events and 23 exhibitions, a scale of engagement that reflects the urgency of the moment.</p>

<p>"Sudden shifts in the substances available on local drug markets are now more likely to occur than in the past," the European Union Drugs Agency wrote in its most recent annual report, "leading to greater uncertainty about the harms to which people taking them may be exposed."</p>

<h2 id="new-psychoactive-substances">1,400 New Psychoactive Substances and Counting</h2>

<p>The headline number from UNODC tells a stark story. The agency is now monitoring more than 1,400 new psychoactive substances (NPS) worldwide. In 2024 alone, laboratories detected 726 novel compounds, the highest single-year figure on record. That pace means regulators are playing a permanent game of catch-up: by the time one substance is scheduled and banned, several more have entered circulation.</p>

<p>NPS span a broad chemical spectrum, from synthetic cannabinoids sold as "legal highs" to designer benzodiazepines and stimulants. Many are manufactured in clandestine labs in East Asia and shipped globally through postal services and encrypted online marketplaces. A recent operation in Thailand, in which three Swedish nationals were arrested for running darknet drug distribution from rented luxury villas in Bangkok, illustrates how borderless the trade has become.</p>

<p>Drug traffickers continue to adapt by creating analogues, substances that are chemically similar to controlled drugs like fentanyl or nitazenes but technically fall outside existing legal definitions. The WHO Expert Committee on Drug Dependence reviewed several nitazene analogues in October 2025 and recommended their addition to the 1961 Single Convention on Narcotic Drugs, but formal scheduling requires a vote at the CND, where political considerations often slow the process.</p>

<h2 id="cocaine-record">Cocaine Production Hits All-Time High</h2>

<p>While synthetic drugs dominate policy discussions in Europe and North America, cocaine remains the defining challenge for Latin America. UNODC data published in the 2025 World Drug Report show that global illegal cocaine production reached 3,708 metric tons in 2023, a 34 percent jump from the previous year and the highest figure ever recorded.</p>

<p>Seizures have risen in parallel. Authorities worldwide confiscated 2,275 tons of cocaine in 2023, a 68 percent increase over the 2019-2023 average. Yet the street price of cocaine across Europe has remained stable or fallen in many markets, a signal that supply continues to outstrip interdiction capacity.</p>

<p>Ecuador has become a central front in the cocaine war. On March 3, 2026, U.S. and Ecuadorian military forces launched joint operations that dismantled a trafficking cell linked to the Los Lobos cartel, arresting 16 suspects and seizing cocaine, cash and financial records. The operation targeted Hernan Ruilova Barzola, whose network exploited Ecuador's Pacific ports to move product to Europe and North America.</p>

<p>The Ecuadorian crackdown came days after the killing of Nemesio Oseguera Cervantes, known as "El Mencho," the leader of Mexico's Jalisco New Generation Cartel. That operation, aided by U.S. intelligence, triggered retaliatory violence across more than a dozen Mexican states and left at least 70 people dead, a reminder that dismantling cartel leadership does not automatically reduce supply or violence.</p>

<h2 id="nitazene-threat">Nitazenes: Europe's Emerging Killer</h2>

<p>For years, European public health officials watched the U.S. fentanyl crisis with a mix of concern and relief that the continent had largely been spared. That sense of distance is eroding. Nitazenes, a class of synthetic opioids that can be far more potent than fentanyl, are now showing up in fatal overdoses across the continent.</p>

<p>Between June 2023 and May 2024, the United Kingdom recorded 179 confirmed deaths involving one or more nitazenes, according to UNODC data. Estonia, Finland, France, Germany, Latvia, Norway and Sweden have all reported peaks in nitazene-related fatalities during 2023 and 2024. The European Union Drugs Agency estimates that opioids are present in 74 percent of fatal overdoses across EU member states, and nitazenes threaten to push that share even higher.</p>

<p>First synthesized in the 1950s as experimental painkillers, nitazenes were never approved for medical use. Their re-emergence on illicit markets is driven by the same economic logic that fueled the fentanyl explosion: tiny quantities produce powerful effects, making them cheap to manufacture and easy to smuggle. A February 2026 UNODC advisory warned that standard fentanyl test strips may not reliably detect certain nitazene and orphine analogues, complicating harm-reduction efforts on the ground.</p>

<h2 id="uk-response">United Kingdom Bets on Technology</h2>

<p>Against this backdrop, the United Kingdom announced a 20 million pound investment in technology aimed at reducing drug and alcohol harm. The funding, part of the government's Addiction Healthcare Goals programme, opened for applications on February 16, 2026.</p>

<p>Grants of up to 10 million pounds will support late-stage, high-impact projects involving wearable sensors, artificial intelligence and virtual reality-based interventions. A second funding strand offers up to 1.5 million pounds for earlier-stage innovations. The government framed the investment against grim national statistics: roughly 15,000 people die each year in the UK from alcohol and drug-related causes, at an estimated cost to England alone of 47 billion pounds annually.</p>

<p>Whether technology can bend the curve on overdose deaths remains an open question. Critics argue that without adequate funding for existing treatment services, which face long waiting lists across much of the National Health Service, new gadgets risk becoming expensive distractions. Advocates counter that tools like real-time drug-checking technology and AI-driven early-warning systems could save lives by alerting users and clinicians to dangerous batches before they spread.</p>

<h2 id="scheduling-battles">Scheduling Battles and Policy Divides</h2>

<p>The CND's most consequential power is its ability to add substances to the international drug control schedules, binding all 193 UN member states. At last year's 68th session, the Commission scheduled five new psychoactive substances and one medicine following WHO recommendations. This year's agenda includes further scheduling proposals, though the specific substances under consideration have not been publicly confirmed.</p>

<p>The scheduling process exposes a fundamental tension. Countries with strong pharmaceutical industries often resist broad scheduling that could affect legitimate research or commercial interests. Nations on the front lines of trafficking and overdose deaths push for faster, more sweeping controls. Meanwhile, a growing bloc of member states, led by several Latin American and European governments, argues that prohibition-first approaches have failed and that the CND should devote more attention to harm reduction, decriminalization and public health.</p>

<p>The EU statement delivered on March 9 reaffirmed the bloc's commitment to a "balanced, evidence-based approach" that integrates human rights, public health and security. The U.S. delegation, led by Drug Czar Sara Carter, emphasized interdiction, supply disruption and the designation of cartels as terrorist organizations, reflecting the Trump administration's hardline posture at the recent Shield of the Americas summit in South Florida.</p>

<h2 id="what-comes-next">What Comes Next</h2>

<p>The Vienna session runs through March 13. Delegates will vote on draft resolutions covering early-warning systems for new substances, alternative development programs for coca-growing communities and public health responses to synthetic opioids. Side events will address topics ranging from youth prevention to the role of the darknet in drug distribution.</p>

<p>Whatever emerges from the conference halls of the Vienna International Centre, the numbers make one thing clear: the global drug supply is diversifying faster than ever, and the gap between the speed of illicit innovation and the pace of international regulation continues to widen. For the communities burying their dead from nitazene overdoses in Manchester or cocaine violence in Guayaquil, the stakes of closing that gap could not be higher.</p>

<h2 id="faq">Frequently Asked Questions</h2>

<h3>What is the UN Commission on Narcotic Drugs?</h3>
<p>The Commission on Narcotic Drugs (CND) is the central policymaking body within the United Nations system on drug-related matters. Established in 1946, it meets annually in Vienna to set global drug control policy, schedule new substances and coordinate international responses to drug trafficking and addiction.</p>

<h3>What are nitazenes and why are they dangerous?</h3>
<p>Nitazenes are a class of synthetic opioids that can be significantly more potent than fentanyl. First synthesized in the 1950s, they have re-emerged on illicit drug markets across Europe and beyond. Between June 2023 and May 2024, nitazenes were confirmed in 179 deaths in the United Kingdom alone, and they have been detected in fatal overdoses across Estonia, Finland, France, Germany and several other European nations.</p>

<h3>How many new psychoactive substances has the UN identified?</h3>
<p>The United Nations Office on Drugs and Crime (UNODC) is now monitoring more than 1,400 new psychoactive substances globally. In 2024 alone, 726 new substances were detected, the highest annual figure ever recorded.</p>

<h3>What is the current scale of global cocaine production?</h3>
<p>Global illegal cocaine production reached a record high of more than 3,708 metric tons in 2023, a 34 percent increase over the previous year according to UNODC data. Seizures also hit a record of 2,275 tons, a 68 percent rise over the 2019-2023 period.</p>

<h2 id="helplines">Crisis Helplines</h2>

<h3>United Kingdom</h3>
<ul>
<li><strong>FRANK Drug Helpline:</strong> 0300 123 6600 (free, 24/7) - <a href="https://www.talktofrank.com" target="_blank" rel="noopener">talktofrank.com</a></li>
<li><strong>Samaritans:</strong> 116 123 (free, 24/7)</li>
<li><strong>NHS Addiction Services:</strong> Contact your GP or visit <a href="https://www.nhs.uk/live-well/addiction-support/" target="_blank" rel="noopener">nhs.uk/addiction-support</a></li>
</ul>

<h3>European Union</h3>
<ul>
<li><strong>European Emergency Number:</strong> 112 (all EU member states)</li>
<li><strong>France - Drogues Info Service:</strong> 0 800 23 13 13 (free, 7 days/week)</li>
<li><strong>Germany - Drug Emergency Hotline:</strong> 01805 313 031</li>
<li><strong>Netherlands - Trimbos Institute:</strong> 0900-1995</li>
</ul>

<h3>Austria</h3>
<ul>
<li><strong>Sucht- und Drogenkoordination Wien:</strong> +43 1 4000 87390</li>
<li><strong>Rat auf Draht (Youth):</strong> 147</li>
</ul>

<h3>Ecuador</h3>
<ul>
<li><strong>ECU 911:</strong> 911 (emergency services)</li>
<li><strong>CONSEP Helpline:</strong> 1800-7272</li>
</ul>

<h3>Mexico</h3>
<ul>
<li><strong>Linea de la Vida (CONADIC):</strong> 800 911 2000 (free, 24/7)</li>
<li><strong>SAPTEL Crisis Line:</strong> 55 5259 8121</li>
</ul>

<h2 id="further-reading">Further Reading</h2>
<ul>
<li><a href="https://www.unodc.org/unodc/en/frontpage/2026/March/where-the-world-comes-together-to-tackle-the-world-drug-problem_-cnd-opens-its-69th-session-in-vienna.html" target="_blank" rel="noopener">UNODC: CND Opens Its 69th Session in Vienna</a></li>
<li><a href="https://www.euda.europa.eu/publications/european-drug-report/2025_en" target="_blank" rel="noopener">European Drug Report 2025: Trends and Developments</a></li>
<li><a href="https://www.unodc.org/LSS/Announcement/Details/e69b2ff5-5b91-4eea-8e1f-802ca7ad5080" target="_blank" rel="noopener">UNODC: Increasing Nitazene and Orphine Analogues - February 2026</a></li>
<li><a href="https://www.gov.uk/government/news/new-technology-to-help-combat-drug-and-alcohol-addiction" target="_blank" rel="noopener">UK Government: New Technology to Combat Drug and Alcohol Addiction</a></li>
<li><a href="https://vienna.usmission.gov/the-usa-at-the-69th-commission-on-narcotic-drugs-march-2026/" target="_blank" rel="noopener">U.S. Mission Vienna: The USA at the 69th CND</a></li>
<li><a href="https://www.eeas.europa.eu/delegations/vienna-international-organisations/eu-statement-general-debate-69th-session-commission-narcotic-drugs-9-march-2026_en" target="_blank" rel="noopener">EU Statement at the 69th CND General Debate</a></li>
<li><a href="https://www.cnn.com/2026/03/03/politics/us-military-ecuador-drug-trafficking" target="_blank" rel="noopener">CNN: U.S. Military Launches Anti-Drug Trafficking Operation in Ecuador</a></li>
</ul>

</div>"""

read_time = "7 min read"

# --- Insert into MongoDB ---
client = MongoClient(MONGO_URL)
db = client[DB_NAME]
collection = db["articles"]

doc = {
    "title": title,
    "slug": slug,
    "excerpt": excerpt,
    "content": content,
    "content_type": "news",
    "meta_title": meta_title,
    "meta_description": meta_description,
    "meta_keywords": meta_keywords,
    "tags": tags,
    "read_time": read_time,
    "faq_items": faq_items,
    "related_countries": ["AUT", "GBR", "ECU", "MEX", "DEU", "FRA", "FIN", "EST", "SWE", "NOR", "LVA", "NLD"],
    "related_states": [],
    "author_name": "United Rehabs Data Team",
    "is_published": True,
    "published_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc),
    "views_count": 0,
    "featured_image_url": ""
}

result = collection.update_one(
    {"slug": slug},
    {"$set": doc},
    upsert=True
)

if result.upserted_id:
    print(f"Inserted new article: {title}")
else:
    print(f"Updated existing article: {title}")

print(f"Slug: {slug}")
print(f"Word count: ~{len(content.split())}")
client.close()
