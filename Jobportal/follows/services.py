def can_follow(follower, following):
    # Debug prints
    print(f"Follower ID: {follower.id}, Following ID: {following.id}")
    print(f"Are they equal? {follower.id == following.id}")
    
    # All roles cannot follow themselves
    if follower.id == following.id:
        print("Returning 'self'")
        return "self"

    follower_role = follower.job_role
    following_role = following.job_role

    # Company can follow other Companies
    if follower_role == "Company":
        return following_role == "Company"

    # Employer can follow Company, Employer, Employee
    if follower_role == "Employer":
        return following_role in ["Company", "Employer", "Employee"]

    # Employee can follow Company, Employer, Employee  
    if follower_role == "Employee":
        return following_role in ["Company", "Employer", "Employee"]

    print("Returning False")
    return False