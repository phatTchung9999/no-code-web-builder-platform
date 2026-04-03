from django.urls import path
from .views import BuilderHomeView, DashboardView, PageCreateView, SavePageLayoutView

app_name = 'builder'

urlpatterns = [
    path('', BuilderHomeView.as_view(), name='builder_home'),
    path('<int:page_id>/', DashboardView.as_view(), name='builder_dashboard'),
    path('<int:page_id>/save/', SavePageLayoutView.as_view(), name='save_page_layout'),
    path('projects/<int:project_id>/pages/create/', PageCreateView.as_view(), name='page_create'),
]