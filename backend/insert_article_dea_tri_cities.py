"""
Insert article: DEA Tri-Cities Washington historic drug seizure
"""
import os
import sys
from datetime import datetime, timezone
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "united_rehabs")

slug = "dea-tri-cities-washington-largest-drug-seizure-eastern-washington"

title = "DEA Executes Largest Drug Seizure in Eastern Washington History, Removing 370 Pounds of Fentanyl and Meth From Tri-Cities"

excerpt = "Federal agents seized 164 pounds of fentanyl, 200 pounds of meth, 16 firearms, and $2 million in cash in a historic Tri-Cities drug bust."

meta_title = "DEA Largest Drug Seizure Eastern Washington - 370 Pounds Fentanyl, Meth Seized in Tri-Cities"
meta_description = "DEA agents seized 370 pounds of fentanyl and methamphetamine plus $2 million cash in the largest drug bust in Eastern Washington history. Full details inside."
meta_keywords = [
    "DEA drug seizure", "Tri-Cities drug bust", "Eastern Washington fentanyl",
    "methamphetamine seizure", "drug trafficking arrest", "fentanyl crisis",
    "DEA enforcement", "Washington state drugs", "Amador Sanchez",
    "drug bust 2026", "fentanyl seizure", "law enforcement drug operation"
]

tags = [
    "DEA", "Drug Seizure", "Fentanyl", "Methamphetamine", "Washington State",
    "Tri-Cities", "Drug Trafficking", "Law Enforcement", "Drug Bust",
    "Federal Investigation", "Opioid Crisis"
]

faq_items = [
    {
        "question": "How much fentanyl was seized in the Tri-Cities drug bust?",
        "answer": "DEA agents seized more than 164 pounds of powdered fentanyl during the March 3, 2026 operation in the Tri-Cities area of Washington state. This was part of a larger haul totaling approximately 370 pounds of controlled substances."
    },
    {
        "question": "Who is the suspect in the Eastern Washington drug trafficking case?",
        "answer": "The investigation targeted Amador Sanchez and several co-conspirators. According to the DEA, Sanchez was on federal supervised release from a previous drug trafficking conviction at the time of the bust and used multiple residences across the Tri-Cities to conceal his operations."
    },
    {
        "question": "Why is this drug seizure historically significant?",
        "answer": "The March 2026 Tri-Cities bust is the largest seizure of controlled substances in the history of the Eastern District of Washington. Agents recovered more than 200 pounds of methamphetamine, 164 pounds of fentanyl, 5 pounds of cocaine, $2 million in cash, and 16 firearms."
    },
    {
        "question": "Where can someone get help for fentanyl or opioid addiction?",
        "answer": "SAMHSA's National Helpline at 1-800-662-4357 offers free, confidential, 24/7 treatment referrals and information. The 988 Suicide and Crisis Lifeline is also available around the clock by calling or texting 988."
    }
]

