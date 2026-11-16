from django.db import models
from django.conf import settings

class Facility(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, help_text="FontAwesome class e.g., 'fas fa-wifi'")

    def __str__(self):
        return self.name

class Room(models.Model):
    ROOM_TYPES = (
        ('single', 'Single Room'),
        ('shared', 'Shared Room / Room Sharing'),
        ('studio', 'Studio Apartment'),
        ('full', 'Full Flat / Apartment'),
        ('pg', 'Paying Guest (PG)'),
        ('hostel', 'Hostel'),
    )

    AVAILABILITY_CHOICES = (
        ('CONFIRMED_AVAILABLE', 'Confirmed Available'),
        ('LISTING_ONLY', 'Listing Information Only'),
        ('BOOKED', 'Booked'),
    )
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rooms', null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=255)
    address = models.TextField()
    locality = models.CharField(max_length=150, null=True, blank=True, help_text="Area or locality in Palanpur (e.g. Aroma Circle, Station Road)")
    city = models.CharField(max_length=100, default='Palanpur')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='single')
    facilities = models.ManyToManyField(Facility, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True, help_text="Publicly available contact phone")
    availability = models.CharField(max_length=50, choices=AVAILABILITY_CHOICES, default='CONFIRMED_AVAILABLE')
    is_available = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    # Real Listing & Source Tracking
    source = models.CharField(max_length=100, default='manual', help_text="e.g. Google Places API, Palanpur Verified Registry, OSM")
    source_listing_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    source_url = models.URLField(max_length=1000, null=True, blank=True)
    last_synced = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['source', 'source_listing_id']),
            models.Index(fields=['city', 'is_available']),
        ]

    def __str__(self):
        return f"{self.title} ({self.locality or self.city})"

class RoomMedia(models.Model):
    MEDIA_TYPES = (
        ('image', 'Image'),
        ('video', 'Video'),
    )
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='media_items')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='image')
    url = models.URLField(max_length=1500)
    thumbnail = models.URLField(max_length=1500, null=True, blank=True)
    source_url = models.URLField(max_length=1500, null=True, blank=True)
    attribution = models.CharField(max_length=255, null=True, blank=True, help_text="Legal attribution notice")
    caption = models.CharField(max_length=255, null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.media_type.capitalize()} for {self.room.title}"

def room_image_path(instance, filename):
    return f'properties/room-{instance.room.id}/{filename}'

class RoomImage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=room_image_path)
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Image for {self.room.title}"

class Review(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating} star review by {self.user.username} for {self.room.title}"

class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'room')

    def __str__(self):
        return f"{self.user.username} favorited {self.room.title}"
