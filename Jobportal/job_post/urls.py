from django.urls import path
from .views import JobListCreateView, JobDetailView, JobApplicationView, MyPostedJobsView, JobApplicantsView, MyAppliedJobsView, UpdateApplicationStatusView, ApplicationStatusStatsView

urlpatterns = [
    path('jobs/', JobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('jobs/<int:job_id>/apply/', JobApplicationView.as_view(), name='job-apply'),
    path('jobs/<int:job_id>/applicants/', JobApplicantsView.as_view(), name='job-applicants'),
    path('applications/<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='update-application-status'),
    path('my-posted-jobs/', MyPostedJobsView.as_view(), name='my-posted-jobs'),
    path('my-applied-jobs/', MyAppliedJobsView.as_view(), name='my-applied-jobs'),
    path('application-stats/', ApplicationStatusStatsView.as_view(), name='application-stats'),
]