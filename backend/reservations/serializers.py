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

        # 1️⃣ Vérifier si la voiture est disponible
        if voiture.statut != "disponible":
            raise serializers.ValidationError("Cette voiture n'est pas disponible.")

        # 2️⃣ Créer la réservation
        reservation = Reservation(**validated_data)
        reservation.voiture = voiture
        reservation.save()

        # 3️⃣ Marquer la voiture comme louée
        voiture.statut = "louee"
        voiture.save()

        return reservation

    def update(self, instance, validated_data):
        if 'voiture_id' in validated_data:
            new_voiture = validated_data.pop('voiture_id')
            old_voiture = instance.voiture

            # Si la voiture a changé
            if old_voiture != new_voiture:
                # 1️⃣ Libérer l'ancienne voiture
                old_voiture.statut = "disponible"
                old_voiture.save()

                # 2️⃣ Vérifier que la nouvelle est disponible
                if new_voiture.statut != "disponible":
                    raise serializers.ValidationError("Cette voiture n'est pas disponible.")

                # 3️⃣ Louer la nouvelle voiture
                new_voiture.statut = "louee"
                new_voiture.save()

            instance.voiture = new_voiture

        # Mise à jour des autres champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
