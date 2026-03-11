#!/usr/bin/env python3
"""Fix article thumbnails - set YouTube thumbnails for all news articles."""
import asyncio, re, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))
from motor.motor_asyncio import AsyncIOMotorClient

# YouTube videos for articles that don't have embedded videos
EXTRA_VIDEOS = {
    'federal-funding-cuts': 'OyYMO_HMJh0',
    'dea-tri-cities': 'jEL9DL_zCWE',
    'un-commission': 'LVrxty4DGJw',
    'texas-voters': 'yo0G7kAoEr8',
}

async def main():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DB_NAME', 'united_rehabs')]
    arts = await db.articles.find({'content_type': 'news', 'is_published': True}).to_list(50)

    fixed = 0
    for a in arts:
        slug = a['slug']
        content = a.get('content', '')
        updates = {}

        # Get YouTube ID from content or EXTRA_VIDEOS
        yt_match = re.search(r'youtube\.com/embed/([a-zA-Z0-9_-]{11})', content)
        yt_id = yt_match.group(1) if yt_match else None

        # Check extra videos for articles without embedded videos
        if not yt_id:
            for slug_part, vid_id in EXTRA_VIDEOS.items():
                if slug_part in slug:
                    yt_id = vid_id
                    # Add video embed to content
                    embed = f'<div style="margin: 2rem 0; border-radius: 12px; overflow: hidden;"><div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.youtube.com/embed/{vid_id}" title="Related video" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>'
                    h2_pos = re.search(r'</h2>', content)
                    if h2_pos:
                        pos = h2_pos.end()
                        updates['content'] = content[:pos] + embed + content[pos:]
                    break

        if yt_id:
            updates['youtube_video_id'] = yt_id
            updates['featured_image_url'] = f'https://img.youtube.com/vi/{yt_id}/hqdefault.jpg'

        if updates:
            await db.articles.update_one({'_id': a['_id']}, {'$set': updates})
            fixed += 1
            print(f'  OK: {a["title"][:55]} | yt={yt_id}')

    # Verify
    with_img = await db.articles.count_documents({
        'content_type': 'news', 'is_published': True,
        'featured_image_url': {'$ne': None, '$ne': ''}
    })
    total = await db.articles.count_documents({'content_type': 'news', 'is_published': True})
    print(f'\nFixed {fixed} articles. {with_img}/{total} have thumbnails.')

asyncio.run(main())
