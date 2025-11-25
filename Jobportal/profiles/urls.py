from django.urls import path
from .views import UserProfileView, CompanyProfileView

urlpatterns = [
    path('user-profile/', UserProfileView.as_view(), name='user_profile'),
    path('company-profile/', CompanyProfileView.as_view(), name='company_profile'),
]