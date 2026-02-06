from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    voiture_info = serializers.CharField(
        source="voiture.matricule",
        read_only=True
    )

    class Meta:
        model = Reservation
        fields = "__all__"
