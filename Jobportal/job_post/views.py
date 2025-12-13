from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
import csv
from django.http import HttpResponse
from .models import JobPost
from .serializers import JobPostListSerializer, JobPostDetailSerializer, JobApplicationSerializer, ApplicationListSerializer, ApplicantSerializer
from .permissions import IsEmployerOrCompanyOrReadOnly, CanApplyToJob
from .models import JobPost, JobApplication

class JobListCreateView(generics.ListCreateAPIView):
    queryset = JobPost.objects.select_related("publisher").filter(is_active=True).order_by('-created_at')
    permission_classes = [IsAuthenticatedOrReadOnly, IsEmployerOrCompanyOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'requirements']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobPostListSerializer
        return JobPostDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtering parameters
        title = self.request.query_params.get('title')
        location = self.request.query_params.get('location')
        job_type = self.request.query_params.get('job_type')
        work_mode = self.request.query_params.get('work_mode')
        experience = self.request.query_params.get('experience')
        skills = self.request.query_params.get('skills')
        company = self.request.query_params.get('company')
        publisher_role = self.request.query_params.get('publisher_role')
        salary_min = self.request.query_params.get('salary_min')
        salary_max = self.request.query_params.get('salary_max')
        posted_days = self.request.query_params.get('posted_days')
        
        # Apply filters
        if title:
            # Check for SQL-like wildcards
            if '%' in title:
                if title.startswith('%') and title.endswith('%'):
                    # %value% - contains
                    clean_title = title.strip('%')
                    queryset = queryset.filter(title__icontains=clean_title)
                elif title.startswith('%'):
                    # %value - ends with
                    clean_title = title.lstrip('%')
                    queryset = queryset.filter(title__iendswith=clean_title)
                elif title.endswith('%'):
                    # value% - starts with
                    clean_title = title.rstrip('%')
                    queryset = queryset.filter(title__istartswith=clean_title)
                else:
                    # % in middle - use icontains as fallback
                    queryset = queryset.filter(title__icontains=title.replace('%', ''))
            else:
                # Get search method from query params (default: icontains)
                search_method = self.request.query_params.get('search_method', 'icontains')
                
                if search_method == 'exact':
                    queryset = queryset.filter(title__exact=title)
                elif search_method == 'iexact':
                    queryset = queryset.filter(title__iexact=title)
                elif search_method == 'contains':
                    queryset = queryset.filter(title__contains=title)
                elif search_method == 'startswith':
                    queryset = queryset.filter(title__istartswith=title)
                elif search_method == 'endswith':
                    queryset = queryset.filter(title__iendswith=title)
                elif search_method == 'regex':
                    queryset = queryset.filter(title__iregex=title)
                else:  # default: icontains (case-insensitive LIKE %title%)
                    queryset = queryset.filter(title__icontains=title)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        if work_mode:
            queryset = queryset.filter(work_mode=work_mode)
        if experience:
            queryset = queryset.filter(experience=experience)
        if skills:
            for skill in skills.split(','):
                queryset = queryset.filter(requirements__icontains=skill.strip())
        if company:
            queryset = queryset.filter(
                Q(publisher__companyprofile__company_name__icontains=company) |
                Q(publisher__userprofile__company_name__icontains=company)
            )
        if publisher_role:
            queryset = queryset.filter(publisher__job_role=publisher_role)
        if salary_min:
            queryset = queryset.filter(salary__icontains=salary_min)
        if salary_max:
            queryset = queryset.filter(salary__icontains=salary_max)
        if posted_days:
            from datetime import datetime, timedelta
            days_ago = datetime.now() - timedelta(days=int(posted_days))
            queryset = queryset.filter(created_at__gte=days_ago)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({'message': 'Job created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        role = getattr(self.request.user, "job_role", None)
        serializer.save(publisher=self.request.user, publisher_role=role)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPost.objects.select_related("publisher").all()
    serializer_class = JobPostDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsEmployerOrCompanyOrReadOnly]
    lookup_field = 'pk'
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data['message'] = 'Job updated successfully'
        return response
    
    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        response.data['message'] = 'Job updated successfully'
        return response
    
    def destroy(self, request, *args, **kwargs):
        self.perform_destroy(self.get_object())
        return Response({'message': 'Job deleted successfully'}, status=200)

class JobApplicationView(generics.CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, CanApplyToJob]
    
    def create(self, request, *args, **kwargs):
        # Check if user is a company
        user_role = getattr(request.user, 'job_role', None)
        if user_role == 'Company':
            return Response({'message': 'Companies cannot apply for jobs. You can only post jobs and view applicants.'}, status=403)
        
        # Get job from URL parameter
        job_id = self.kwargs.get('job_id')
        try:
            job = JobPost.objects.get(id=job_id)
        except (JobPost.DoesNotExist, ValueError):
            return Response({'message': 'Job not found'}, status=404)
        except Exception:
            return Response({'message': 'Error retrieving job'}, status=500)
        
        # Check if user is trying to apply to their own job
        if job.publisher == request.user:
            return Response({'message': 'You cannot apply to your own job'}, status=403)
        
        # Add job to request data
        data = request.data.copy()
        data['job'] = job_id
        request._full_data = data
        
        response = super().create(request, *args, **kwargs)
        
        # Send email notification to job provider
        try:
            # Get job provider email
            if job.publisher.job_role == 'Company':
                try:
                    provider_email = job.publisher.companyprofile.company_email
                except:
                    provider_email = job.publisher.email
            else:
                provider_email = job.publisher.email
            
            # Send email
            send_mail(
                subject=f'New Application for {job.title}',
                message=f'Hello,\n\nYou have received a new application for your job posting "{job.title}".\n\nApplicant: {request.user.first_name} {request.user.last_name}\nEmail: {request.user.email}\n\nPlease log in to your account to review the application.\n\nBest regards,\nJob Portal Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[provider_email],
                fail_silently=True,
            )
        except Exception:
            pass  # Continue even if email fails
        
        return Response({'message': 'Application submitted successfully'}, status=201)



class MyPostedJobsView(generics.ListAPIView):
    serializer_class = JobPostListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'job_role', None)
        
        if role in ('Employer', 'Company'):
            return JobPost.objects.filter(publisher=user).select_related('publisher').order_by('-created_at')
        else:
            return JobPost.objects.none()

