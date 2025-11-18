from django.urls import path
from .views import RegisterAPI, LoginAPI, ForgotPasswordAPI, VerifyPasswordAPI, VerifyOTPAPI, ResendOTPAPI, ChangePasswordAPI, GetAllUsersAPI

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('forgot-password/', ForgotPasswordAPI.as_view(), name='forgot_password'),
    path('verify-password/', VerifyPasswordAPI.as_view(), name='verify_password'),
    path('verify-otp/', VerifyOTPAPI.as_view(), name='verify_otp'),
    path('resend-otp/', ResendOTPAPI.as_view(), name='resend_otp'),
    path('change-password/', ChangePasswordAPI.as_view(), name='change_password'),
    path('users/', GetAllUsersAPI.as_view(), name='get_all_users'),
]
