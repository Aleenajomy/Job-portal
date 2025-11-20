from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from .models import User


class RegisterAPI(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        otp = user.generate_otp()
        
        # Send OTP for email verification
        send_mail(
            'Email Verification OTP',
            f'Your OTP for email verification is: {otp}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'User registered successfully. Please verify your email with the OTP sent.',
            'email': user.email
        }, status=status.HTTP_201_CREATED)
        
class LoginAPI(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=serializer.validated_data['email'])
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not user.is_verified:
            return Response({
                'message': 'Please verify your email first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from rest_framework_simplejwt.tokens import RefreshToken
        
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        return Response({
            'message': 'Login successful',
            'access_token': access_token,
            'user_id': user.id,
            'job_role': user.job_role
        }, status=status.HTTP_200_OK)

class ForgotPasswordAPI(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            otp = user.generate_otp()
            
            # Send OTP via email
            send_mail(
                'Password Reset OTP',
                f'Your OTP for password reset is: {otp}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'OTP sent to your email'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

class ForgotPasswordOTPVerifyAPI(APIView):
    def post(self, request):
        serializer = ForgotPasswordOTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store email in session for password reset
        request.session['reset_email'] = serializer.validated_data['email']
        
        return Response({
            'message': 'OTP verified successfully. You can now reset your password.'
        }, status=status.HTTP_200_OK)

class ResetPasswordAPI(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get email from session or require it in the request
        email = request.session.get('reset_email')
        if not email:
            return Response({
                'message': 'Session expired. Please start the password reset process again.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            user.set_password(serializer.validated_data['new_password'])
            user.otp = None
            user.save()
            
            # Clear session
            request.session.pop('reset_email', None)
            
            return Response({
                'message': 'Password reset successfully'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)            

class VerifyOTPAPI(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            user.is_verified = True
            user.otp = None
            user.save()
            
            return Response({
                'message': 'Email verified successfully. You can now login.'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

class ResendOTPAPI(APIView):
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            otp = user.generate_otp()
            
            # Send OTP via email
            send_mail(
                'Resend OTP',
                f'Your new OTP is: {otp}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'New OTP sent to your email'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

class ChangePasswordAPI(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({
                    'message': 'Incorrect old password'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

class UpdateJobRoleAPI(APIView):
    def patch(self, request):
        from rest_framework_simplejwt.tokens import UntypedToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Invalid token'}, status=401)
        
        token = auth_header.split(' ')[1]
        try:
            UntypedToken(token)
            import jwt
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(id=decoded.get('user_id'))
        except (InvalidToken, TokenError, User.DoesNotExist):
            return Response({'error': 'User not found'}, status=404)
        except Exception:
            return Response({'error': 'Invalid token'}, status=401)
        
        job_role = request.data.get('job_role')
        if not job_role:
            return Response({'error': 'job_role required'}, status=400)
        
        valid_choices = [choice[0] for choice in User.JOB_ROLE_CHOICES]
        if job_role not in valid_choices:
            return Response({'error': f'Invalid job role. Must be one of: {valid_choices}'}, status=400)
        
        user.job_role = job_role
        user.save()
        
        return Response({'message': 'Job role updated successfully', 'job_role': user.job_role})
