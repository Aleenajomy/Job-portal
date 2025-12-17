from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .serializers import (
    RegisterSerializer, LoginSerializer, ForgotPasswordSerializer,
    ForgotPasswordOTPVerifySerializer, ResetPasswordSerializer,
    VerifyOTPSerializer, ResendOTPSerializer, ChangePasswordSerializer
)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Count
from django.middleware.csrf import get_token
import jwt
import logging
from .models import User

logger = logging.getLogger(__name__)

def get_user_from_token(request):
    """Extract user from JWT token in Authorization header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, 'Invalid token'
    
    token = auth_header.split(' ')[1]
    try:
        UntypedToken(token)
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user = User.objects.get(id=decoded.get('user_id'))
        return user, None
    except (InvalidToken, TokenError):
        return None, 'Invalid token'
    except User.DoesNotExist:
        return None, 'User not found'
    except jwt.DecodeError:
        return None, 'Invalid token format'
    except Exception as e:
        logger.error(f"Unexpected error in token validation: {str(e)}")
        return None, 'Token validation failed'


class RegisterAPI(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = serializer.save()
        except Exception as e:
            logger.error(f"User creation failed: {str(e)}")
            return Response({
                'message': 'Failed to create user. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            otp = user.generate_otp()
        except Exception as e:
            logger.error(f"OTP generation failed: {str(e)}")
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
                # amazonq-ignore-next-line
                fail_silently=False,
            )
        except Exception:
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
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Database error during login: {str(e)}")
            return Response({
                'message': 'Database error. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Validate password
        if not user.check_password(serializer.validated_data['password']):
            return Response({
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_verified:
            return Response({
                'message': 'Please verify your email first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
        except Exception as e:
            logger.error(f"Token generation failed: {str(e)}")
            return Response({
                'message': 'Failed to generate token. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'Login successful',
            'access_token': access_token,
            'user_id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
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
            try:
                otp = user.generate_otp()
            except Exception as e:
                logger.error(f"OTP generation failed: {str(e)}")
                return Response({
                    'message': 'Failed to generate OTP. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
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
                logger.error(f"Failed to send password reset OTP email: {str(e)}")
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
        except Exception as e:
            logger.error(f"Database error in ForgotPasswordAPI: {str(e)}")
            return Response({
                'message': 'Database error. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ForgotPasswordOTPVerifyAPI(APIView):
    def post(self, request):
        serializer = ForgotPasswordOTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify OTP before storing email in session
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Database error in ForgotPasswordOTPVerifyAPI: {str(e)}")
            return Response({
                'message': 'Database error. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Verify OTP
        try:
            if not user.verify_otp(serializer.validated_data['otp']):
                return Response({
                    'message': 'Invalid or expired OTP'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"OTP verification failed: {str(e)}")
            return Response({
                'message': 'OTP verification failed. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Store email in session only after successful OTP verification
        try:
            request.session['reset_email'] = serializer.validated_data['email']
        except Exception as e:
            logger.error(f"Failed to store session data: {str(e)}")
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
                logger.error(f"Password reset failed: {str(e)}")
                return Response({
                    'message': 'Failed to reset password. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
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
                logger.error(f"Email verification failed: {str(e)}")
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
            try:
                otp = user.generate_otp()
            except Exception as e:
                logger.error(f"OTP generation failed in ResendOTP: {str(e)}")
                return Response({
                    'message': 'Failed to generate OTP. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
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
                logger.error(f"Failed to send resend OTP email: {str(e)}")
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
            user, error = get_user_from_token(request)
            if error:
                status_code = status.HTTP_404_NOT_FOUND if error == 'User not found' else status.HTTP_401_UNAUTHORIZED
                return Response({'message': error}, status=status_code)
            
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
        user, error = get_user_from_token(request)
        if error:
            status_code = 404 if error == 'User not found' else 401
            return Response({'error': error}, status=status_code)
        
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

class CSRFTokenAPI(APIView):
    def get(self, request):
        return Response({'csrfToken': get_token(request)})


