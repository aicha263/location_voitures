from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet

# Create a router and register the viewset
router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]
