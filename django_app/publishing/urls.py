from django.urls import path
from .views import PreviewPageView, PublicHomepageView, PublicPageView

urlpatterns = [
    path('preview/<int:page_id>/', PreviewPageView.as_view(), name='preview-page'),
    path('site/<slug:project_slug>/', PublicHomepageView.as_view(), name='public-homepage'),
    path('site/<slug:project_slug>/<slug:page_slug>/', PublicPageView.as_view(), name='public-page'),
]