from rest_framework import serializers
from .models import Booking, Payment
from properties.serializers import RoomSerializer

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['booking', 'created_at']

class BookingSerializer(serializers.ModelSerializer):
    room_details = RoomSerializer(source='room', read_only=True)
    payment = PaymentSerializer(read_only=True)
    tenant_name = serializers.CharField(source='tenant.username', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'tenant', 'tenant_name', 'room', 'room_details', 'check_in_date', 'check_out_date', 
                  'total_amount', 'status', 'payment', 'created_at']
        read_only_fields = ['tenant', 'status', 'created_at']

class CreateBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['room', 'check_in_date', 'check_out_date', 'total_amount']

    def validate(self, data):
        # Basic validation for dates
        if data['check_in_date'] >= data['check_out_date']:
            raise serializers.ValidationError("Check-out date must be after check-in date.")
        # Need to add availability check logic here
        return data
