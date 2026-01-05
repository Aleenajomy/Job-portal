from django.db.models.signals import post_save
from django.dispatch import receiver
from follows.models import Follow
from posts.models import Post, PostLike, Comment
from job_post.models import JobPost, JobApplication
from .models import Notification

@receiver(post_save, sender=Follow)
def create_follow_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            recipient=instance.following,
            sender=instance.follower,
            notification_type='follow',
            message=f"{instance.follower.get_full_name()} started following you",
            object_id=instance.id
        )

@receiver(post_save, sender=Post)
def notify_followers_on_post(sender, instance, created, **kwargs):
    if created:
        followers = instance.author.followers.all()
        for follow in followers:
            Notification.objects.create(
                recipient=follow.follower,
                sender=instance.author,
                notification_type='post',
                message=f"{instance.author.get_full_name()} added a new post",
                object_id=instance.id
            )

@receiver(post_save, sender=PostLike)
def create_like_notification(sender, instance, created, **kwargs):
    if created and instance.user != instance.post.author:
        Notification.objects.create(
            recipient=instance.post.author,
            sender=instance.user,
            notification_type='like',
            message=f"{instance.user.get_full_name()} liked your post",
            object_id=instance.post.id
        )

@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created and instance.user != instance.post.author:
        Notification.objects.create(
            recipient=instance.post.author,
            sender=instance.user,
            notification_type='comment',
            message=f"{instance.user.get_full_name()} commented on your post",
            object_id=instance.post.id
        )

@receiver(post_save, sender=JobPost)
def notify_followers_on_job_post(sender, instance, created, **kwargs):
    if created:
        followers = instance.publisher.followers.all()
        for follow in followers:
            Notification.objects.create(
                recipient=follow.follower,
                sender=instance.publisher,
                notification_type='job_post',
                message=f"{instance.publisher.get_full_name()} posted a new job: {instance.title}",
                object_id=instance.id
            )

@receiver(post_save, sender=JobApplication)
def create_job_application_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            recipient=instance.job.publisher,
            sender=instance.applicant,
            notification_type='job_application',
            message=f"{instance.applicant.get_full_name()} applied for {instance.job.title}",
            object_id=instance.job.id
        )