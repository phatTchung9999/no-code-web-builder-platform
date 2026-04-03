import json

from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View

from .forms import PageForm
from .models import Page
from projects.models import Project


class BuilderHomeView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        return redirect('project-list')


class DashboardView(LoginRequiredMixin, View):
    def get(self, request, page_id, *args, **kwargs):
        page = get_object_or_404(
            Page,
            id=page_id,
            project__owner=request.user
        )

        context = {
            'page': page,
            'project': page.project,
        }

        return render(request, 'builder/dashboard.html', context)


class SavePageLayoutView(LoginRequiredMixin, View):
    def post(self, request, page_id, *args, **kwargs):
        page = get_object_or_404(
            Page,
            id=page_id,
            project__owner=request.user
        )

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse(
                {
                    'status': 'error',
                    'message': 'Invalid JSON',
                },
                status=400
            )

        layout = data.get('layout')

        if layout is None:
            return JsonResponse(
                {
                    'status': 'error',
                    'message': 'Missing layout data',
                },
                status=400
            )

        page.layout = layout
        page.save(update_fields=['layout', 'updated_at'])

        return JsonResponse(
            {
                'status': 'success',
                'message': 'Layout saved successfully',
            }
        )


class PageCreateView(LoginRequiredMixin, View):
    def get(self, request, project_id, *args, **kwargs):
        project = get_object_or_404(
            Project,
            id=project_id,
            owner=request.user
        )

        form = PageForm()

        context = {
            'project': project,
            'form': form,
        }
        return render(request, 'builder/page_create.html', context)

    def post(self, request, project_id, *args, **kwargs):
        project = get_object_or_404(
            Project,
            id=project_id,
            owner=request.user
        )

        form = PageForm(request.POST)

        if form.is_valid():
            page = form.save(commit=False)
            page.project = project

            if not page.layout:
                page.layout = {"elements": []}

            page.save()

            return redirect('builder-dashboard', page_id=page.id)

        context = {
            'project': project,
            'form': form,
        }
        return render(request, 'builder/page_create.html', context)