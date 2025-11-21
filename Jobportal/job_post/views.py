from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import JobPost
from .serializers import JobPostListSerializer, JobPostDetailSerializer
from .permissions import IsEmployerOrCompanyOrReadOnly

class JobListCreateView(generics.ListCreateAPIView):
    queryset = JobPost.objects.select_related("publisher").all().order_by('-created_at')
    permission_classes = [IsAuthenticatedOrReadOnly, IsEmployerOrCompanyOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobPostListSerializer
        return JobPostDetailSerializer
    
    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response({'message': 'Job created successfully'}, status=201)

    def perform_create(self, serializer):
        role = getattr(self.request.user, "job_role", None)
        serializer.save(publisher=self.request.user, publisher_role=role)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPost.objects.select_related("publisher").all()
    serializer_class = JobPostDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsEmployerOrCompanyOrReadOnly]
    lookup_field = 'pk'
    
    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response({'message': 'Job updated successfully'}, status=200)
    
    def partial_update(self, request, *args, **kwargs):
        super().partial_update(request, *args, **kwargs)
        return Response({'message': 'Job updated successfully'}, status=200)
    
    def destroy(self, request, *args, **kwargs):
        self.perform_destroy(self.get_object())
        return Response({'message': 'Job deleted successfully'}, status=200)
    


