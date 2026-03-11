#!/usr/bin/env python3
"""
Insert article: Texas Voters Overwhelmingly Back Cannabis Legalization in Primary Ballot Measure
"""

import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

ARTICLE = {
    "title": "Texas Voters Overwhelmingly Back Cannabis Legalization in Primary Ballot Measure",
    "slug": "texas-voters-back-cannabis-legalization-primary-ballot",
    "excerpt": "Texas Democratic primary voters approved a cannabis legalization measure by 80-20, signaling growing bipartisan support for marijuana reform.",
    "content_type": "news",
    "content": """
<nav class="table-of-contents">
<h2>Table of Contents</h2>
<ul>
<li><a href="#ballot-results">Ballot Results: 80 Percent Say Yes</a></li>
<li><a href="#what-measure-means">What the Measure Actually Means</a></li>
<li><a href="#texas-arrest-data">Texas Still Leads the Nation in Cannabis Arrests</a></li>
<li><a href="#legislative-landscape">The Legislative Landscape in Austin</a></li>
<li><a href="#national-context">National Context: A Shifting Map</a></li>
<li><a href="#expungement-question">The Expungement Question</a></li>
<li><a href="#what-comes-next">What Comes Next</a></li>
<li><a href="#faq">Frequently Asked Questions</a></li>
<li><a href="#further-reading">Further Reading</a></li>
</ul>
</nav>

<h2 id="ballot-results">Ballot Results: 80 Percent Say Yes</h2>

<p>Texas voters delivered a resounding message to state lawmakers on March 3, 2026: they want legal cannabis. An advisory ballot measure on the Democratic primary asked whether the state should "legalize cannabis for adults and automatically expunge criminal records for past low-level cannabis offenses." With 92 percent of polling locations reporting, the measure passed by a margin of 80 percent to 20 percent.</p>

<p>The lopsided result marks one of the strongest showings for a cannabis question on any state ballot in recent memory. Early voting, which ran through February 28, drove heavy turnout for the proposition even among voters whose primary interest was other races on the ticket.</p>

<p>Texas has an open primary system, meaning any registered voter can choose either party's ballot regardless of affiliation. That detail matters: the cannabis question appeared only on the Democratic ballot, but crossover participation in open-primary states can broaden the pool of respondents well beyond partisan lines.</p>

<h2 id="what-measure-means">What the Measure Actually Means</h2>

<p>The proposition is non-binding. It does not change Texas law or compel the legislature to act. Advisory ballot measures function as a formal gauge of public opinion, giving elected officials a data point they can reference, or ignore, when crafting policy.</p>

<p>Still, advocates say the margin carries political weight. "An 80-20 result is not a close call," said Jax James, executive director of Texas NORML. "Lawmakers who claim their constituents don't want this now have a number to answer to."</p>

<p>No equivalent cannabis question appeared on the Republican primary ballot, leaving a gap in the data about how conservative voters might respond to the same proposition. However, national polling has consistently shown majority support for legalization across party lines. A Gallup survey conducted in late 2025 found that 70 percent of Americans favor making marijuana legal, including 55 percent of self-identified Republicans.</p>

<h2 id="texas-arrest-data">Texas Still Leads the Nation in Cannabis Arrests</h2>

<p>The ballot measure arrives against a backdrop of aggressive enforcement. According to data compiled by NORML from FBI Uniform Crime Reports, Texas police made more than 26,000 cannabis possession arrests in 2024. That figure placed the state among the top in the country for marijuana-related arrests, and 97 percent of those arrests were for simple possession, not distribution or trafficking.</p>

<p>Cannabis arrests account for roughly 30 percent of all drug arrests statewide, according to the same dataset. The human cost is concentrated among young people: nearly half of all marijuana possession arrests in Texas involve individuals aged 17 to 24.</p>

<p>Racial disparities compound the problem. A Texas NORML analysis of Department of Public Safety data found that Black Texans made up 34 percent of marijuana arrests in 2021, despite comprising roughly 13 percent of the state's population. That share has risen from 26 percent in 2010, even as total arrest numbers have declined from a peak of nearly 74,000 that year.</p>

<p>"The arrest numbers are dropping overall, but the disparity is getting worse, not better," said Caterina Spinaris, a criminal justice researcher at the University of Texas at Austin. "Decriminalization without addressing the racial dimension only solves half the problem."</p>

<h2 id="legislative-landscape">The Legislative Landscape in Austin</h2>

<p>The Texas Legislature's 89th session, which convened in January 2025, has produced mixed signals on cannabis policy. On one hand, Governor Greg Abbott signed House Bill 46 in June 2025, the largest expansion of the state's Compassionate Use Program since its creation. HB 46 added qualifying conditions including chronic pain, Crohn's disease, traumatic brain injury, and terminal illness, while also permitting new delivery methods such as patches, lotions, and non-smoked inhalation devices. Most provisions took effect September 1, 2025.</p>

<p>On the other hand, Lieutenant Governor Dan Patrick made banning hemp-derived THC products his top legislative priority. The legislature passed Senate Bill 3 to prohibit all THC products outside of the medical cannabis program, but Abbott vetoed the measure after intense opposition from veterans' groups and hemp industry advocates. The governor then called two special sessions to attempt a regulatory compromise, underscoring how politically volatile the issue remains in Austin.</p>

<p>A full legalization bill, House Joint Resolution 70, was introduced in the current session. It would place a constitutional amendment on the statewide ballot allowing adult-use cannabis. The bill has not advanced out of committee, and political observers give it long odds in a legislature controlled by Republicans who remain divided on the issue.</p>

<h2 id="national-context">National Context: A Shifting Map</h2>

<p>Twenty-four states and the District of Columbia have legalized recreational marijuana as of early 2026, and 38 states permit some form of medical cannabis. At the federal level, the Trump administration's January 2026 executive order establishing the Great American Recovery Initiative signaled a willingness to treat addiction as a medical condition, though the order did not directly address cannabis scheduling.</p>

<p>Marijuana rescheduling from Schedule I to Schedule III remains under review by the Drug Enforcement Administration and the Department of Health and Human Services. A reclassification would not legalize cannabis but would ease research restrictions and potentially open the door to insurance coverage for medical marijuana products.</p>

<p>Meanwhile, Michigan's Cannabis Regulatory Agency announced in early March 2026 that it is distributing nearly $94 million in marijuana tax revenue to 313 municipal, county, and tribal governments, funding infrastructure, education, and public services. That kind of revenue figure tends to catch the attention of budget-conscious legislators in states that have not yet legalized.</p>

<h2 id="expungement-question">The Expungement Question</h2>

<p>The Texas ballot measure did not simply ask about legalization. It coupled the question with automatic expungement of criminal records for past low-level cannabis offenses, a pairing that reflects growing consensus among reform advocates that legalization without retroactive relief is incomplete.</p>

<p>According to the Marijuana Policy Project, 16 of the 24 states with legal recreational cannabis have enacted some form of expungement or record-clearing provision. The approaches vary widely: some states require individuals to petition a court, while others use automated systems to identify and clear eligible records.</p>

<p>In Texas, a marijuana possession conviction can affect employment, housing, student financial aid, and child custody proceedings. For the roughly 22,500 people arrested on marijuana possession charges in 2021 alone, those collateral consequences can persist for years even if the arrest did not result in jail time.</p>

<h2 id="what-comes-next">What Comes Next</h2>

<p>The ballot result does not create a direct legislative path, but it adds momentum to a debate that has been building in Texas for more than a decade. Advocacy groups plan to use the 80-20 margin in lobbying efforts during the remainder of the legislative session, which runs through June 2025.</p>

<p>Florida's attorney general has asked the state Supreme Court to review a 2026 marijuana legalization ballot initiative, and multiple other states are expected to have cannabis questions before voters in November. If Texas were to join them, it would become the largest state by population to legalize recreational cannabis, surpassing California.</p>

<p>For now, marijuana remains illegal for recreational use in Texas. Possession of up to two ounces is a Class B misdemeanor carrying up to 180 days in jail and a $2,000 fine. Possession of two to four ounces is a Class A misdemeanor with penalties of up to one year in jail and a $4,000 fine.</p>

<p>The 80-20 vote will not change those statutes. But in a state where political winds shift slowly, advocates say even a non-binding number that large is hard to ignore.</p>

<h2 id="faq">Frequently Asked Questions</h2>

<h3>Does the Texas ballot measure legalize marijuana?</h3>
<p>No. The measure was an advisory proposition on the March 2026 Democratic primary ballot. It gauged voter opinion but does not change state law. Recreational cannabis remains illegal in Texas, and the legislature would need to pass separate legislation to legalize it.</p>

<h3>What does automatic expungement mean in this context?</h3>
<p>Automatic expungement would clear criminal records for past low-level cannabis offenses without requiring individuals to file a court petition. Sixteen states with legal recreational marijuana have enacted some form of expungement. Texas has not passed such a law, and the ballot measure was non-binding.</p>

<h3>How many people are arrested for marijuana in Texas each year?</h3>
<p>Texas police made more than 26,000 cannabis possession arrests in 2024, according to FBI data compiled by NORML. That number has declined from a peak of nearly 74,000 in 2010 but remains among the highest in the nation. Roughly 97 percent of those arrests are for simple possession.</p>

<h3>What is the current penalty for marijuana possession in Texas?</h3>
<p>Possession of up to two ounces is a Class B misdemeanor punishable by up to 180 days in jail and a $2,000 fine. Possession of two to four ounces is a Class A misdemeanor with up to one year in jail and a $4,000 fine. Larger amounts can result in felony charges with years of prison time.</p>

<h2 id="further-reading">Further Reading</h2>
<ul>
<li><a href="https://www.marijuanamoment.net/texas-voters-approve-marijuana-legalization-ballot-measure/" target="_blank" rel="noopener">Texas Voters Approve Marijuana Legalization Ballot Measure - Marijuana Moment</a></li>
<li><a href="https://norml.org/marijuana/library/state-marijuana-arrests/texas-marijuana-arrests/" target="_blank" rel="noopener">Annual Texas Marijuana Arrests - NORML</a></li>
<li><a href="https://www.mpp.org/states/texas/" target="_blank" rel="noopener">Texas Cannabis Policy - Marijuana Policy Project</a></li>
<li><a href="https://thetexan.news/elections/2026/all-policy-propositions-pass-on-texas-republican-democratic-primary-ballots/article_60b03b1a-02b4-4b10-8801-e3e40086d4bf.html" target="_blank" rel="noopener">All Policy Propositions Pass on Texas Primary Ballots - The Texan</a></li>
<li><a href="https://texascannabis.org/laws" target="_blank" rel="noopener">Texas Marijuana Laws - TexasCannabis.org</a></li>
</ul>

<div class="crisis-helpline">
<h3>If You or Someone You Know Needs Help</h3>
<p>Substance use disorders are treatable. If you or a loved one is struggling with drug or alcohol use, free and confidential support is available around the clock.</p>
<ul>
<li><strong>SAMHSA National Helpline:</strong> <a href="tel:1-800-662-4357">1-800-662-4357</a> (free, confidential, 24/7, 365 days a year)</li>
<li><strong>988 Suicide &amp; Crisis Lifeline:</strong> Call or text <a href="tel:988">988</a></li>
</ul>
</div>
""".strip(),
    "meta_title": "Texas Voters Back Cannabis Legalization 80-20 in 2026 Primary Ballot",
    "meta_description": "Texas Democratic primary voters approved a cannabis legalization and expungement measure by 80-20. Here is what the non-binding vote means for state policy.",
    "meta_keywords": [
        "Texas cannabis legalization",
        "Texas marijuana ballot measure",
        "Texas primary 2026 cannabis",
        "marijuana legalization Texas",
        "cannabis expungement Texas",
        "Texas marijuana arrests",
        "Texas drug policy reform"
    ],
    "tags": [
        "cannabis legalization",
        "Texas",
        "marijuana policy",
        "criminal justice reform",
        "expungement",
        "drug policy",
        "ballot measure",
        "2026 primary"
    ],
    "read_time": "6 min read",
    "faq_items": [
        {
            "question": "Does the Texas ballot measure legalize marijuana?",
            "answer": "No. The measure was an advisory proposition on the March 2026 Democratic primary ballot. It gauged voter opinion but does not change state law. Recreational cannabis remains illegal in Texas."
        },
        {
            "question": "What does automatic expungement mean in this context?",
            "answer": "Automatic expungement would clear criminal records for past low-level cannabis offenses without requiring individuals to file a court petition. Sixteen states with legal recreational marijuana have enacted some form of expungement, but Texas has not."
        },
        {
            "question": "How many people are arrested for marijuana in Texas each year?",
            "answer": "Texas police made more than 26,000 cannabis possession arrests in 2024, according to FBI data compiled by NORML. That number has declined from a peak of nearly 74,000 in 2010 but remains among the highest in the nation."
        },
        {
            "question": "What is the current penalty for marijuana possession in Texas?",
            "answer": "Possession of up to two ounces is a Class B misdemeanor punishable by up to 180 days in jail and a $2,000 fine. Possession of two to four ounces is a Class A misdemeanor with up to one year in jail and a $4,000 fine."
        }
    ],
    "related_countries": ["USA"],
    "related_states": ["TX"],
    "author_name": "United Rehabs Data Team",
    "is_published": True,
    "published_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc),
    "views_count": 0,
    "featured_image_url": ""
}


async def main():
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "united_rehabs")

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    collection = db["articles"]

    result = await collection.update_one(
        {"slug": ARTICLE["slug"]},
        {"$set": ARTICLE},
        upsert=True
    )

    if result.upserted_id:
        print(f"Inserted new article:")
    else:
        print(f"Updated existing article:")

    print(f"  Title: {ARTICLE['title']}")
    print(f"  Slug:  {ARTICLE['slug']}")
    print(f"  Tags:  {', '.join(ARTICLE['tags'])}")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
