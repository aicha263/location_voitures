from django.urls import path
from . import views
from .views import voiture_list_api, voiture_detail_api

urlpatterns = [
#     path('', views.voiture_list, name='voiture_list'),
#     path('add/', views.voiture_create, name='voiture_add'),
#     path('edit/<int:pk>/', views.voiture_update, name='voiture_edit'),
#     path('delete/<int:pk>/', views.voiture_delete, name='voiture_delete'),
    
    path('', voiture_list_api),
    path('<int:pk>/', voiture_detail_api),
]
