from django.urls import path
from .views import ProjectCreateView, ProjectDetailView, ProjectListView, ProjectPublishToggleView

urlpatterns = [
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('projects/create/', ProjectCreateView.as_view(), name='project-create'),
    path('projects/<int:project_id>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<int:project_id>/toggle-publish/', ProjectPublishToggleView.as_view(), name='project-toggle-publish'),
]