from django.urls import path
from .views import UserProfileView, CompanyProfileView, PublicUserListAPIView, PublicUserProfileAPIView
from .education_views import save_education

urlpatterns = [
    path('user-profile/', UserProfileView.as_view(), name='user_profile'),
    path('company-profile/', CompanyProfileView.as_view(), name='company_profile'),
    path('public-users/', PublicUserListAPIView.as_view(), name='public_user_list'),
    path('public-profile/<int:id>/', PublicUserProfileAPIView.as_view(), name='public_user_profile'),
    path('education/', save_education, name='save_education'),
]