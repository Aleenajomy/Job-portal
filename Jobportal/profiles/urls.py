from django.urls import path
from .views import MyProfileView, SkillManagementView

urlpatterns = [
    path('my-profile/', MyProfileView.as_view(), name='my_profile'),
    # path('public/<str:username>/', PublicProfileView.as_view(), name='public_profile'),
    path('skills/manage/', SkillManagementView.as_view(), name='skill_management'),
]