class JobApplicantsView(generics.ListAPIView):
    serializer_class = ApplicantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        job_id = self.kwargs['job_id']
        user = self.request.user
        
        # Verify user owns this job
        try:
            job = JobPost.objects.get(id=job_id, publisher=user)
        except JobPost.DoesNotExist:
            return JobApplication.objects.none()
        
        queryset = JobApplication.objects.filter(job=job).select_related('applicant').order_by('-applied_at')
        
        # Filter by status if provided
        status = self.request.query_params.get('status')
        if status and status != 'all':
            queryset = queryset.filter(status=status)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        job_id = self.kwargs['job_id']
        user = self.request.user
        
        try:
            job = JobPost.objects.get(id=job_id, publisher=user)
        except JobPost.DoesNotExist:
            return Response({'message': 'Job not found'}, status=404)
        
        # Get filtered queryset
        queryset = self.get_queryset()
        
        if queryset.count() == 0:
            filter_status = self.request.query_params.get('status')
            if filter_status and filter_status != 'all':
                message = f'No applicants found with status: {filter_status}'
            else:
                message = 'No applications received for this job yet.'
            return Response({
                'message': message,
                'applicants': []
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'message': f'{queryset.count()} applicants found',
            'applicants': serializer.data
        })

class MyAppliedJobsView(generics.ListAPIView):
    serializer_class = ApplicationListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['job__title', 'job__company_name']
    ordering = ['-applied_at']
    
    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'job_role', None)
        
        if role in ('Employee', 'Employer'):
            queryset = JobApplication.objects.filter(applicant=user).select_related('job', 'job__publisher').order_by('-applied_at')
            
            # Filter by status if provided
            status = self.request.query_params.get('status')
            if status and status != 'all':
                queryset = queryset.filter(status=status)
            
            return queryset
        else:
            return JobApplication.objects.none()
    
    def list(self, request, *args, **kwargs):
        user = self.request.user
        role = getattr(user, 'job_role', None)
        
        if role == 'Company':
            return Response({
                'message': 'Companies cannot apply for jobs. You can only post jobs and view applicants.'
            }, status=403)
        
        queryset = self.get_queryset()
        
        if queryset.count() == 0:
            filter_status = self.request.query_params.get('status')
            if filter_status and filter_status != 'all':
                message = f'No applications found with status: {filter_status}'
            else:
                message = 'You have not applied to any jobs yet.'
            return Response({
                'message': message,
                'results': []
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'message': f'{queryset.count()} applications found',
            'results': serializer.data
        })

class UpdateApplicationStatusView(generics.UpdateAPIView):
    queryset = JobApplication.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    
    def patch(self, request, *args, **kwargs):
        application = self.get_object()
        
        # Check if user owns the job
        if application.job.publisher != request.user:
            return Response({
                'message': 'Permission denied. Only job owner can update application status.'
            }, status=403)
        
        status = request.data.get('status')
        if not status:
            return Response({'message': 'Status is required'}, status=400)
        
        valid_statuses = [choice[0] for choice in JobApplication.STATUS_CHOICES]
        if status not in valid_statuses:
            return Response({'message': 'Invalid status'}, status=400)
        
        application.status = status
        application.save()
        
        return Response({
            'message': 'Application status updated successfully',
            'status': status
        })

class ApplicationStatusStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = self.request.user
        role = getattr(user, 'job_role', None)
        
        if role == 'Company':
            return Response({
                'message': 'Companies cannot view application stats as they do not apply for jobs.'
            }, status=403)
        
        # Get user's applications
        applications = JobApplication.objects.filter(applicant=user)
        
        # Calculate status statistics
        stats = {
            'total_applications': applications.count(),
            'status_breakdown': {
                'applied': applications.filter(status='applied').count(),
                'shortlisted': applications.filter(status='shortlisted').count(),
                'resume_review': applications.filter(status='resume_review').count(),
                'interview_scheduled': applications.filter(status='interview_scheduled').count(),
                'interviewed': applications.filter(status='interviewed').count(),
                'selected': applications.filter(status='selected').count(),
                'rejected': applications.filter(status='rejected').count(),
            },
            'status_choices': JobApplication.STATUS_CHOICES
        }
        
        return Response(stats)

