# Role-Based Access Control Implementation

## Overview
This document outlines the role-based access control features implemented for the Job Portal application.

## User Roles
- **Employee**: Can apply to jobs, cannot create jobs
- **Employer**: Can create jobs AND apply to other jobs (not their own)
- **Company**: Can create jobs, cannot apply to any jobs

## Implemented Features

### 1. IsEmployerOrCompanyOrReadOnly
**Location**: `job_post/permissions.py`
- Only Employers and Companies can create/modify job postings
- All users can read/view jobs
- Only job publishers can modify/delete their own jobs

### 2. CanApplyToJob
**Location**: `job_post/permissions.py`
- Prevents users from applying to their own jobs
- Only Employee and Employer roles can apply to jobs
- Company role cannot apply to any jobs

### 3. Enhanced Validation

#### Backend Validation (`job_post/views.py`)
- **Job Creation**: Validates user role before allowing job creation
- **Job Application**: Multiple validation layers:
  - Role-based access (Employee/Employer only)
  - Own job prevention
  - Duplicate application prevention
  - Active job validation

#### Frontend Validation (`utils/roleValidation.js`)
- Centralized validation utilities
- Role-based UI rendering
- Detailed error messages for different scenarios

## API Endpoints

### Job Management
- `POST /api/jobs/` - Create job (Employer/Company only)
- `GET /api/jobs/` - List jobs (All users)
- `PUT/PATCH /api/jobs/{id}/` - Update job (Owner only)
- `DELETE /api/jobs/{id}/` - Delete job (Owner only)

### Job Applications
- `POST /api/jobs/{id}/apply/` - Apply to job (Employee/Employer only, not own jobs)
- `GET /api/my-applied-jobs/` - View applications (Employee/Employer only)
- `GET /api/jobs/{id}/applicants/` - View applicants (Job owner only)

### User Permissions
- `GET /api/user-permissions/` - Get user role-based permissions

## Validation Rules

### Job Creation
```python
# Only Employer and Company can create jobs
if user_role not in ('Employer', 'Company'):
    return 403 - ACCESS_DENIED
```

### Job Application
```python
# Multiple validation checks
if user_role == 'Company':
    return 403 - ACCESS_DENIED (Companies cannot apply)

if user_role not in ('Employee', 'Employer'):
    return 403 - INVALID_ROLE

if job.publisher == user:
    return 403 - OWN_JOB_APPLICATION

if JobApplication.exists(job, user):
    return 400 - ALREADY_APPLIED
```

## Frontend Implementation

### Role-Based UI Rendering
- Different buttons/messages based on user role
- Validation before API calls
- Clear error messages for access denied scenarios

### Key Components Updated
- `JobDetail.jsx` - Apply button logic with role validation
- `JobList.jsx` - Job management access based on role
- `roleValidation.js` - Centralized validation utilities

## Error Handling

### Backend Error Codes
- `ACCESS_DENIED` - Role-based access denied
- `INVALID_ROLE` - Invalid user role for operation
- `OWN_JOB_APPLICATION` - Trying to apply to own job
- `ALREADY_APPLIED` - Duplicate application attempt
- `JOB_NOT_FOUND` - Job doesn't exist or inactive

### Frontend Error Handling
- Specific UI messages for each error type
- Appropriate button states (disabled/enabled)
- Login prompts for unauthenticated users

## Testing
Test file: `job_post/test_validation.py`
- Role-based permission tests
- API endpoint access tests
- Validation logic tests

## Security Features
1. **Permission Classes**: Django REST framework permissions
2. **Role Validation**: Server-side validation for all operations
3. **Object-Level Permissions**: Users can only modify their own jobs
4. **Duplicate Prevention**: Prevents multiple applications to same job
5. **Active Job Validation**: Only active jobs accept applications

## Usage Examples

### Employee User
- ✅ Can view all jobs
- ✅ Can apply to jobs (except own - N/A)
- ❌ Cannot create jobs
- ❌ Cannot view job applications

### Employer User
- ✅ Can view all jobs
- ✅ Can create and manage jobs
- ✅ Can apply to other employers'/companies' jobs
- ❌ Cannot apply to own jobs
- ✅ Can view applications for own jobs

### Company User
- ✅ Can view all jobs
- ✅ Can create and manage jobs
- ❌ Cannot apply to any jobs
- ✅ Can view applications for own jobs

This implementation ensures proper role-based access control while maintaining a user-friendly experience with clear feedback for access restrictions.