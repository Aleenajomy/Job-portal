/**
 * Role-based access control utilities for frontend
 */

export const USER_ROLES = {
  EMPLOYEE: 'Employee',
  EMPLOYER: 'Employer',
  COMPANY: 'Company'
};

export const PERMISSIONS = {
  CAN_CREATE_JOBS: 'can_create_jobs',
  CAN_APPLY_TO_JOBS: 'can_apply_to_jobs',
  CAN_VIEW_APPLICATIONS: 'can_view_applications'
};

/**
 * Check if user can create/modify jobs
 */
export const canCreateJobs = (userRole) => {
  return userRole === USER_ROLES.EMPLOYER || userRole === USER_ROLES.COMPANY;
};

/**
 * Check if user can apply to jobs
 */
export const canApplyToJobs = (userRole) => {
  return userRole === USER_ROLES.EMPLOYEE || userRole === USER_ROLES.EMPLOYER;
};

/**
 * Check if user can view job applications
 */
export const canViewApplications = (userRole) => {
  return userRole === USER_ROLES.EMPLOYER || userRole === USER_ROLES.COMPANY;
};

/**
 * Check if user can apply to a specific job
 */
export const canApplyToJob = (userRole, job, currentUserId) => {
  // Basic role check - only Employee and Employer can apply
  if (!canApplyToJobs(userRole)) {
    return {
      canApply: false,
      reason: userRole === USER_ROLES.COMPANY 
        ? 'Companies cannot apply for jobs. You can only post jobs and view applicants.'
        : 'Only Employees and Employers can apply for jobs.'
    };
  }

  // Check if user is trying to apply to their own job
  if (job && (job.publisher === currentUserId || job.publisher_id === currentUserId)) {
    return {
      canApply: false,
      reason: 'You cannot apply to your own job posting.'
    };
  }

  // Check if job is active
  if (job && job.is_active === false) {
    return {
      canApply: false,
      reason: 'This job is no longer active.'
    };
  }

  return {
    canApply: true,
    reason: null
  };
};

/**
 * Get user permissions object
 */
export const getUserPermissions = (userRole) => {
  return {
    [PERMISSIONS.CAN_CREATE_JOBS]: canCreateJobs(userRole),
    [PERMISSIONS.CAN_APPLY_TO_JOBS]: canApplyToJobs(userRole),
    [PERMISSIONS.CAN_VIEW_APPLICATIONS]: canViewApplications(userRole),
    role: userRole
  };
};

/**
 * Validate job application with detailed error handling
 */
export const validateJobApplication = (userRole, job, currentUserId, isLoggedIn) => {
  if (!isLoggedIn) {
    return {
      isValid: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Please log in to apply for jobs.',
      showLoginButton: true
    };
  }

  const applicationCheck = canApplyToJob(userRole, job, currentUserId);
  
  if (!applicationCheck.canApply) {
    let errorCode = 'ACCESS_DENIED';
    
    if (userRole === USER_ROLES.COMPANY) {
      errorCode = 'COMPANY_CANNOT_APPLY';
    } else if (job && job.publisher_id === currentUserId) {
      errorCode = 'OWN_JOB_APPLICATION';
    } else if (job && !job.is_active) {
      errorCode = 'JOB_INACTIVE';
    }

    return {
      isValid: false,
      error: errorCode,
      message: applicationCheck.reason,
      showLoginButton: false
    };
  }

  return {
    isValid: true,
    error: null,
    message: 'You can apply to this job.',
    showLoginButton: false
  };
};