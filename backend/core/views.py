from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from .serializers import UserSerializer, RegisterSerializer
from .otp_utils import generate_otp, send_otp_email, verify_otp
from django.utils import timezone

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_email_verified:
            raise AuthenticationFailed("Please verify your email first.")
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_email_verified = False
            user.otp = generate_otp()
            user.otp_created_at = timezone.now()
            user.save()
            
            try:
                send_otp_email(user, user.otp)
            except Exception as e:
                # Log email failure but still register
                pass
                
            return Response({
                "message": "Account Created. Send 6-digit verification code to real email",
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if user.is_email_verified:
            return Response({"error": "Email is already verified"}, status=status.HTTP_400_BAD_REQUEST)
            
        if verify_otp(user, otp):
            user.is_email_verified = True
            user.otp = None
            user.otp_created_at = None
            user.save()
            return Response({"message": "Email verified successfully"})
        else:
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

class ResendOTPView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if user.is_email_verified:
            return Response({"error": "Email already verified"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check attempts
        if user.otp_resend_count >= 5:
            return Response({"error": "Maximum resend attempts reached. Try again later."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.otp = generate_otp()
        user.otp_created_at = timezone.now()
        user.otp_resend_count += 1
        user.save()
        
        try:
            send_otp_email(user, user.otp)
        except Exception as e:
            pass
            
        return Response({"message": "OTP resent successfully"})

class ForgotPasswordView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "If an account exists, a reset code has been sent."}, status=status.HTTP_200_OK)
            
        user.otp = generate_otp()
        user.otp_created_at = timezone.now()
        user.save()
        
        try:
            send_otp_email(user, user.otp)
        except Exception as e:
            pass
            
        return Response({"message": "If an account exists, a reset code has been sent."})

class VerifyResetOTPView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)
            
        if verify_otp(user, otp):
            # Generate a temporary reset token or just mark as verified for reset
            return Response({"message": "OTP verified. Proceed to reset password."})
        else:
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)
            
        if verify_otp(user, otp):
            user.set_password(password)
            user.otp = None
            user.otp_created_at = None
            user.save()
            return Response({"message": "Password updated successfully"})
        else:
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class GoogleAuthView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user, created = User.objects.get_or_create(username=email, defaults={
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'role': 'tenant',
            'is_email_verified': True  # Google accounts are already verified
        })
        
        # If user was created, set an unusable password
        if created:
            user.set_unusable_password()
            user.is_email_verified = True
            user.save()
            
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'is_new_user': created
        })
        
class FirebaseLoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Firebase token is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            import jwt
            # Attempt to decode without signature verification for demo/college project fallback
            # In production, use firebase_admin to verify the token signature
            decoded_token = jwt.decode(token, options={"verify_signature": False})
            
            # Extract phone number and uid
            uid = decoded_token.get('user_id') or decoded_token.get('sub')
            phone_number = decoded_token.get('phone_number')
            email = decoded_token.get('email', '')
            
            if not uid:
                return Response({"error": "Invalid token payload"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Find or create user
            # We use uid as the primary identity for phone users if no phone, else phone
            username = phone_number if phone_number else uid
            
            user, created = User.objects.get_or_create(username=username, defaults={
                'phone_number': phone_number,
                'email': email,
                'role': 'tenant',
                'is_email_verified': True
            })
            
            if not created and phone_number and not user.phone_number:
                user.phone_number = phone_number
                user.save()
                
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'is_new_user': created,
                'user': UserSerializer(user).data
            })
            
        except Exception as e:
            return Response({"error": f"Invalid Firebase token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'is_new_user': created
        })

from rest_framework import viewsets
from rest_framework.decorators import action
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'read'})
        
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all_read'})
