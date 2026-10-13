import os

def scaffold():
    # Update properties serializers
    with open('properties/serializers.py', 'a') as f:
        f.write('''
from .models import Favorite

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = '__all__'
        read_only_fields = ('user', 'created_at')
''')

    # Update properties views
    with open('properties/views.py', 'a') as f:
        f.write('''
from .models import Favorite
from .serializers import FavoriteSerializer

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
''')
        
    # Update properties urls
    with open('properties/urls.py', 'r') as f:
        content = f.read()
    
    if 'FavoriteViewSet' not in content:
        content = content.replace("from .views import RoomViewSet, FacilityViewSet, ReviewViewSet, RoomImageViewSet", 
                                  "from .views import RoomViewSet, FacilityViewSet, ReviewViewSet, RoomImageViewSet, FavoriteViewSet")
        content = content.replace("router.register(r'rooms/(?P<room_pk>\d+)/reviews', ReviewViewSet, basename='room-reviews')",
                                  "router.register(r'rooms/(?P<room_pk>\d+)/reviews', ReviewViewSet, basename='room-reviews')\nrouter.register(r'favorites', FavoriteViewSet, basename='favorites')")
        with open('properties/urls.py', 'w') as f:
            f.write(content)

if __name__ == "__main__":
    scaffold()
    print("Scaffolded new APIs.")
