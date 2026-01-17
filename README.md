# Job Portal

A full-stack Job Portal web application built using **Django REST
Framework** for the backend and **React (Vite)** for the frontend.\
This platform connects job seekers and employers, offering
authentication, job management, and social networking features in one
unified system.

------------------------------------------------------------------------

## Project Structure

``` text
Job-Portal/
├── job_portal/          # Django Backend
│   ├── authentication/  # User authentication app
│   ├── home/           # User profiles & follow system
│   ├── jobs/           # Job management app
│   ├── posts/          # Social posts & comments
│   ├── media/          # Uploaded files (images, resumes)
│   └── manage.py       # Django management script
├── jobportal/          # React Frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   └── services/   # API services
│   ├── public/         # Static assets
│   └── package.json    # Frontend dependencies
└── venv/               # Python virtual environment (excluded from git)
```

------------------------------------------------------------------------

## Features

### Backend (Django)

-   User authentication (Register, Login, OTP verification, Password
    reset)
-   Dual user profiles (Individual & Company)
-   Job posting & application system\
-   Social posts with comments & likes\
-   Follow / Unfollow system\
-   File uploads (profile images, resumes, post images)\
-   RESTful API with JWT authentication

### Frontend (React)

-   Complete authentication flow\
-   Home dashboard with tab navigation\
-   Responsive UI design\
-   Password change functionality\
-   Tabs: Home, Network, Jobs, Notifications, Posts\
-   API integration using Axios

------------------------------------------------------------------------

## ⚙️ Setup Instructions

### Backend Setup

``` bash
cd job_portal
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate  # Linux/Mac

pip install django djangorestframework django-cors-headers pillow
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

``` bash
cd jobportal
npm install
npm run dev
```

------------------------------------------------------------------------

## API Endpoints

### Authentication

-   `POST /api/auth/register/` -- User registration\
-   `POST /api/auth/login/` -- User login\
-   `POST /api/auth/verify-otp/` -- OTP verification\
-   `POST /api/auth/forgot-password/` -- Password reset request\
-   `POST /api/auth/reset-password/` -- Password reset

### User Management

-   `GET /api/home/profile/` -- Get user profile\
-   `PUT /api/home/profile/` -- Update profile\
-   `POST /api/auth/change-password/` -- Change password

### Jobs

-   `GET /api/jobs/` -- List jobs\
-   `POST /api/jobs/` -- Create job\
-   `POST /api/jobs/{id}/apply/` -- Apply for a job

### Posts

-   `GET /api/posts/` -- List posts\
-   `POST /api/posts/` -- Create post\
-   `POST /api/posts/{id}/like/` -- Like / Unlike post\
-   `POST /api/posts/{id}/comment/` -- Add comment

------------------------------------------------------------------------

## Technologies Used

### Backend

-   Django 4.x\
-   Django REST Framework\
-   SQLite / PostgreSQL\
-   Pillow (Image Processing)\
-   CORS Headers

### Frontend

-   React 18\
-   Vite\
-   CSS3 (Responsive Design)\
-   Axios

------------------------------------------------------------------------

## Current Status

-    Complete authentication system\
-    User profile management\
-    Job posting & application system\
-    Social posts with likes & comments\
-    Follow / Unfollow functionality\
-    Responsive frontend with tab navigation\
-    Password change functionality

------------------------------------------------------------------------

## Next Steps

-   Add content to empty navigation pages\
-   Implement real-time notifications\
-   Add search & filtering\
-   Enhance UI/UX\
-   Expand social features

------------------------------------------------------------------------

## Contributing

1.  Fork the repository\
2.  Create a feature branch\
3.  Make your changes\
4.  Test thoroughly\
5.  Submit a pull request

------------------------------------------------------------------------

## License

This project is open-source and available under the **MIT License**.
