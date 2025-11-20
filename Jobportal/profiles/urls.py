# from django.urls import path
# from .views import MyProfileView, SkillManagementView, ProfileImageView

# urlpatterns = [
#     path('my-profile/', MyProfileView.as_view(), name='my_profile'),
#     path('skills/manage/', SkillManagementView.as_view(), name='skill_management'),
#     path('upload-image/', ProfileImageView.as_view(), name='profile_image'),
# ]

from django.urls import path
from .views import *

urlpatterns = [
    path('my-profile/', UserProfileAPI.as_view(), name='user_profile'),
    path('my-profile/update/', UserProfileUpdateAPI.as_view(), name='user_profile_update'),
]