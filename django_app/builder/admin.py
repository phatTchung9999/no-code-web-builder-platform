from django.contrib import admin
from .models import Page


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'project', 'is_homepage', 'updated_at']
    search_fields = ['name', 'slug', 'project__name']
    list_filter = ['is_homepage', 'created_at', 'updated_at']