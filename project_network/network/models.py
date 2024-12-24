from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

# Defining the Post model, which represents a post in the application
class Post(models.Model):
    # A text field for the content of the post, limited to 140 characters
    content = models.CharField(max_length=140)
    
    # A foreign key linking each post to a user, with cascading delete
    # If the user is deleted, their associated posts are also deleted
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author")
    
    # A timestamp for when the post was created, automatically set when the post is saved
    date = models.DateTimeField(auto_now_add=True)
    
    # String representation of the Post object, useful for debugging and display
    def __str__(self):
        return f"Post {self.id} made by {self.user} on {self.date.strftime('%d %b %Y %H:%M:%S')}"