import os
import django
import urllib.request
import json
import random
import shutil
from django.core.files.base import ContentFile
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from properties.models import Room, Facility, RoomImage, Review
from django.conf import settings

User = get_user_model()

# 20 Genuinely Different Properties
ROOMS = [
    {"id": "DEMO-R001", "title": "Minimalist Scandinavian PG", "type": "shared", "loc": "Ahmedabad", "price": 7500, "desc": "Clean, light-filled shared room with minimalist birch furniture and airy atmosphere. Perfect for students wanting peace."},
    {"id": "DEMO-R002", "title": "Luxury Japandi Studio", "type": "studio", "loc": "Surat", "price": 18500, "desc": "Premium studio blending Japanese elegance with Scandinavian comfort. Features low beds, bamboo accents, and warm lighting."},
    {"id": "DEMO-R003", "title": "Industrial Loft 1BHK", "type": "full", "loc": "Vadodara", "price": 16000, "desc": "Exposed brick walls, metal fixtures, and high ceilings. A spacious 1BHK for working professionals who love modern industrial design."},
    {"id": "DEMO-R004", "title": "Boho Chic Private Room", "type": "single", "loc": "Gandhinagar", "price": 9000, "desc": "Cozy single room decorated with macrame, plants, and colorful rugs. Attached private balcony with garden views."},
    {"id": "DEMO-R005", "title": "Classic Executive Suite", "type": "studio", "loc": "Rajkot", "price": 15000, "desc": "Traditional dark wood furniture, plush carpets, and a dedicated workspace. Ideal for traveling executives."},
    {"id": "DEMO-R006", "title": "Budget Student Dorm", "type": "shared", "loc": "Anand", "price": 5500, "desc": "No-frills, affordable shared room near the university. Includes sturdy bunk beds, study lamps, and fast Wi-Fi."},
    {"id": "DEMO-R007", "title": "Modern Contemporary 1BHK", "type": "full", "loc": "Ahmedabad", "price": 14500, "desc": "Sleek and modern 1BHK with smart home features, glass partitions, and a fully modular kitchen."},
    {"id": "DEMO-R008", "title": "Garden-side Co-living Room", "type": "shared", "loc": "Surat", "price": 6800, "desc": "Wake up to lush green views. This shared room features large french windows opening to the community garden."},
    {"id": "DEMO-R009", "title": "Premium Balcony Room", "type": "single", "loc": "Vadodara", "price": 11000, "desc": "Spacious single room with a massive private balcony overlooking the city skyline. Fully furnished with premium fittings."},
    {"id": "DEMO-R010", "title": "Vintage Heritage Room", "type": "single", "loc": "Rajkot", "price": 10500, "desc": "Experience royal living with antique furniture, patterned tiles, and majestic arched windows in this heritage property."},
    {"id": "DEMO-R011", "title": "Tech-Enabled Smart Room", "type": "single", "loc": "Gandhinagar", "price": 12500, "desc": "Voice-controlled lights, automated blinds, and smart lock entry. Designed for the tech-savvy professional."},
    {"id": "DEMO-R012", "title": "Cozy Attic Studio", "type": "studio", "loc": "Anand", "price": 13000, "desc": "Charming top-floor studio with slanted roofs, skylights, and a warm wooden interior. Highly private and quiet."},
    {"id": "DEMO-R013", "title": "Family Friendly 2BHK Setup", "type": "full", "loc": "Ahmedabad", "price": 22000, "desc": "Spacious apartment layout adapted for small families. Child-safe furniture, large kitchen, and community play area access."},
    {"id": "DEMO-R014", "title": "Artisan Crafted Room", "type": "single", "loc": "Surat", "price": 9500, "desc": "Unique room featuring handcrafted local art, custom wooden bedframes, and vibrant traditional textiles."},
    {"id": "DEMO-R015", "title": "Sunny Corner Shared PG", "type": "shared", "loc": "Vadodara", "price": 6000, "desc": "Bright corner room with dual-aspect windows. Excellent cross ventilation and ample natural light all day."},
    {"id": "DEMO-R016", "title": "Corporate Guest Room", "type": "single", "loc": "Gandhinagar", "price": 14000, "desc": "Hotel-style luxury room with daily housekeeping, minibar, and premium bedding for short or long corporate stays."},
    {"id": "DEMO-R017", "title": "Eco-Friendly Green Room", "type": "studio", "loc": "Rajkot", "price": 13500, "desc": "Sustainable living space with solar water heating, upcycled furniture, and extensive indoor plants."},
    {"id": "DEMO-R018", "title": "Riverside View Room", "type": "single", "loc": "Bharuch", "price": 8500, "desc": "Peaceful room overlooking the Narmada river. Features a comfortable window seat and breezy atmosphere."},
    {"id": "DEMO-R019", "title": "Compact Urban Micro-Studio", "type": "studio", "loc": "Ahmedabad", "price": 11500, "desc": "Cleverly designed micro-studio maximizing space with foldable furniture, loft bed, and hidden storage."},
    {"id": "DEMO-R020", "title": "Suburban Retreat 1BHK", "type": "full", "loc": "Vadodara", "price": 15500, "desc": "Quiet 1BHK located in the peaceful suburbs. Features a large private terrace and open-plan living area."}
]

