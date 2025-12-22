from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Education
from .serializers import EducationSerializer

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def save_education(request):
    try:
        # Clear existing education
        Education.objects.filter(user=request.user).delete()
        
        # Add new education entries
        education_data = request.data if isinstance(request.data, list) else []
        for edu in education_data:
            serializer = EducationSerializer(data=edu)
            if serializer.is_valid():
                serializer.save(user=request.user)
        
        return Response({'message': 'Education saved successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)