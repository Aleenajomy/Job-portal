from django.urls import path
from .views import *

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('forgot-password/', ForgotPasswordAPI.as_view(), name='forgot_password'),
    path('forgot-password-otp-verify/', ForgotPasswordOTPVerifyAPI.as_view(), name='forgot_password_otp_verify'),
    path('reset-password/', ResetPasswordAPI.as_view(), name='reset_password'),
    path('verify-otp/', VerifyOTPAPI.as_view(), name='verify_otp'),
    path('resend-otp/', ResendOTPAPI.as_view(), name='resend_otp'),
    path('change-password/', ChangePasswordAPI.as_view(), name='change_password'),
    path('update-job-role/', UpdateJobRoleAPI.as_view(), name='update_job_role'),
    path('csrf/', CSRFTokenAPI.as_view(), name='csrf_token'),

]
