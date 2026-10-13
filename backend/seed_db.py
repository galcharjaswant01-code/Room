import os
import django
from datetime import date, timedelta
import urllib.request
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from properties.models import Room, Facility, RoomImage, Review
from bookings.models import Booking

User = get_user_model()

# List of realistic property image URLs for seeding
ROOM_IMAGE_URLS = {
    'bedroom': [
        'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    'living': [
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    'kitchen': [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    'bathroom': [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    'study': [
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
}

def attach_images_to_room(room, categories):
    print(f"Downloading images for room: {room.title}")
    is_first = True
    for idx, category in enumerate(categories):
        # pick an image url based on room id to vary them
        urls = ROOM_IMAGE_URLS.get(category)
        if not urls: continue
        url = urls[(room.id + idx) % len(urls)]
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req)
            
            file_content = response.read()
            
            room_image = RoomImage(room=room, is_primary=is_first)
            filename = f"{category}_{room.id}.jpg"
            room_image.image.save(filename, ContentFile(file_content), save=True)
            is_first = False
            print(f"  -> Saved {category}")
        except Exception as e:
            print(f"  -> Failed to download {category}: {e}")

def create_seed_data():
    print("Clearing old data...")
    Booking.objects.all().delete()
    Review.objects.all().delete()
    RoomImage.objects.all().delete()
    Room.objects.all().delete()
    Facility.objects.all().delete()
    User.objects.all().delete()

    print("Creating Users...")
    admin = User.objects.create_superuser('admin@stayhub.com', 'admin@stayhub.com', 'admin123', first_name='System', last_name='Admin', role='admin')
    owner1 = User.objects.create_user('galcharjaswant01@gmail.com', 'galcharjaswant01@gmail.com', 'owner123', first_name='Jaswant', last_name='Galchar', role='owner')
    owner2 = User.objects.create_user('owner2@stayhub.com', 'owner2@stayhub.com', 'owner123', first_name='Jane', last_name='Smith', role='owner')
    tenant1 = User.objects.create_user('tenant1@stayhub.com', 'tenant1@stayhub.com', 'tenant123', first_name='Alice', last_name='Johnson', role='tenant')

    print("Creating Facilities...")
    wifi = Facility.objects.create(name='High-Speed WiFi', icon='fas fa-wifi')
    ac = Facility.objects.create(name='Air Conditioning', icon='fas fa-snowflake')
    kitchen = Facility.objects.create(name='Shared Kitchen', icon='fas fa-utensils')
    tv = Facility.objects.create(name='Smart TV', icon='fas fa-tv')
    laundry = Facility.objects.create(name='Laundry', icon='fas fa-tshirt')
    bed = Facility.objects.create(name='Bed', icon='fas fa-bed')
    wardrobe = Facility.objects.create(name='Wardrobe', icon='fas fa-door-closed')
    study = Facility.objects.create(name='Study Table', icon='fas fa-laptop-house')

    print("Creating Rooms...")
    
    # 1. Modern Student Room
    room1 = Room.objects.create(
        owner=owner1,
        title='Modern Student Room',
        description='A modern, bright student room perfectly located for university access. Includes a dedicated study area and high-speed internet.',
        price=8500,
        location='Ahmedabad',
        address='University Road, Navrangpura, Ahmedabad',
        room_type='single',
        is_available=True
    )
    room1.facilities.add(wifi, ac, bed, study, wardrobe)
    attach_images_to_room(room1, ['bedroom', 'study', 'bathroom', 'kitchen', 'bedroom'])

    # 2. Fully Furnished PG Room
    room2 = Room.objects.create(
        owner=owner2,
        title='Fully Furnished PG Room',
        description='Comfortable and fully furnished PG room with all amenities included. Ideal for working professionals.',
        price=7500,
        location='Vadodara',
        address='Alkapuri, Vadodara, Gujarat',
        room_type='shared',
        is_available=True
    )
    room2.facilities.add(wifi, ac, bed, laundry, wardrobe)
    attach_images_to_room(room2, ['bedroom', 'bedroom', 'bathroom', 'living', 'kitchen'])

    # 3. Premium Studio Apartment
    room3 = Room.objects.create(
        owner=owner1,
        title='Premium Studio Apartment',
        description='Luxurious studio apartment featuring modern decor, a private kitchenette, and stunning city views.',
        price=15000,
        location='Ahmedabad',
        address='SG Highway, Ahmedabad, Gujarat',
        room_type='studio',
        is_available=True
    )
    room3.facilities.add(wifi, ac, kitchen, tv, laundry, bed)
    attach_images_to_room(room3, ['bedroom', 'living', 'kitchen', 'bathroom', 'study'])

    # 4. Comfortable Shared Room
    room4 = Room.objects.create(
        owner=owner2,
        title='Comfortable Shared Room',
        description='A budget-friendly shared room with friendly flatmates. Access to all common areas including a fully equipped kitchen.',
        price=6000,
        location='Surat',
        address='Vesu, Surat, Gujarat',
        room_type='shared',
        is_available=True
    )
    room4.facilities.add(wifi, kitchen, laundry, bed)
    attach_images_to_room(room4, ['bedroom', 'living', 'kitchen', 'bathroom', 'bedroom'])

    # 5. Modern 1BHK Apartment
    room5 = Room.objects.create(
        owner=owner1,
        title='Modern 1BHK Apartment',
        description='Spacious 1BHK apartment suitable for a couple or single professional. Offers complete privacy and premium fittings.',
        price=14000,
        location='Gandhinagar',
        address='Kudasan, Gandhinagar, Gujarat',
        room_type='full',
        is_available=True
    )
    room5.facilities.add(wifi, ac, kitchen, tv, laundry, bed, wardrobe)
    attach_images_to_room(room5, ['living', 'bedroom', 'kitchen', 'bathroom', 'study'])

    print("Creating Reviews...")
    Review.objects.create(room=room1, user=tenant1, rating=5, comment="Absolutely loved my stay here. The owner is very responsive and the location is perfect!")
    Review.objects.create(room=room3, user=tenant1, rating=4, comment="Great place, very comfortable and modern.")
    Review.objects.create(room=room5, user=tenant1, rating=5, comment="Spacious and clean. Highly recommended!")

    print("Creating Demo Bookings...")
    Booking.objects.create(
        tenant=tenant1,
        room=room2,
        check_in_date=date.today() - timedelta(days=5),
        check_out_date=date.today() + timedelta(days=25),
        total_amount=7500,
        status='confirmed'
    )

    print("Seed Data Created Successfully!")

if __name__ == '__main__':
    create_seed_data()
