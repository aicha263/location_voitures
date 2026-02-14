from django.urls import path

from .views import transaction_detail_api, transaction_list_api

urlpatterns = [
    path("", transaction_list_api),
    path("<int:pk>/", transaction_detail_api),
]
