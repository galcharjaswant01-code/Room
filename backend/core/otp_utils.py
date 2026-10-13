import random
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(user, otp):
    subject = 'Your Room Rental Verification Code'
    message = f"""Your Room Rental verification code is:

{otp}

This code expires in 10 minutes.
"""
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    
    print(f"\n========== EMAIL DEV FALLBACK ==========")
    print(f"To: {user.email}")
    print(f"Subject: {subject}")
    print(f"OTP: {otp}")
    print(f"========================================\n")
    
    try:
        if settings.EMAIL_HOST_USER:
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
    except Exception as e:
        print(f"Failed to send real email: {e}. Check your SMTP credentials in backend/.env")

def verify_otp(user, otp):
    if not user.otp or user.otp != otp:
        return False
    
    if not user.otp_created_at:
        return False
        
    # Check expiration (10 minutes)
    if timezone.now() > user.otp_created_at + timedelta(minutes=10):
        return False
        
    return True
