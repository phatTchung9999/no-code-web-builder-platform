from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View

from .forms import ProjectForm
from .models import Project


class ProjectListView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        projects = Project.objects.filter(owner=request.user)

        context = {
            'projects': projects,
        }
        return render(request, 'projects/project_list.html', context)


class ProjectDetailView(LoginRequiredMixin, View):
    def get(self, request, project_id, *args, **kwargs):
        project = get_object_or_404(
            Project,
            id=project_id,
            owner=request.user
        )

        context = {
            'project': project,
            'pages': project.pages.all(),
        }
        return render(request, 'projects/project_detail.html', context)


class ProjectCreateView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        form = ProjectForm()

        context = {
            'form': form,
        }
        return render(request, 'projects/project_create.html', context)

    def post(self, request, *args, **kwargs):
        form = ProjectForm(request.POST)

        if form.is_valid():
            project = form.save(commit=False)
            project.owner = request.user
            project.save()

            return redirect('project-detail', project_id=project.id)

        context = {
            'form': form,
        }
        return render(request, 'projects/project_create.html', context)
    
class ProjectPublishToggleView(LoginRequiredMixin, View):
    def post(self, request, project_id, *args, **kwargs):
        project = get_object_or_404(
            Project,
            id=project_id,
            owner=request.user
        )

        project.is_published = not project.is_published
        project.save(update_fields=['is_published', 'updated_at'])

        return redirect('project-detail', project_id=project.id)