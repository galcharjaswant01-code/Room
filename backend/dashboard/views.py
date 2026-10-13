from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth import get_user_model
from properties.models import Room
from bookings.models import Booking

User = get_user_model()

class OwnerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'owner':
            return Response({"error": "Unauthorized"}, status=403)
        
        rooms = Room.objects.filter(owner=request.user)
        bookings = Booking.objects.filter(room__owner=request.user)
        
        total_properties = rooms.count()
        active_properties = rooms.filter(is_active=True).count()
        total_bookings = bookings.count()
        pending_bookings = bookings.filter(status='pending').count()
        
        # Simple analytics data
        return Response({
            "total_properties": total_properties,
            "active_properties": active_properties,
            "total_bookings": total_bookings,
            "pending_bookings": pending_bookings,
        })

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Unauthorized"}, status=403)
        
        return Response({
            "total_users": User.objects.count(),
            "total_owners": User.objects.filter(role='owner').count(),
            "total_tenants": User.objects.filter(role='tenant').count(),
            "total_properties": Room.objects.count(),
            "total_bookings": Booking.objects.count()
        })
