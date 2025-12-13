from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Count
import jwt
from .models import User


class RegisterAPI(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        
        try:
            otp = user.generate_otp()
        except Exception as e:
            return Response({
                'message': 'Failed to generate OTP. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Send OTP for email verification
        try:
            send_mail(
                'Email Verification OTP',
                f'Your OTP for email verification is: {otp}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({
                'message': 'Failed to send verification email. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
        except Exception as e:
            return Response({
                'message': 'Database error. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if not user.is_verified:
            return Response({
                'message': 'Please verify your email first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
        except Exception as e:
            return Response({
                'message': 'Failed to generate token. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
            try:
                send_mail(
                    'Password Reset OTP',
                    f'Your OTP for password reset is: {otp}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response({
                    'message': 'Failed to send OTP email. Please try again later.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
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
        try:
            request.session['reset_email'] = serializer.validated_data['email']
        except Exception as e:
            return Response({
                'message': 'Failed to store session data. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
        
        # Get email from request data
        email = request.data.get('email')
        if not email:
            return Response({
                'message': 'Email is required for password reset.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            try:
                user.set_password(serializer.validated_data['new_password'])
                user.otp = None
                user.save()
            except Exception as e:
                return Response({
                    'message': 'Failed to reset password. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Clear any existing OTP
            user.otp = None
            
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
            try:
                user.is_verified = True
                user.otp = None
                user.save()
            except Exception as e:
                return Response({
                    'message': 'Failed to verify email. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
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
            try:
                send_mail(
                    'Resend OTP',
                    f'Your new OTP is: {otp}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response({
                    'message': 'Failed to send OTP email. Please try again later.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'message': 'New OTP sent to your email'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

class ChangePasswordAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get user from JWT token
            from rest_framework_simplejwt.tokens import UntypedToken
            from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
            
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return Response({'message': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.split(' ')[1]
            try:
                UntypedToken(token)
                decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user = User.objects.get(id=decoded.get('user_id'))
            except (InvalidToken, TokenError, User.DoesNotExist):
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception:
                return Response({'message': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.check_password(serializer.validated_data['current_password']):
                return Response({
                    'message': 'Incorrect current password'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user.set_password(serializer.validated_data['new_password'])
                user.save()
            except Exception as e:
                return Response({
                    'message': 'Failed to change password. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'message': 'An error occurred. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        try:
            user.save()
        except Exception as e:
            return Response({'error': 'Failed to update job role. Please try again.'}, status=500)
        
        return Response({'message': 'Job role updated successfully', 'job_role': user.job_role})


