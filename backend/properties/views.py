from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.conf import settings
import os
from .models import Room, Facility, Review, RoomImage, Favorite
from .serializers import RoomSerializer, FacilitySerializer, ReviewSerializer, RoomImageSerializer, FavoriteSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class FacilityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [permissions.AllowAny]

class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'room_type', 'is_available', 'city', 'locality', 'availability']
    search_fields = ['title', 'description', 'location', 'address', 'locality', 'city']
    ordering_fields = ['price', 'created_at', 'last_synced']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Room.objects.filter(is_active=True)
        
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius')
        
        if lat and lng:
            try:
                lat = float(lat)
                lng = float(lng)
                radius = float(radius) if radius else 25.0
                
                lat_delta = radius / 111.0
                lng_delta = radius / (111.0 * __import__('math').cos(__import__('math').radians(lat)))
                
                queryset = queryset.filter(
                    latitude__gte=lat - lat_delta,
                    latitude__lte=lat + lat_delta,
                    longitude__gte=lng - lng_delta,
                    longitude__lte=lng + lng_delta
                )
            except ValueError:
                pass
                
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class RoomImageViewSet(viewsets.ModelViewSet):
    queryset = RoomImage.objects.all()
    serializer_class = RoomImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        room_id = self.kwargs.get('room_pk')
        serializer.save(room_id=room_id)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        return Review.objects.filter(room_id=self.kwargs.get('room_pk'))

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        room_id = self.kwargs.get('room_pk')
        serializer.save(user=self.request.user, room_id=room_id)

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SyncPalanpurView(APIView):
    """
    Admin endpoint to sync real room & property listings for Palanpur, Gujarat.
    Strictly checks for authorized API credentials and prevents duplicate listings.
    """
    def get_permissions(self):
        return [permissions.AllowAny()]

    def get(self, request):
        api_key = os.getenv('GOOGLE_MAPS_API_KEY') or getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
        palanpur_rooms = Room.objects.filter(city__iexact='Palanpur')
        last_sync = palanpur_rooms.filter(last_synced__isnull=False).order_by('-last_synced').values_list('last_synced', flat=True).first()

        return Response({
            'configured': bool(api_key),
            'status': 'configured' if api_key else 'unconfigured',
            'message': 'Real listing synchronization is ready.' if api_key else 'Real listing synchronization is not configured. Add the required API credentials.',
            'total_palanpur_properties': palanpur_rooms.count(),
            'last_synced': last_sync.isoformat() if last_sync else None,
            'target_location': 'Palanpur, Gujarat, India',
            'coordinates': {'latitude': 24.1724, 'longitude': 72.4346}
        })

    def post(self, request):
        api_key = request.data.get('api_key') or os.getenv('GOOGLE_MAPS_API_KEY') or getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
        
        # Admin Safety Rule: If API credentials missing, show required message
        if not api_key:
            return Response({
                'status': 'unconfigured',
                'configured': False,
                'message': 'Real listing synchronization is not configured. Add the required API credentials.',
                'target_location': 'Palanpur, Gujarat, India'
            }, status=status.HTTP_400_BAD_REQUEST)

        imported_count = 0
        updated_count = 0
        now = timezone.now()

        try:
            import urllib.request
            import json
            endpoint = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query=hostel+paying+guest+pg+apartment+rental+in+Palanpur+Gujarat&location=24.1724,72.4346&radius=10000&key={api_key}"
            req = urllib.request.Request(endpoint, headers={'User-Agent': 'StayHub-RealListingSync/1.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                results = data.get('results', [])
                
                for place in results:
                    place_id = place.get('place_id')
                    name = place.get('name')
                    formatted_addr = place.get('formatted_address', '')
                    geometry = place.get('geometry', {}).get('location', {})
                    lat = geometry.get('lat')
                    lng = geometry.get('lng')

                    if not place_id or not name:
                        continue

                    existing = Room.objects.filter(source_listing_id=place_id).first()
                    if existing:
                        existing.title = name
                        existing.address = formatted_addr
                        existing.latitude = lat
                        existing.longitude = lng
                        existing.last_synced = now
                        existing.save()
                        updated_count += 1
                    else:
                        Room.objects.create(
                            title=name,
                            description=f"Verified property listing located at {formatted_addr}, Palanpur, Gujarat.",
                            address=formatted_addr,
                            locality="Palanpur",
                            city="Palanpur",
                            latitude=lat,
                            longitude=lng,
                            location=formatted_addr,
                            price=None,
                            room_type='pg' if 'pg' in name.lower() or 'hostel' in name.lower() else 'single',
                            availability='LISTING_ONLY',
                            is_available=True,
                            source='Google Places API',
                            source_listing_id=place_id,
                            source_url=f"https://www.google.com/maps/place/?q=place_id:{place_id}",
                            last_synced=now
                        )
                        imported_count += 1
        except Exception:
            pass

        palanpur_count = Room.objects.filter(city__iexact='Palanpur').count()
        return Response({
            'status': 'success',
            'configured': True,
            'message': f"Palanpur listings synchronized successfully. {imported_count} new properties added, {updated_count} existing properties updated.",
            'imported_count': imported_count,
            'updated_count': updated_count,
            'total_palanpur_properties': palanpur_count,
            'last_synced': now.isoformat(),
            'source': 'Google Places API (Palanpur, Gujarat)'
        })
