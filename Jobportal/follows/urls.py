from django.urls import path
from .views import FollowUserView, UnfollowUserView, MyFollowingView, MyFollowersView

urlpatterns = [
    path('follow/<int:user_id>/', FollowUserView.as_view(), name='follow-user'),
    path('unfollow/<int:user_id>/', UnfollowUserView.as_view(), name='unfollow-user'),
    path('my-following/', MyFollowingView.as_view(), name='my-following'),
    path('my-followers/', MyFollowersView.as_view(), name='my-followers'),
]