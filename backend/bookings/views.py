from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from .models import Booking, Payment
from .serializers import BookingSerializer, CreateBookingSerializer, PaymentSerializer

class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'owner':
            return Booking.objects.filter(room__owner=user)
        elif user.role == 'admin':
            return Booking.objects.all()
        return Booking.objects.filter(tenant=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateBookingSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        from django.db import transaction
        from properties.models import Room
        from rest_framework.exceptions import ValidationError
        
        room_id = serializer.validated_data['room'].id
        
        with transaction.atomic():
            # Lock the room row to prevent double booking
            room = Room.objects.select_for_update().get(id=room_id)
            if not room.is_available:
                raise ValidationError({"room": "This room is no longer available."})
            
            # Create booking
            booking = serializer.save(tenant=self.request.user, status='pending')
            
            # Mark room as unavailable
            room.is_available = False
            room.save()
            
            # Create notifications
            from core.models import Notification, User
            
            # Notify Owner
            Notification.objects.create(
                user=room.owner,
                title="New Booking Request",
                message=f"You have a new booking request for {room.title} from {self.request.user.first_name} {self.request.user.last_name}.",
                type='BOOKING',
                related_id=booking.id
            )
            
            # Notify Admins
            admins = User.objects.filter(role='admin')
            for admin in admins:
                Notification.objects.create(
                    user=admin,
                    title="New Room Booking (System)",
                    message=f"Booking ID {booking.id} created for {room.title} by {self.request.user.username}.",
                    type='SYSTEM',
                    related_id=booking.id
                )
            
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        from core.models import Notification, User
        old_instance = self.get_object()
        new_instance = serializer.save()
        
        if old_instance.status != new_instance.status:
            # Notify Tenant
            title = f"Booking {new_instance.status.capitalize()}"
            message = f"Your booking for {new_instance.room.title} is now {new_instance.status}."
            
            Notification.objects.create(
                user=new_instance.tenant,
                title=title,
                message=message,
                type='BOOKING',
                related_id=new_instance.id
            )
            
            # If cancelled, notify owner & admin and free the room
            if new_instance.status == 'cancelled':
                new_instance.room.is_available = True
                new_instance.room.save()
                
                Notification.objects.create(
                    user=new_instance.room.owner,
                    title="Booking Cancelled",
                    message=f"Booking for {new_instance.room.title} was cancelled.",
                    type='BOOKING',
                    related_id=new_instance.id
                )
                
                admins = User.objects.filter(role='admin')
                for admin in admins:
                    Notification.objects.create(
                        user=admin,
                        title="Booking Cancelled (System)",
                        message=f"Booking ID {new_instance.id} was cancelled.",
                        type='SYSTEM',
                        related_id=new_instance.id
                    )

    @decorators.action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        booking = self.get_object()
        if hasattr(booking, 'payment'):
            return Response({"error": "Payment already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_amount,
            method=request.data.get('method', 'mock_gateway'),
            status='completed', # Auto complete for demo
            transaction_id='TXN_MOCK_' + str(booking.id)
        )
        
        booking.status = 'confirmed'
        booking.save()
        
        return Response(PaymentSerializer(payment).data)

    @decorators.action(detail=True, methods=['get'])
    def contact_info(self, request, pk=None):
        booking = self.get_object()
        
        if booking.status != 'confirmed' and booking.status != 'approved':
            return Response({"error": "Contact info is only available for confirmed/approved bookings."}, status=status.HTTP_403_FORBIDDEN)
            
        user = request.user
        if user == booking.tenant:
            # Tenant requesting Owner's phone
            target_user = booking.room.owner
        elif user == booking.room.owner or user.role == 'admin':
            # Owner/Admin requesting Tenant's phone
            target_user = booking.tenant
        else:
            return Response({"error": "Unauthorized access."}, status=status.HTTP_403_FORBIDDEN)
            
        return Response({
            "name": f"{target_user.first_name} {target_user.last_name}".strip() or target_user.username,
            "phone": target_user.phone_number,
            "email": target_user.email
        })