def clear_existing():
    # 1. Delete all rooms
    Room.objects.all().delete()
    print("Deleted all existing rooms.")

    # 2. Clear media/properties directory
    media_props = os.path.join(settings.MEDIA_ROOT, 'properties')
    if os.path.exists(media_props):
        shutil.rmtree(media_props)
        print("Cleared media/properties directory.")

def get_or_create_users():
    owner, _ = User.objects.get_or_create(email='owner1@stayhub.com', defaults={'username':'owner1@stayhub.com','role':'owner'})
    tenant, _ = User.objects.get_or_create(email='tenant1@stayhub.com', defaults={'username':'tenant1@stayhub.com','role':'tenant'})
    return owner, tenant

def download_image(room, url, index):
    # Append width/quality params
    full_url = f"{url}?w=800&q=80"
    req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req)
        file_content = response.read()
        is_primary = (index == 0)
        room_image = RoomImage(room=room, is_primary=is_primary)
        filename = f"{room.title.replace(' ', '_')}_img_{index}.jpg"
        room_image.image.save(filename, ContentFile(file_content), save=True)
    except Exception as e:
        print(f"Failed to download {full_url}: {e}")

def seed():
    clear_existing()
    owner, tenant = get_or_create_users()
    
    # Facilities
    facilities = list(Facility.objects.all())
    if not facilities:
        facilities = [
            Facility.objects.create(name='High-Speed WiFi', icon='fas fa-wifi'),
            Facility.objects.create(name='Air Conditioning', icon='fas fa-snowflake'),
            Facility.objects.create(name='Shared Kitchen', icon='fas fa-utensils'),
            Facility.objects.create(name='Bed', icon='fas fa-bed'),
            Facility.objects.create(name='Wardrobe', icon='fas fa-door-closed')
        ]
        
    # Load unique URLs
    with open('urls.json', 'r') as f:
        unique_urls = json.load(f)
        
    picsum_idx = 10
    while len(unique_urls) < 100:
        unique_urls.append(f"https://picsum.photos/id/{picsum_idx}/800/600")
        picsum_idx += 1
        
    now = timezone.now()
    url_index = 0

    for idx, data in enumerate(ROOMS):
        room = Room.objects.create(
            owner=owner,
            title=data['title'],
            description=data['desc'],
            price=data['price'],
            location=data['loc'],
            address=f"Central {data['loc']}, Gujarat",
            room_type=data['type'],
            is_available=True,
            created_at=now - timedelta(minutes=20 - idx)
        )
        selected_facilities = random.sample(facilities, k=random.randint(3, len(facilities)))
        room.facilities.set(selected_facilities)
        
        # Download 5 unique images
        for i in range(5):
            download_image(room, unique_urls[url_index], i)
            url_index += 1
            
        Review.objects.create(room=room, user=tenant, rating=random.choice([4, 5]), comment="Amazing interior design! Exactly as pictured.")
        print(f"[{data['id']}] Created {room.title} with 5 unique images.")
        
    print("\nValidating Duplicates...")
    print(f"Total Demo Rooms: {Room.objects.count()}")
    total_imgs = RoomImage.objects.count()
    print(f"Total Images: {total_imgs}")
    
    # Hash check
    hashes = set()
    duplicates = 0
    for img in RoomImage.objects.all():
        with open(img.image.path, 'rb') as f:
            h = hashlib.sha256(f.read()).hexdigest()
            if h in hashes:
                duplicates += 1
            hashes.add(h)
    
    print(f"Unique Images (by hash): {len(hashes)}")
    print(f"Duplicate Images: {duplicates}")
    
    if duplicates > 0:
        print("WARNING: Duplicate images detected!")
    else:
        print("SUCCESS: 0 Duplicate Images! All 100 images are totally unique.")

if __name__ == '__main__':
    import hashlib
    seed()
