from django.db import models
from projects.models import Project


class Page(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='pages'
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    layout = models.JSONField(default=dict, blank=True)
    is_homepage = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']
        unique_together = ['project', 'slug']

    def __str__(self):
        return f'{self.project.name} - {self.name}'