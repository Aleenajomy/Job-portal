"""
Test cases for role-based access control validation
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import JobPost, JobApplication
from .validators import RoleValidator, JobAccessControl

User = get_user_model()


class RoleValidationTestCase(TestCase):
    def setUp(self):
        # Create users with different roles
        self.employee = User.objects.create_user(
            email='employee@test.com',
            password='testpass123',
            first_name='John',
            job_role='Employee'
        )
        
        self.employer = User.objects.create_user(
            email='employer@test.com',
            password='testpass123',
            first_name='Jane',
            job_role='Employer'
        )
        
        self.company = User.objects.create_user(
            email='company@test.com',
            password='testpass123',
            first_name='TechCorp',
            job_role='Company'
        )
        
        # Create a job posted by employer
        self.job = JobPost.objects.create(
            title='Test Job',
            description='Test Description',
            publisher=self.employer,
            publisher_role='Employer'
        )
        
        self.client = APIClient()

    def test_job_creation_permissions(self):
        """Test who can create jobs"""
        # Employee cannot create jobs
        can_create, message = RoleValidator.can_create_job(self.employee)
        self.assertFalse(can_create)
        self.assertIn('Only Employers and Companies', message)
        
        # Employer can create jobs
        can_create, message = RoleValidator.can_create_job(self.employer)
        self.assertTrue(can_create)
        
        # Company can create jobs
        can_create, message = RoleValidator.can_create_job(self.company)
        self.assertTrue(can_create)

    def test_job_application_permissions(self):
        """Test who can apply to jobs"""
        # Employee can apply
        can_apply, message = RoleValidator.can_apply_to_job(self.employee, self.job)
        self.assertTrue(can_apply)
        
        # Employer can apply (but not to own job)
        can_apply, message = RoleValidator.can_apply_to_job(self.employer, self.job)
        self.assertFalse(can_apply)  # Own job
        self.assertIn('cannot apply to your own job', message)
        
        # Company cannot apply
        can_apply, message = RoleValidator.can_apply_to_job(self.company, self.job)
        self.assertFalse(can_apply)
        self.assertIn('Companies cannot apply', message)

    def test_user_permissions(self):
        """Test user permissions based on role"""
        # Employee permissions
        perms = JobAccessControl.get_user_permissions(self.employee)
        self.assertFalse(perms['can_create_jobs'])
        self.assertTrue(perms['can_apply_to_jobs'])
        self.assertFalse(perms['can_view_applications'])
        
        # Employer permissions
        perms = JobAccessControl.get_user_permissions(self.employer)
        self.assertTrue(perms['can_create_jobs'])
        self.assertTrue(perms['can_apply_to_jobs'])
        self.assertTrue(perms['can_view_applications'])
        
        # Company permissions
        perms = JobAccessControl.get_user_permissions(self.company)
        self.assertTrue(perms['can_create_jobs'])
        self.assertFalse(perms['can_apply_to_jobs'])
        self.assertTrue(perms['can_view_applications'])

    def test_api_job_creation(self):
        """Test job creation via API"""
        job_data = {
            'title': 'API Test Job',
            'description': 'Test job via API',
            'location': 'Remote',
            'job_type': 'fulltime'
        }
        
        # Employee cannot create job
        self.client.force_authenticate(user=self.employee)
        response = self.client.post('/api/jobs/', job_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('ACCESS_DENIED', response.data.get('error', ''))
        
        # Employer can create job
        self.client.force_authenticate(user=self.employer)
        response = self.client.post('/api/jobs/', job_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Company can create job
        self.client.force_authenticate(user=self.company)
        response = self.client.post('/api/jobs/', job_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_api_job_application(self):
        """Test job application via API"""
        application_data = {
            'resume': 'test_resume.pdf',
            'cover_letter': 'Test cover letter'
        }
        
        # Employee can apply
        self.client.force_authenticate(user=self.employee)
        response = self.client.post(f'/api/jobs/{self.job.id}/apply/', application_data)
        # Note: This might fail due to file upload, but should not be 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Company cannot apply
        self.client.force_authenticate(user=self.company)
        response = self.client.post(f'/api/jobs/{self.job.id}/apply/', application_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('ACCESS_DENIED', response.data.get('error', ''))
        
        # Employer cannot apply to own job
        self.client.force_authenticate(user=self.employer)
        response = self.client.post(f'/api/jobs/{self.job.id}/apply/', application_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('OWN_JOB_APPLICATION', response.data.get('error', ''))