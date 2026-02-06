from django.urls import path
from .views import reservation_list_api, reservation_detail_api

urlpatterns = [
    path('', reservation_list_api),
    path('<int:pk>/', reservation_detail_api),
]
