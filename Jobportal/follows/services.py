def can_follow(follower, following):
    # All roles cannot follow themselves
    if follower.id == following.id:
        return "self"

    # All roles can follow all other roles
    return True