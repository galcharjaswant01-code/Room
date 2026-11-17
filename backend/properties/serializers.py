from rest_framework import serializers
from .models import Room, RoomImage, RoomMedia, Facility, Review

class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = '__all__'

class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ['id', 'image', 'is_primary']

class RoomMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomMedia
        fields = ['id', 'media_type', 'url', 'thumbnail', 'source_url', 'attribution', 'caption', 'is_primary', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

class RoomSerializer(serializers.ModelSerializer):
    images = RoomImageSerializer(many=True, read_only=True)
    media_items = RoomMediaSerializer(many=True, read_only=True)
    facilities = FacilitySerializer(many=True, read_only=True)
    facilities_ids = serializers.PrimaryKeyRelatedField(
        queryset=Facility.objects.all(), source='facilities', many=True, write_only=True, required=False
    )
    reviews = ReviewSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = Room
        fields = ['id', 'owner', 'owner_name', 'title', 'description', 'price', 'location', 
                  'address', 'locality', 'city', 'latitude', 'longitude', 'room_type', 
                  'phone', 'availability', 'is_available', 'is_active',
                  'source', 'source_listing_id', 'source_url', 'media_source_url', 'data_fields', 'last_synced',
                  'facilities', 'facilities_ids', 'images', 'media_items', 'reviews', 'created_at']
        read_only_fields = ['owner', 'created_at']

from .models import Favorite

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = '__all__'
        read_only_fields = ('user', 'created_at')
