# Job Portal - Full Stack Application

A comprehensive job portal application built with Django REST Framework backend and React frontend, featuring user authentication, job posting, applications, social features, and notifications.

## 🚀 Features

### Core Features
- **Multi-role Authentication**: Employee, Employer, and Company accounts
- **Job Management**: Create, edit, delete, and search job postings
- **Application System**: Apply for jobs with resume upload
- **User Profiles**: Detailed profiles with education, experience, and skills
- **Social Features**: Follow users, like posts, and notifications
- **Email Verification**: OTP-based email verification system

### User Roles
- **Employee**: Browse jobs, apply, manage profile, follow companies
- **Employer**: Post jobs, manage applications, company profile
- **Company**: Full company profile, job posting, applicant management

## 🛠 Tech Stack

### Backend
- **Django 5.2.8** - Web framework
- **Django REST Framework 3.15.2** - API development
- **JWT Authentication** - Secure token-based auth
- **PostgreSQL** - Primary database
- **Python-dotenv** - Environment management

### Frontend
- **React 19.2.0** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library
- **React Icons** - Additional icons

## 📁 Project Structure

```
Job_portal/
├── Backend (Jobportal)/
│   ├── accounts/          # User authentication & management
│   ├── profiles/          # User profiles & education
│   ├── job_post/          # Job posting & applications
│   ├── posts/             # Social posts & interactions
│   ├── follows/           # User following system
│   ├── notifications/     # Notification system
│   ├── media/             # File uploads (resumes, images)
│   └── authentication/    # Django project settings
├── Frontend/
│   └── myapp/             # React application
├── env/                   # Python virtual environment
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Job_portal
```

2. **Create and activate virtual environment**
```bash
python -m venv env
# Windows
env\Scripts\activate
# Linux/Mac
source env/bin/activate
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Database Setup**
```bash
# Create PostgreSQL database named 'jobportal'
# Update database credentials in settings.py if needed
```

5. **Environment Variables**
Create `.env` file in the root directory:
```env
SECRET_KEY=your-secret-key
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

6. **Run migrations**
```bash
cd Jobportal
python manage.py makemigrations
python manage.py migrate
```

7. **Create superuser**
```bash
python manage.py createsuperuser
```

8. **Start backend server**
```bash
python manage.py runserver
```
Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd Frontend/myapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📊 Database Models

### User Model (accounts/models.py)
- Custom user model with email authentication
- Role-based access (Employee/Employer/Company)
- OTP verification system

### Job Post Model (job_post/models.py)
- Job details (title, description, requirements)
- Work modes (Remote/Hybrid/On-site)
- Job types (Full-time/Part-time/Intern)
- Application tracking

### Profile Models (profiles/models.py)
- User profiles with personal information
- Education and experience tracking
- Skills and certifications

### Application Model
- Job application management
- Resume upload functionality
- Application status tracking

## 🔐 Authentication System

### JWT Token Authentication
- Access tokens (60 minutes lifetime)
- Refresh tokens (1 day lifetime)
- Token rotation for security

### Email Verification
- OTP-based email verification
- SMTP configuration with Gmail
- Account activation workflow

## 🌐 API Endpoints

### Authentication
- `POST /accounts/register/` - User registration
- `POST /accounts/login/` - User login
- `POST /accounts/verify-otp/` - Email verification
- `POST /accounts/refresh/` - Token refresh

### Job Management
- `GET /api/jobs/` - List all jobs
- `POST /api/jobs/` - Create job (Employer/Company only)
- `GET /api/jobs/{id}/` - Job details
- `PUT /api/jobs/{id}/` - Update job
- `DELETE /api/jobs/{id}/` - Delete job

### Applications
- `POST /api/jobs/{id}/apply/` - Apply for job
- `GET /api/applications/` - User's applications
- `GET /api/jobs/{id}/applications/` - Job applications (Employer only)

### Profiles
- `GET /profiles/profile/` - User profile
- `PUT /profiles/profile/` - Update profile
- `POST /profiles/education/` - Add education
- `GET /profiles/education/` - List education

### Social Features
- `POST /api-follows/follow/` - Follow user
- `GET /api-follows/followers/` - Get followers
- `POST /api-post/posts/` - Create post
- `POST /api-post/posts/{id}/like/` - Like post

## 🔧 Configuration

### CORS Settings
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Media Files
- Profile images: `/media/profile_images/`
- Company logos: `/media/company_logos/`
- Resumes: `/media/resumes/`
- Post attachments: `/media/posts/`

### Email Configuration
- SMTP backend with Gmail
- TLS encryption enabled
- Environment-based credentials

## 🚀 Deployment

### Backend Deployment
1. Set `DEBUG = False` in settings.py
2. Configure production database
3. Set up static file serving
4. Configure ALLOWED_HOSTS
5. Set up HTTPS

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to static hosting (Netlify, Vercel)
3. Update API base URL for production

## 🧪 Testing

### Backend Tests
```bash
cd Jobportal
python manage.py test
```

### Frontend Tests
```bash
cd Frontend/myapp
npm run lint
```

## 📝 Usage Examples

### Register a new user
```javascript
const response = await fetch('http://localhost:8000/accounts/register/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword',
    first_name: 'John',
    job_role: 'Employee'
  })
});
```

### Create a job post
```javascript
const response = await fetch('http://localhost:8000/api/jobs/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    title: 'Software Developer',
    description: 'Looking for a skilled developer...',
    location: 'New York',
    job_type: 'fulltime',
    work_mode: 'remote'
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- File upload size limits may need adjustment for large resumes
- Email delivery may be slow with Gmail SMTP in development
- CORS configuration may need updates for production domains

## 🔮 Future Enhancements

- Real-time chat between employers and candidates
- Advanced job filtering and search
- Integration with LinkedIn API
- Mobile application development
- AI-powered job recommendations
- Video interview scheduling

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

**Happy Job Hunting! 🎯**
