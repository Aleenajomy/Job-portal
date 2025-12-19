from django.urls import path
from .views import (
    JobListCreateView, JobDetailView, JobApplicationView, MyPostedJobsView, 
    JobApplicantsView, MyAppliedJobsView, UpdateApplicationStatusView, 
    ApplicationStatusStatsView, UserPermissionsView, JobActivateView, 
    JobDeactivateView, JobStatsView, ApplicationDetailView, DownloadResumeView
)

urlpatterns = [
    path('jobs/', JobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('jobs/<int:job_id>/apply/', JobApplicationView.as_view(), name='job-apply'),
    path('jobs/<int:job_id>/applicants/', JobApplicantsView.as_view(), name='job-applicants'),
    path('jobs/<int:pk>/activate/', JobActivateView.as_view(), name='job-activate'),
    path('jobs/<int:pk>/deactivate/', JobDeactivateView.as_view(), name='job-deactivate'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('applications/<int:application_id>/resume/download/', DownloadResumeView.as_view(), name='download-resume'),
    path('applications/<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='update-application-status'),
    path('my-posted-jobs/', MyPostedJobsView.as_view(), name='my-posted-jobs'),
    path('my-applied-jobs/', MyAppliedJobsView.as_view(), name='my-applied-jobs'),
    path('job-stats/', JobStatsView.as_view(), name='job-stats'),
    path('application-stats/', ApplicationStatusStatsView.as_view(), name='application-stats'),
    path('user-permissions/', UserPermissionsView.as_view(), name='user-permissions'),
]