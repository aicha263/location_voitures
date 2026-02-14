from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("core.urls")),
    path("api/voitures/", include("voitures.urls")),
    path("api/reservations/", include("reservations.urls")),
    path("api/transactions/", include("transactions.urls")),
]
