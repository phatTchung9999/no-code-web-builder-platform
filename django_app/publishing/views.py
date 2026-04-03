from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, render
from django.views import View

from builder.models import Page
from projects.models import Project


def build_render_elements(layout):
    elements = layout.get('elements', [])
    rendered_elements = []

    for element in elements:
        element_type = element.get('type', '')
        content = element.get('content', '')
        styles = element.get('styles', {}) or {}
        settings = element.get('settings', {}) or {}

        rendered_element = {
            'type': element_type,
            'content': content,
            'font_size': styles.get('fontSize', '16px'),
            'color': styles.get('color', '#111827'),
            'text_align': styles.get('textAlign', 'left'),
            'margin_bottom': styles.get('marginBottom', '16px'),
            'background_color': styles.get('backgroundColor', '#111827'),
            'url': settings.get('url', '#'),
            'image_url': settings.get('imageUrl', ''),
            'alt_text': settings.get('altText', 'Image'),
            'width': styles.get('width', '300px'),
        }

        rendered_elements.append(rendered_element)

    return rendered_elements


class PreviewPageView(LoginRequiredMixin, View):
    def get(self, request, page_id, *args, **kwargs):
        page = get_object_or_404(
            Page,
            id=page_id,
            project__owner=request.user
        )

        render_elements = build_render_elements(page.layout or {})

        context = {
            'project': page.project,
            'page': page,
            'render_elements': render_elements,
            'is_preview': True,
        }
        return render(request, 'publishing/rendered_page.html', context)


class PublicHomepageView(View):
    def get(self, request, project_slug, *args, **kwargs):
        project = get_object_or_404(
            Project,
            slug=project_slug,
            is_published=True
        )

        page = get_object_or_404(
            Page,
            project=project,
            is_homepage=True,
            is_published=True
        )

        render_elements = build_render_elements(page.layout or {})

        context = {
            'project': project,
            'page': page,
            'render_elements': render_elements,
            'is_preview': False,
        }
        return render(request, 'publishing/rendered_page.html', context)


class PublicPageView(View):
    def get(self, request, project_slug, page_slug, *args, **kwargs):
        project = get_object_or_404(
            Project,
            slug=project_slug,
            is_published=True
        )

        page = get_object_or_404(
            Page,
            project=project,
            slug=page_slug,
            is_published=True
        )

        render_elements = build_render_elements(page.layout or {})

        context = {
            'project': project,
            'page': page,
            'render_elements': render_elements,
            'is_preview': False,
        }
        return render(request, 'publishing/rendered_page.html', context)