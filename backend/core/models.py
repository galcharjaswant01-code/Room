from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = (
        ('tenant', 'Tenant'),
        ('owner', 'Owner'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='tenant')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # OTP Authentication Fields
    is_email_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    otp_resend_count = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Notification(models.Model):
    TYPE_CHOICES = (
        ('BOOKING', 'Booking'),
        ('MESSAGE', 'Message'),
        ('SYSTEM', 'System'),
        ('REVIEW', 'Review'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='SYSTEM')
    related_id = models.IntegerField(null=True, blank=True, help_text="ID of the related object (Booking, Message, etc)")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} Notification for {self.user.username}"
