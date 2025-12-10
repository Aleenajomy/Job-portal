import { useState } from "react";
import "./Auth.css";
import LoginForm from "./Login/LoginForm";
import SignUpForm from "./SignUp/SignUpForm";
import ForgotPasswordForm from "./ForgotPassword/ForgotPasswordForm";
import OTPVerification from "./OTPVerification/OTPVerification";

export default function Auth() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'forgot', 'otp'
  const [otpEmail, setOtpEmail] = useState("");
  const [otpType, setOtpType] = useState(""); // "signup" or "forgot"
  
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    job_role: "",
    agree: false,
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: "",
  });

  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((p) => ({ ...p, [name]: value }));
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    const currentForm = currentView === 'forgot' ? forgotPasswordForm : currentView === 'signup' ? signupForm : loginForm;
    
    if (currentView === 'signup' && !currentForm.firstName?.trim()) errs.firstName = "First name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentForm.email)) errs.email = "Enter a valid email";
    if (currentView !== 'forgot' && currentForm.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (currentView === 'signup' && currentForm.password !== currentForm.confirm) errs.confirm = "Passwords do not match";
    if (currentView === 'signup' && !currentForm.job_role) errs.job_role = "Job role is required";
    if (currentView === 'signup' && !currentForm.agree) errs.agree = "You must agree to the terms";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const currentForm = currentView === 'forgot' ? forgotPasswordForm : currentView === 'signup' ? signupForm : loginForm;
    
    if (currentView === 'forgot') {
      try {
        const response = await fetch('http://127.0.0.1:8000/accounts/forgot-password/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: currentForm.email
          })
        });
        
        if (response.ok) {
          setOtpEmail(currentForm.email);
          setOtpType("forgot");
          setCurrentView('otp');
        } else {
          const errorData = await response.json();
          setErrors(errorData);
        }
      } catch (error) {
        console.error('Forgot password error:', error);
        setErrors({ general: 'Failed to send reset email. Please try again.' });
      }
    } else if (currentView === 'signup') {
      try {
        console.log('Sending registration data:', {
          first_name: currentForm.firstName,
          last_name: currentForm.lastName,
          email: currentForm.email,
          password: currentForm.password,
          confirm_password: currentForm.confirm,
          job_role: currentForm.job_role
        });
        
        const response = await fetch('http://127.0.0.1:8000/accounts/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: currentForm.firstName,
            last_name: currentForm.lastName,
            email: currentForm.email,
            password: currentForm.password,
            confirm_password: currentForm.confirm,
            job_role: currentForm.job_role
          })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Registration successful:', data);
          setOtpEmail(currentForm.email);
          setOtpType("signup");
          setCurrentView('otp');
        } else {
          const errorData = await response.json();
          console.log('Registration error:', errorData);
          setErrors(errorData.message || errorData);
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } else {
      try {
        const response = await fetch('http://127.0.0.1:8000/accounts/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: currentForm.email,
            password: currentForm.password
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          alert('Login successful!');
          // Redirect to dashboard or main app
        } else {
          const errorData = await response.json();
          setErrors(errorData);
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: 'Login failed. Please try again.' });
      }
    }
  };

  const handleOTPVerifySuccess = () => {
    if (otpType === "signup") {
      alert("Account created successfully!");
      setCurrentView('login');
    } else {
      alert("Email verified! You can now reset your password.");
      setCurrentView('login');
    }
  };

  const handleBackFromOTP = () => {
    if (otpType === "forgot") {
      setCurrentView('forgot');
    } else {
      setCurrentView('signup');
    }
  };

  const getTitle = () => {
    switch(currentView) {
      case 'signup': return "Create an account";
      case 'forgot': return "Forgot Your Password?";
      case 'otp': return "Verify Your Email";
      default: return "Welcome Back!";
    }
  };

  const getSubtitle = () => {
    switch(currentView) {
      case 'signup': return "Build your profile, connect with peers, and discover jobs.";
      case 'forgot': return "Enter your email address and we'll send you an OTP to reset your password.";
      case 'otp': return `We've sent a 6-digit code to ${otpEmail}`;
      default: return "Login to your account to connect with professionals and explore opportunities.";
    }
  };

  const getIllustration = () => {
    switch(currentView) {
      case 'signup': return "/Sign up-rafiki.png";
      case 'forgot': return "/Forgot password-rafiki.png";
      case 'otp': return "/Enter OTP-rafiki.png";
      default: return "/Tablet-login-rafiki.png";
    }
  };

  if (currentView === 'otp') {
    return (
      <div className="auth-screen">
        <button className="back-btn" onClick={handleBackFromOTP}>
          ←
        </button>
        <div className="auth-container">
          <div className="card">
            <OTPVerification 
              email={otpEmail}
              onVerifySuccess={handleOTPVerifySuccess}
              onBack={handleBackFromOTP}
            />
          </div>
          <div className="illustration-section">
            <img src={getIllustration()} alt="OTP Verification" className="illustration-img" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      {currentView === 'forgot' && (
        <button className="back-btn" onClick={() => setCurrentView('login')}>
          ←
        </button>
      )}
      
      {currentView !== 'forgot' && (
        <div className="logo-container">
          <h1 className="logo">Logo</h1>
        </div>
      )}
      
      <div className="auth-container">
        <div className="card">
          
          {currentView !== 'forgot' && (
            <div className="tab-row">
              <button 
                className={`tab ${currentView === 'login' ? "active-tab" : ""}`}
                onClick={() => setCurrentView('login')}
              >
                Login
              </button>
              <button 
                className={`tab ${currentView === 'signup' ? "active-tab" : ""}`}
                onClick={() => setCurrentView('signup')}
              >
                Sign Up
              </button>
            </div>
          )}

          <div className={`form-container ${currentView}-active`}>
            <h2 className="title">{getTitle()}</h2>
            <p className="subtitle">{getSubtitle()}</p>

            {currentView === 'forgot' ? (
              <ForgotPasswordForm
                form={forgotPasswordForm}
                errors={errors}
                handleChange={handleForgotPasswordChange}
                handleSubmit={handleSubmit}
              />
            ) : currentView === 'signup' ? (
              <SignUpForm 
                form={signupForm}
                errors={errors}
                showPassword={showSignupPassword}
                setShowPassword={setShowSignupPassword}
                handleChange={handleSignupChange}
                handleSubmit={handleSubmit}
              />
            ) : (
              <LoginForm 
                form={loginForm}
                errors={errors}
                showPassword={showLoginPassword}
                setShowPassword={setShowLoginPassword}
                handleChange={handleLoginChange}
                handleSubmit={handleSubmit}
                onForgotPassword={() => setCurrentView('forgot')}
              />
            )}

            {currentView !== 'forgot' && (
              <>
                <div className="or-line">Or {currentView === 'signup' ? "Sign Up" : "Login"} With</div>
                <div className="social-row">
                  <SocialButton label="Google" kind="google" />
                  <SocialButton label="Facebook" kind="facebook" />
                  <SocialButton label="Apple ID" kind="apple" />
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="illustration-section">
          <img src={getIllustration()} alt="Illustration" className="illustration-img" />
        </div>
      </div>
      
      <footer className="footer">
        <nav className="lf-links">
          <a href="#">2025</a>
          <a href="#">About</a>
          <a href="#">Privacy Policy</a>
        </nav>
        <div className="lf-right">
          <select defaultValue="en">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </footer>
    </div>
  );
}

function SocialButton({ label, kind }) {
  const icons = {
    google: <img src="https://www.google.com/favicon.ico" alt="Google" />,
    facebook: (    
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"/>
      </svg>    
    ),
    apple: (    
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    )
  };

  return (
    <button className="social-btn" type="button">
      <span className="social-icon">{icons[kind]}</span>
      <span className="social-label">{label}</span>
    </button>
  );
}