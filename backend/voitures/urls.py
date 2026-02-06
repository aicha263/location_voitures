from django.urls import path
from . import views
from .views import voiture_list_api, voiture_detail_api

urlpatterns = [
    
    path('', voiture_list_api),
    path('<int:pk>/', voiture_detail_api),
]
