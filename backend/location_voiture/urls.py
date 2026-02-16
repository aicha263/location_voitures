from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),                 # Dashboard
    path('api/voitures/', include('voitures.urls')),# Voitures
    path('api/reservations/', include('reservations.urls')),  # Reservations
    path('api/', include('transactions.urls')),  # Transactions
]
