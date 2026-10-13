import os
import django
import urllib.request
import random
from django.core.files.base import ContentFile
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from properties.models import Room, Facility, RoomImage, Review

User = get_user_model()

PROPERTIES = [
    {"title": "Elite Student Room", "desc": "A quiet and bright room designed for students, featuring a large study desk, ergonomic chair, and fast Wi-Fi.", "price": 8600, "loc": "Ahmedabad", "addr": "Navrangpura, Ahmedabad, Gujarat", "type": "single"},
    {"title": "Deluxe Studio Apartment", "desc": "A luxurious studio setup offering total privacy, modern kitchenette, and access to an in-house gym and pool.", "price": 16500, "loc": "Surat", "addr": "Vesu, Surat, Gujarat", "type": "studio"},
    {"title": "Relaxing Shared Accommodation", "desc": "Spacious shared accommodation with large wardrobes, attached bathroom, and a sunny balcony.", "price": 5600, "loc": "Rajkot", "addr": "Kalawad Road, Rajkot, Gujarat", "type": "shared"}
]

IMAGE_URLS = [
    'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?w=800&q=80',
    'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80'
]

def get_or_create_users():
    owner, _ = User.objects.get_or_create(email='owner1@stayhub.com', defaults={'username':'owner1@stayhub.com','role':'owner'})
    tenant, _ = User.objects.get_or_create(email='tenant1@stayhub.com', defaults={'username':'tenant1@stayhub.com','role':'tenant'})
    return owner, tenant

def download_image(room, url, index):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req)
        file_content = response.read()
        is_primary = (index == 0)
        room_image = RoomImage(room=room, is_primary=is_primary)
        filename = f"room_{room.id}_img_{index}.jpg"
        room_image.image.save(filename, ContentFile(file_content), save=True)
    except Exception as e:
        print(f"Failed to download image: {e}")

def seed_3_rooms():
    owner, tenant = get_or_create_users()
    facilities = list(Facility.objects.all())
    now = timezone.now()

    for idx, data in enumerate(PROPERTIES):
        if Room.objects.filter(title=data['title']).exists():
            continue
        
        room = Room.objects.create(
            owner=owner,
            title=data['title'],
            description=data['desc'],
            price=data['price'],
            location=data['loc'],
            address=data['addr'],
            room_type=data['type'],
            is_available=True,
            created_at=now - timedelta(minutes=5 - idx)
        )
        selected_facilities = random.sample(facilities, k=3)
        room.facilities.set(selected_facilities)
        
        for i in range(5):
            download_image(room, IMAGE_URLS[i], i)
            
        Review.objects.create(room=room, user=tenant, rating=5, comment="Excellent!")

if __name__ == '__main__':
    seed_3_rooms()