content = """
<nav class="table-of-contents">
<h2>Table of Contents</h2>
<ul>
<li><a href="#record-breaking-seizure">Record-Breaking Seizure Stuns Eastern Washington</a></li>
<li><a href="#what-agents-found">What Agents Found Inside the Tri-Cities Properties</a></li>
<li><a href="#suspect-background">Suspect Was Already on Federal Supervised Release</a></li>
<li><a href="#fentanyl-scale">Putting 164 Pounds of Fentanyl in Perspective</a></li>
<li><a href="#declining-overdose-deaths">A Complicated Picture: Overdose Deaths Are Falling</a></li>
<li><a href="#washington-state-context">Washington State's Ongoing Battle With Drug Trafficking</a></li>
<li><a href="#whats-next">What Happens Next in the Investigation</a></li>
<li><a href="#getting-help">Getting Help for Substance Use Disorders</a></li>
<li><a href="#faq">Frequently Asked Questions</a></li>
<li><a href="#further-reading">Further Reading</a></li>
</ul>
</nav>

<h2 id="record-breaking-seizure">Record-Breaking Seizure Stuns Eastern Washington</h2>

<p>Federal drug enforcement agents executed search warrants at multiple properties across the Tri-Cities area of Washington state on March 3, 2026, hauling away roughly 370 pounds of controlled substances in what the Drug Enforcement Administration called the largest seizure in the Eastern District of Washington's history.</p>

<p>The operation targeted residences in Kennewick, Pasco, and Richland linked to an ongoing trafficking investigation. When the counts were tallied, agents had removed more than 200 pounds of methamphetamine, over 164 pounds of powdered fentanyl, and more than 5 pounds of cocaine from the region's streets.</p>

<p>They also recovered approximately $2 million in U.S. currency and 16 firearms. The DEA's Seattle Field Division announced the results on March 6, calling the quantities "extraordinary" and warning the drugs had "the potential to cause devastating harm" to families across the Pacific Northwest.</p>

<h2 id="what-agents-found">What Agents Found Inside the Tri-Cities Properties</h2>

<p>The search warrants covered several addresses spread across all three cities that make up the Tri-Cities metropolitan area. Investigators had been watching the properties for months as part of a broader trafficking probe, according to law enforcement officials familiar with the case.</p>

<p>Inside the residences, agents discovered methamphetamine packaged for distribution alongside large quantities of powdered fentanyl, a synthetic opioid roughly 50 to 100 times more potent than morphine. The cocaine, while a smaller portion of the total haul, added to the picture of a multi-drug distribution network operating in plain sight within residential neighborhoods.</p>

<p>The $2 million in seized cash and the 16 firearms underscore the scale of the operation. Weapons recovered during drug raids often indicate that traffickers expect violence, either from rival suppliers or from attempts to protect their supply chain.</p>

<h2 id="suspect-background">Suspect Was Already on Federal Supervised Release</h2>

<p>At the center of the investigation is Amador Sanchez, who the DEA identified as the principal target. According to federal officials, Sanchez was on supervised release at the time of the bust, stemming from a previous federal drug trafficking conviction.</p>

<p>Supervised release is the federal equivalent of parole. It means Sanchez had already served time in federal prison for trafficking and was living under court-ordered conditions when agents allege he resumed large-scale drug distribution across the Tri-Cities.</p>

<p>The investigation revealed that Sanchez used at least one residence in each of the three cities, Kennewick, Pasco, and Richland, to facilitate and conceal his alleged operations. Several co-conspirators have also been identified, though the DEA has not publicly named them. Indictments are expected as the investigation continues.</p>

<h2 id="fentanyl-scale">Putting 164 Pounds of Fentanyl in Perspective</h2>

<p>Numbers like "164 pounds of fentanyl" can sound abstract. They are not. The DEA estimates that a lethal dose of fentanyl for most adults is approximately 2 milligrams, roughly the weight of a few grains of salt.</p>

<p>One pound contains about 453,592 milligrams. At 2 milligrams per lethal dose, a single pound of pure fentanyl could theoretically produce more than 226,000 fatal doses. Multiply that across 164 pounds, and the seized fentanyl alone could have generated over 37 million lethal doses.</p>

<p>That figure is theoretical, since street-level fentanyl is cut and diluted before it reaches users. But even at dramatically lower concentrations, the volume removed from circulation in this single bust is staggering. For context, Washington state's entire population is about 7.8 million people.</p>

<h2 id="declining-overdose-deaths">A Complicated Picture: Overdose Deaths Are Falling</h2>

<p>The Tri-Cities bust lands against a backdrop of cautiously encouraging national data. The Centers for Disease Control and Prevention reported in early 2026 that U.S. drug overdose deaths fell to approximately 72,108 in the 12-month period ending September 2025, an 18.9% decline compared to the previous year.</p>

<p>That drop, the longest sustained decline in decades, has been attributed to several factors: wider distribution of naloxone (the opioid-reversal medication sold under the brand name Narcan), expanded access to medications for opioid use disorder like buprenorphine and methadone, and shifts in the illegal drug supply itself, according to CDC researchers.</p>

<p>Still, synthetic opioids, primarily illicitly manufactured fentanyl, remain the leading driver of overdose fatalities. In the 12-month period ending March 2025, opioids were involved in 66.2% of all overdose deaths, with synthetic opioids alone accounting for 57.9%, per CDC provisional data.</p>

<p>Seizures like the one in the Tri-Cities illustrate why the crisis is far from over. Even as death tolls fall, massive quantities of fentanyl continue to flow through distribution networks in communities large and small.</p>

<h2 id="washington-state-context">Washington State's Ongoing Battle With Drug Trafficking</h2>

<p>Eastern Washington has not historically drawn the same attention as the state's major urban centers when it comes to drug enforcement. Seattle and Tacoma tend to dominate headlines. But the Tri-Cities bust reveals that trafficking networks have extended deep into the agricultural and suburban communities of the Columbia Basin.</p>

<p>The Tri-Cities, home to roughly 300,000 residents across the metropolitan area, sits at a crossroads of major highways including Interstate 82 and U.S. Route 395. That geography makes the region a logical distribution point for drugs moving north from supply corridors along the southern border or east from the I-5 corridor.</p>

<p>Washington state law enforcement agencies have flagged fentanyl as a growing threat for several years. The state saw fentanyl-related overdose deaths climb sharply between 2019 and 2023 before the national decline began to take hold. State officials have credited expanded harm reduction programs and increased law enforcement coordination with federal agencies for slowing the toll.</p>

<h2 id="whats-next">What Happens Next in the Investigation</h2>

<p>The DEA said the investigation into the Tri-Cities trafficking network remains active. Federal prosecutors in the Eastern District of Washington are expected to bring indictments against Sanchez and his alleged co-conspirators, though no formal charges had been announced as of the DEA's March 6 press release.</p>

<p>If convicted of federal drug trafficking charges involving the quantities described in this seizure, defendants could face mandatory minimum sentences of 10 years to life in federal prison under current sentencing guidelines. The fact that Sanchez was allegedly operating while on supervised release from a prior trafficking conviction would likely result in enhanced penalties.</p>

<p>The seized cash and firearms could also lead to additional charges, including money laundering and possession of firearms in furtherance of drug trafficking, each carrying their own substantial penalties.</p>

<h2 id="getting-help">Getting Help for Substance Use Disorders</h2>

<p>Large-scale drug busts remove dangerous substances from communities, but they do not address the demand side of the crisis. Millions of Americans struggle with substance use disorders involving opioids, methamphetamine, and other drugs, and effective treatment exists.</p>

<p>If you or someone you know is struggling with addiction, the following resources provide free, confidential support:</p>

<ul>
<li><strong>SAMHSA National Helpline:</strong> 1-800-662-4357 (free, confidential, 24/7, 365 days a year). Provides treatment referrals and information in English and Spanish.</li>
<li><strong>988 Suicide and Crisis Lifeline:</strong> Call or text 988. Available 24/7 for people in emotional distress or suicidal crisis.</li>
<li><strong>SAMHSA Online Treatment Locator:</strong> <a href="https://findtreatment.gov" target="_blank" rel="noopener">findtreatment.gov</a></li>
</ul>

<p>Recovery is possible. Evidence-based treatments including medication-assisted treatment, behavioral therapy, and peer support programs have helped millions of people rebuild their lives.</p>

<h2 id="faq">Frequently Asked Questions</h2>

<h3>How much fentanyl was seized in the Tri-Cities drug bust?</h3>
<p>DEA agents seized more than 164 pounds of powdered fentanyl during the March 3, 2026 operation in the Tri-Cities area of Washington state. This was part of a larger haul totaling approximately 370 pounds of controlled substances.</p>

<h3>Who is the suspect in the Eastern Washington drug trafficking case?</h3>
<p>The investigation targeted Amador Sanchez and several co-conspirators. According to the DEA, Sanchez was on federal supervised release from a previous drug trafficking conviction at the time of the bust and used multiple residences across the Tri-Cities to conceal his operations.</p>

<h3>Why is this drug seizure historically significant?</h3>
<p>The March 2026 Tri-Cities bust is the largest seizure of controlled substances in the history of the Eastern District of Washington. Agents recovered more than 200 pounds of methamphetamine, 164 pounds of fentanyl, 5 pounds of cocaine, $2 million in cash, and 16 firearms.</p>

<h3>Where can someone get help for fentanyl or opioid addiction?</h3>
<p>SAMHSA's National Helpline at 1-800-662-4357 offers free, confidential, 24/7 treatment referrals and information. The 988 Suicide and Crisis Lifeline is also available around the clock by calling or texting 988.</p>

<h2 id="further-reading">Further Reading</h2>

<ul>
<li><a href="https://www.dea.gov/press-releases/2026/03/06/dea-search-warrants-tri-cities-result-largest-drug-seizure-eastern" target="_blank" rel="noopener">DEA Press Release: DEA Search Warrants in Tri-Cities Result in Largest Drug Seizure in Eastern District of Washington History</a></li>
<li><a href="https://www.spokesman.com/stories/2026/mar/06/dea-makes-largest-drug-seizure-in-eastern-washingt/" target="_blank" rel="noopener">The Spokesman-Review: DEA Makes Largest Drug Seizure in Eastern Washington History</a></li>
<li><a href="https://komonews.com/news/local/dea-raids-tri-cities-washington-in-edwas-largest-controlled-substance-seizure-in-history-370-pounds-200-methamphetamine-164-powdered-fentanyl-5-cocaine-drug-bust" target="_blank" rel="noopener">KOMO News: DEA Says Federal Agents Seized Nearly 370 Pounds of Drugs in Historic Tri-Cities Bust</a></li>
<li><a href="https://www.koin.com/news/washington/record-breaking-drug-bust-in-tri-cities-yields-over-300-pounds-of-narcotics-seattle-dea/" target="_blank" rel="noopener">KOIN: Record-Breaking Drug Bust in Tri-Cities Yields Over 300 Pounds of Narcotics</a></li>
<li><a href="https://www.cdc.gov/nchs/nvss/vsrr/drug-overdose-data.htm" target="_blank" rel="noopener">CDC Provisional Drug Overdose Death Counts</a></li>
<li><a href="https://nida.nih.gov/research-topics/trends-statistics/overdose-death-rates" target="_blank" rel="noopener">NIDA: Drug Overdose Death Rates</a></li>
</ul>
""".strip()

# Calculate read time (~200 words per minute)
word_count = len(content.split())
read_time = max(4, round(word_count / 200))

article = {
    "title": title,
    "slug": slug,
    "excerpt": excerpt[:155],
    "content": content,
    "content_type": "news",
    "meta_title": meta_title,
    "meta_description": meta_description,
    "meta_keywords": meta_keywords,
    "tags": tags,
    "read_time": f"{read_time} min read",
    "faq_items": faq_items,
    "related_countries": ["USA"],
    "related_states": ["WA"],
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
    {"slug": slug},
    {"$set": article},
    upsert=True
)

if result.upserted_id:
    print(f"INSERTED new article:")
else:
    print(f"UPDATED existing article:")

print(f"  Title: {title}")
print(f"  Slug:  {slug}")
print(f"  Read time: {read_time} min read")
print(f"  Word count: ~{word_count}")
print(f"  Tags: {', '.join(tags)}")

client.close()
