from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, FacilityViewSet, RoomImageViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='rooms')
router.register(r'facilities', FacilityViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('rooms/<int:room_pk>/images/', RoomImageViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('rooms/<int:room_pk>/images/<int:pk>/', RoomImageViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'})),
    path('rooms/<int:room_pk>/reviews/', ReviewViewSet.as_view({'get': 'list', 'post': 'create'})),
]
