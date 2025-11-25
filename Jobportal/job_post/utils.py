import os
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from django.conf import settings

def convert_to_pdf(file):
    """Convert DOC/DOCX to PDF or return original if already PDF"""
    file_extension = os.path.splitext(file.name)[1].lower()
    
    if file_extension == '.pdf':
        return file
    
    # For DOC/DOCX conversion, you would need python-docx2pdf or similar
    # For now, we'll return the original file (implement conversion as needed)
    return file

def get_applicant_name(user):
    """Get applicant name from user or email fallback"""
    if user.first_name and user.last_name:
        return f"{user.first_name} {user.last_name}"
    elif user.first_name:
        return user.first_name
    else:
        # Use email username as fallback
        return user.email.split('@')[0]

def send_application_email(application):
    """Send email notification to job publisher"""
    job = application.job
    publisher_email = job.publisher.email
    
    subject = f"New Job Application: {job.title}"
    
    message = f"""
    You have received a new job application for: {job.title}
    
    Applicant Details:
    Name: {application.applicant_name}
    Email: {application.applicant_email}
    Applied on: {application.applied_at.strftime('%Y-%m-%d %H:%M')}
    
    """
    
    if application.cover_letter:
        message += f"Cover Letter:\n{application.cover_letter}\n\n"
    
    message += "Please find the resume attached as PDF."
    
    email = EmailMessage(
        subject=subject,
        body=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[publisher_email],
    )
    
    # Attach resume PDF
    if application.resume_pdf:
        email.attach_file(application.resume_pdf.path)
    elif application.resume:
        email.attach_file(application.resume.path)
    
    email.send()