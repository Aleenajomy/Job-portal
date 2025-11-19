import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'authentication.settings')
django.setup()

from profiles.models import Skill

# Sample skills data
skills_data = [
    # Technical Skills
    ('Python', 'technical'),
    ('JavaScript', 'technical'),
    ('Java', 'technical'),
    ('React', 'technical'),
    ('Django', 'technical'),
    ('Node.js', 'technical'),
    ('SQL', 'technical'),
    ('HTML/CSS', 'technical'),
    ('Git', 'technical'),
    ('Docker', 'technical'),
    
    # Soft Skills
    ('Communication', 'soft'),
    ('Leadership', 'soft'),
    ('Problem Solving', 'soft'),
    ('Teamwork', 'soft'),
    ('Time Management', 'soft'),
    ('Critical Thinking', 'soft'),
    
    # Languages
    ('English', 'language'),
    ('Spanish', 'language'),
    ('French', 'language'),
    ('German', 'language'),
    
    # Other
    ('Project Management', 'other'),
    ('Data Analysis', 'other'),
    ('UI/UX Design', 'other'),
]

for skill_name, category in skills_data:
    skill, created = Skill.objects.get_or_create(
        name=skill_name,
        defaults={'category': category}
    )
    if created:
        print(f"Created skill: {skill_name}")
    else:
        print(f"Skill already exists: {skill_name}")

print("Sample skills created successfully!")