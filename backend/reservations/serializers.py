from rest_framework import serializers
from .models import Reservation
from voitures.serializers import VoitureSerializer  
from voitures.models import Voiture

class ReservationSerializer(serializers.ModelSerializer):
    
    # Pour l'affichage
    voiture = VoitureSerializer(read_only=True)
    # Pour la création/modification
    voiture_id = serializers.PrimaryKeyRelatedField(
        queryset=Voiture.objects.all(), write_only=True
    )

    class Meta:
        model = Reservation
        fields = "__all__"


    def create(self, validated_data):
        voiture = validated_data.pop('voiture_id')
        reservation = Reservation(**validated_data)
        reservation.voiture = voiture
        reservation.save()
        return reservation

    def update(self, instance, validated_data):
        if 'voiture_id' in validated_data:
            instance.voiture = validated_data.pop('voiture_id')
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance   
