from django.views import View
from django.shortcuts import render


class HomePageView(View):
    def get(self, request, *args, **kwargs):
        return render(request, 'core/home.html')