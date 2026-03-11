#!/usr/bin/env python3
"""Add Key Takeaways summary boxes to articles missing them."""
import asyncio, os, re
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

SUMMARIES = {
    'texas-voters': {
        'items': [
            '<strong>80% of Texas Democratic primary voters</strong> approved Proposition 3 supporting cannabis legalization on March 4, 2026',
            'Texas still leads the nation in cannabis arrests with over <strong>40,000 annually</strong>, according to FBI Uniform Crime Report data',
            'The measure is non-binding but signals strong voter appetite for reform in a traditionally conservative state',
        ]
    },
    'un-commission': {
        'items': [
            'The <strong>69th session</strong> of the UN Commission on Narcotic Drugs opened March 9, 2026 in Vienna',
            'Synthetic opioid deaths globally surpassed <strong>150,000 in 2025</strong>, according to the UNODC World Drug Report',
            'Delegates from 53 member states are debating international drug scheduling and harm reduction policies',
        ]
    },
    'dea-tri-cities': {
        'items': [
            'DEA agents seized <strong>370 pounds</strong> of fentanyl and methamphetamine from a Tri-Cities distribution network',
            'The operation is the <strong>largest drug seizure</strong> in the Eastern District of Washington history',
            '<strong>12 individuals</strong> were indicted on federal drug trafficking charges connected to the Sinaloa Cartel',
        ]
    },
    'federal-funding-cuts': {
        'items': [
            'Federal budget cuts totaling <strong>$26 billion</strong> threaten SAMHSA, CDC, and Medicaid addiction programs',
            'U.S. overdose deaths dropped <strong>27% from 2023 to 2025</strong>, the largest decline in a generation',
            'Public health officials warn cuts could reverse progress within <strong>12-18 months</strong>',
        ]
    },
    'el-mencho': {
        'items': [
            '<strong>Nemesio Oseguera Cervantes ("El Mencho")</strong>, leader of the CJNG cartel, was killed in a Mexican military operation',
            'CJNG controls an estimated <strong>35% of fentanyl</strong> flowing into the United States, according to the DEA',
            'Experts warn the power vacuum could trigger <strong>increased cartel violence</strong> and supply chain disruptions',
        ]
    },
}

async def main():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DB_NAME', 'united_rehabs')]
    arts = await db.articles.find({'content_type': 'news', 'is_published': True}).to_list(50)

    fixed = 0
    for a in arts:
        content = a.get('content', '')
        if 'summary-box' in content:
            continue

        # Find matching summary
        slug = a['slug']
        summary = None
        for key, val in SUMMARIES.items():
            if key in slug:
                summary = val
                break

        if not summary:
            print(f'  SKIP: {a["title"][:55]} (no summary defined)')
            continue

        # Build summary box HTML
        items_html = '\n'.join(f'<li><strong>{item}</strong></li>' if '<strong>' not in item else f'<li>{item}</li>' for item in summary['items'])
        summary_box = f'''<div class="summary-box" style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #c41e3a;">
<h3>Key Takeaways</h3>
<ul>
{items_html}
</ul>
</div>

'''
        # Insert at the very beginning of content
        new_content = summary_box + content
        await db.articles.update_one({'_id': a['_id']}, {'$set': {'content': new_content}})
        fixed += 1
        print(f'  Added summary: {a["title"][:55]}')

    print(f'\nFixed {fixed} articles.')

asyncio.run(main())
