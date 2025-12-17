from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
import logging
import re
from .models import JobPost, JobApplication
from .serializers import JobPostListSerializer, JobPostDetailSerializer, JobApplicationSerializer, ApplicationListSerializer, ApplicantSerializer, ApplicationDetailSerializer
from .permissions import IsEmployerOrCompanyOrReadOnly, CanApplyToJob
from .validators import RoleValidator, JobAccessControl

logger = logging.getLogger(__name__)

class JobListCreateView(generics.ListCreateAPIView):
    queryset = JobPost.objects.select_related("publisher").prefetch_related("applications").filter(is_active=True, deleted_at__isnull=True).order_by('-created_at')
    permission_classes = [IsAuthenticatedOrReadOnly, IsEmployerOrCompanyOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'requirements']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobPostListSerializer
        return JobPostDetailSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return self._apply_filters(queryset)
    
    def _apply_filters(self, queryset):
        try:
            params = self.request.query_params
        except AttributeError:
            # Fallback for non-DRF requests
            params = getattr(self.request, 'GET', {})
        
        title = params.get('title')
        if title:
            queryset = self._filter_by_title(queryset, title)
        
        location = params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        job_type = params.get('job_type')
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        
        work_mode = params.get('work_mode')
        if work_mode:
            queryset = queryset.filter(work_mode=work_mode)
        
        experience = params.get('experience')
        if experience:
            queryset = queryset.filter(experience=experience)
        
        skills = params.get('skills')
        if skills:
            queryset = self._filter_by_skills(queryset, skills)
        
        company = params.get('company')
        if company:
            queryset = self._filter_by_company(queryset, company)
        

        
        posted_days = params.get('posted_days')
        if posted_days:
            queryset = self._filter_by_date(queryset, posted_days)
        
        return queryset
    
    def _filter_by_title(self, queryset, title):
        return queryset.filter(title__icontains=title)
    
    def _filter_by_skills(self, queryset, skills):
        if skills:
            return queryset.filter(requirements__icontains=skills)
        return queryset
    
    def _filter_by_company(self, queryset, company):
        return queryset.filter(company_name__icontains=company)
    
    def _filter_by_date(self, queryset, posted_days):
        try:
            days = int(posted_days)
            days_ago = timezone.now() - timedelta(days=days)
            return queryset.filter(created_at__gte=days_ago)
        except ValueError:
            return queryset
    
    def create(self, request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return Response({
                'error': 'AUTHENTICATION_REQUIRED',
                'message': 'Authentication required. Please login to create job postings.'
            }, status=401)
        
        user_role = getattr(request.user, 'job_role', None)
        
        # Validate role-based job creation access
        if user_role not in ('Employer', 'Company'):
            return Response({
                'error': 'ACCESS_DENIED',
                'message': f'Access denied. Only Employers and Companies can create job postings. Your role: {user_role}',
                'user_role': user_role,
                'required_roles': ['Employer', 'Company']
            }, status=403)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                self.perform_create(serializer)
                return Response({
                    'message': 'Job created successfully',
                    'job_id': serializer.instance.id,
                    'publisher_role': user_role
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Job creation failed: {str(e)}")
                return Response({
                    'error': 'JOB_CREATION_FAILED',
                    'message': 'Failed to create job posting. Please try again.'
                }, status=500)
        
        return Response({
            'error': 'VALIDATION_ERROR',
            'message': 'Invalid job data provided',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        try:
            role = getattr(self.request.user, "job_role", None)
            serializer.save(publisher=self.request.user, publisher_role=role)
        except Exception as e:
            logger.error(f"Database error in perform_create: {str(e)}")
            raise

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPost.objects.select_related("publisher").filter(deleted_at__isnull=True)
    serializer_class = JobPostDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsEmployerOrCompanyOrReadOnly]
    lookup_field = 'pk'
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            response.data['message'] = 'Job updated successfully'
            return response
        except Exception as e:
            logger.error(f"Job update failed: {str(e)}")
            return Response({
                'error': 'UPDATE_FAILED',
                'message': 'Failed to update job. Please try again.'
            }, status=500)
    
    def partial_update(self, request, *args, **kwargs):
        try:
            response = super().partial_update(request, *args, **kwargs)
            response.data['message'] = 'Job updated successfully'
            return response
        except Exception as e:
            logger.error(f"Job partial update failed: {str(e)}")
            return Response({
                'error': 'UPDATE_FAILED',
                'message': 'Failed to update job. Please try again.'
            }, status=500)
    
    def destroy(self, request, *args, **kwargs):
        try:
            job = self.get_object()
            job.soft_delete()
            return Response({'message': 'Job deleted successfully'}, status=200)
        except Exception as e:
            logger.error(f"Job deletion failed: {str(e)}")
            return Response({
                'error': 'DELETE_FAILED',
                'message': 'Failed to delete job. Please try again.'
            }, status=500)

class JobApplicationView(generics.CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, CanApplyToJob]
    
    def create(self, request, *args, **kwargs):
        user_role = getattr(request.user, 'job_role', None)
        
        # Role-based validation: Only Employee & Employer can apply
        if user_role == 'Company':
            return Response({
                'error': 'ACCESS_DENIED',
                'message': 'Companies cannot apply for jobs. You can only post jobs and view applicants.',
                'user_role': user_role
            }, status=403)
        
        if user_role not in ('Employee', 'Employer'):
            return Response({
                'error': 'INVALID_ROLE',
                'message': 'Only Employees and Employers can apply for jobs.',
                'user_role': user_role
            }, status=403)
        
        # Get job from URL parameter
        job_id = self.kwargs.get('job_id')
        
        # Validate job_id to prevent path traversal
        if not job_id:
            return Response({
                'error': 'INVALID_JOB_ID',
                'message': 'Job ID is required'
            }, status=400)
        

        
        try:
            job = JobPost.objects.get(id=int(job_id), is_active=True)
        except JobPost.DoesNotExist:
            return Response({
                'error': 'JOB_NOT_FOUND',
                'message': 'Job not found or no longer active'
            }, status=404)
        except ValueError as e:
            logger.error(f"Invalid job_id conversion: {str(e)}")
            return Response({
                'error': 'INVALID_JOB_ID',
                'message': 'Invalid job ID provided'
            }, status=400)
        except Exception as e:
            logger.error(f"Database error retrieving job: {str(e)}")
            return Response({
                'error': 'DATABASE_ERROR',
                'message': 'Failed to retrieve job. Please try again.'
            }, status=500)
        
        # Check if user is trying to apply to their own job
        if job.publisher == request.user:
            return Response({
                'error': 'OWN_JOB_APPLICATION',
                'message': 'You cannot apply to your own job posting',
                'job_id': int(job_id),
                'job_title': job.title
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user already applied
        if JobApplication.objects.filter(job=job, applicant=request.user).exists():
            return Response({
                'error': 'ALREADY_APPLIED',
                'message': 'You have already applied to this job',
                'job_id': job_id,
                'job_title': job.title
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add job to request data
        data = request.data.copy()
        data['job'] = job_id
        request._full_data = data
        
        try:
            response = super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Application creation failed: {str(e)}")
            return Response({
                'error': 'APPLICATION_CREATION_FAILED',
                'message': 'Failed to submit application. Please try again.'
            }, status=500)
        
        # Send email notification to job provider
        self._send_application_notification(job, request.user)
        
        return Response({'message': 'Application submitted successfully'}, status=201)
        
    def _send_application_notification(self, job, applicant):
        """Send email notification to job provider about new application"""
        try:
            provider_email = self._get_provider_email(job.publisher)
            message = self._build_notification_message(job, applicant)
            send_mail(
                subject=f'New Application for {job.title}',
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[provider_email],
                fail_silently=True,
            )
        except Exception as e:
            logger.error(f"Failed to send application notification email: {str(e)}")
    
    def _get_provider_email(self, publisher):
        """Get email address for job provider"""
        if publisher.job_role == 'Company':
            try:
                return publisher.companyprofile.company_email
            except AttributeError:
                return publisher.email
        return publisher.email
    
    def _build_notification_message(self, job, applicant):
        """Build email notification message"""
        return (f'Hello,\n\n'
                f'You have received a new application for your job posting "{job.title}".\n\n'
                f'Applicant: {applicant.first_name} {applicant.last_name}\n'
                f'Email: {applicant.email}\n\n'
                f'Please log in to your account to review the application.\n\n'
                f'Best regards,\nJob Portal Team')

class MyPostedJobsView(generics.ListAPIView):
    serializer_class = JobPostListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            user = self.request.user
            role = getattr(user, 'job_role', None)
            
            if role in ('Employer', 'Company'):
                # Show all jobs (active and inactive) for job owners to manage
                return JobPost.objects.filter(publisher=user, deleted_at__isnull=True).select_related('publisher').order_by('-created_at')
            else:
                return JobPost.objects.none()
        except Exception as e:
            logger.error(f"Error in MyPostedJobsView.get_queryset: {str(e)}")
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
        except (ValueError, TypeError) as e:
            logger.warning(f"Invalid job_id '{job_id}' in JobApplicantsView: {str(e)}")
            return JobApplication.objects.none()
        
        queryset = JobApplication.objects.filter(job=job).select_related('applicant').order_by('-applied_at')
        
        # Filter by status if provided
        filter_status = self.request.query_params.get('status')
        if filter_status and filter_status != 'all':
            queryset = queryset.filter(status=filter_status)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        # Get filtered queryset (includes job validation)
        queryset = self.get_queryset()
        count = queryset.count()
        
        # If count is 0, check if job exists or no applications
        if count == 0:
            job_id = self.kwargs['job_id']
            try:
                JobPost.objects.get(id=job_id, publisher=request.user)
                # Job exists but no applications
            except JobPost.DoesNotExist:
                return Response({'message': 'Job not found'}, status=404)
            except (ValueError, TypeError):
                return Response({'message': 'Invalid job ID'}, status=400)
        
        if count == 0:
            filter_status = self.request.query_params.get('status')
            message = (f'No applicants found with status: {filter_status}' 
                      if filter_status and filter_status != 'all' 
                      else 'No applications received for this job yet.')
            return Response({
                'message': message,
                'applicants': []
            })
        
        try:
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'message': f'{count} applicants found',
                'applicants': serializer.data
            })
        except Exception as e:
            logger.error(f"Serialization error in JobApplicantsView: {str(e)}")
            return Response({
                'error': 'SERIALIZATION_ERROR',
                'message': 'Failed to retrieve applicants data'
            }, status=500)

class MyAppliedJobsView(generics.ListAPIView):
    serializer_class = ApplicationListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['job__title', 'job__company_name']
    ordering = ['-applied_at']
    
    # Cache valid statuses to avoid repeated list comprehension
    _valid_statuses = None
    
    @classmethod
    def get_valid_statuses(cls):
        if cls._valid_statuses is None:
            cls._valid_statuses = [choice[0] for choice in JobApplication.STATUS_CHOICES]
        return cls._valid_statuses
    
    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'job_role', None)
        
        if role in ('Employee', 'Employer'):
            queryset = JobApplication.objects.filter(applicant=user).select_related('job', 'job__publisher').order_by('-applied_at')
            
            # Filter by status if provided
            filter_status = self.request.query_params.get('status')
            if filter_status and filter_status != 'all':
                try:
                    if filter_status in self.get_valid_statuses():
                        queryset = queryset.filter(status=filter_status)
                    else:
                        logger.warning(f"Invalid status parameter '{filter_status}' in MyAppliedJobsView")
                except Exception as e:
                    logger.warning(f"Error filtering by status '{filter_status}': {str(e)}")
                    # Continue without status filter if error occurs
            
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
        count = queryset.count()
        
        if count == 0:
            filter_status = self.request.query_params.get('status')
            if filter_status and filter_status != 'all':
                message = f'No applications found with status: {filter_status}'
            else:
                message = 'You have not applied to any jobs yet.'
            return Response({
                'message': message,
                'results': []
            })
        
        try:
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'message': f'{count} applications found',
                'results': serializer.data
            })
        except Exception as e:
            logger.error(f"Serialization error in MyAppliedJobsView: {str(e)}")
            return Response({
                'error': 'SERIALIZATION_ERROR',
                'message': 'Failed to retrieve applications data'
            }, status=500)

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
        
        new_status = request.data.get('status')
        if not new_status:
            return Response({'message': 'Status is required'}, status=400)
        
        valid_statuses = MyAppliedJobsView.get_valid_statuses()
        if new_status not in valid_statuses:
            return Response({'message': 'Invalid status'}, status=400)
        
        try:
            application.status = new_status
            application.save()
            return Response({
                'message': 'Application status updated successfully',
                'status': new_status
            })
        except Exception as e:
            logger.error(f"Failed to update application status: {str(e)}")
            return Response({'message': 'Failed to update application status'}, status=500)

class ApplicationStatusStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = self.request.user
        role = getattr(user, 'job_role', None)
        
        if role == 'Company':
            return Response({
                'message': 'Companies cannot view application stats as they do not apply for jobs.'
            }, status=403)
        
        try:
            # Get user's applications with efficient aggregation
            status_counts = JobApplication.objects.filter(applicant=user).values('status').annotate(count=Count('status')).order_by('status')
            status_dict = {item['status']: item['count'] for item in status_counts}
            total_applications = sum(status_dict.values())
            
            stats = {
                'total_applications': total_applications,
                'status_breakdown': {
                    'submitted': status_dict.get('submitted', 0),
                    'reviewing': status_dict.get('reviewing', 0),
                    'shortlisted': status_dict.get('shortlisted', 0),
                    'rejected': status_dict.get('rejected', 0),
                    'hired': status_dict.get('hired', 0),
                },
                'status_choices': JobApplication.STATUS_CHOICES
            }
            
            return Response(stats)
        except Exception as e:
            logger.error(f"Failed to retrieve application stats: {str(e)}")
            return Response({
                'error': 'STATS_RETRIEVAL_FAILED',
                'message': 'Failed to retrieve application statistics. Please try again.'
            }, status=500)

class JobActivateView(generics.UpdateAPIView):
    """Activate a job"""
    queryset = JobPost.objects.all()
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, *args, **kwargs):
        job = self.get_object()
        if job.publisher != request.user:
            return Response({'error': 'Permission denied'}, status=403)
        
        job.activate()
        return Response({'message': 'Job activated successfully'})

class JobDeactivateView(generics.UpdateAPIView):
    """Deactivate a job"""
    queryset = JobPost.objects.all()
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, *args, **kwargs):
        job = self.get_object()
        if job.publisher != request.user:
            return Response({'error': 'Permission denied'}, status=403)
        
        job.deactivate()
        return Response({'message': 'Job deactivated successfully'})

class JobStatsView(generics.GenericAPIView):
    """Job statistics dashboard"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = request.user
        role = getattr(user, 'job_role', None)
        
        if role not in ('Employer', 'Company'):
            return Response({'error': 'Access denied'}, status=403)
        
        user_jobs = JobPost.objects.filter(publisher=user, deleted_at__isnull=True)
        
        stats = {
            'total_jobs': user_jobs.count(),
            'active_jobs': user_jobs.filter(is_active=True).count(),
            'inactive_jobs': user_jobs.filter(is_active=False).count(),
            'total_applications': sum(job.application_count for job in user_jobs)
        }
        
        return Response(stats)

class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    
    def get_queryset(self):
        user = self.request.user
        # Allow both job publisher and applicant to view application details
        return JobApplication.objects.filter(
            Q(job__publisher=user) | Q(applicant=user)
        ).select_related('applicant', 'job')
    
    def get_object(self):
        try:
            obj = super().get_object()
            user = self.request.user
            
            # Check if user has permission to view this application
            if obj.job.publisher != user and obj.applicant != user:
                from django.core.exceptions import PermissionDenied
                raise PermissionDenied("You don't have permission to view this application.")
            
            return obj
        except JobApplication.DoesNotExist:
            from django.http import Http404
            raise Http404("Application not found.")

class UserPermissionsView(generics.GenericAPIView):
    """Get user permissions based on role for frontend validation"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            permissions = JobAccessControl.get_user_permissions(request.user)
            return Response({
                'permissions': permissions,
                'message': 'User permissions retrieved successfully'
            })
        except Exception as e:
            logger.error(f"Failed to retrieve user permissions: {str(e)}")
            return Response({
                'error': 'PERMISSIONS_RETRIEVAL_FAILED',
                'message': 'Failed to retrieve user permissions. Please try again.'
            }, status=500)

