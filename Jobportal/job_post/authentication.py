from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from accounts.models import User
import jwt
from django.conf import settings

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token.get('user_id')
            user = User.objects.get(id=user_id)
            return user
        except User.DoesNotExist:
            return None