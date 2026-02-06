from rest_framework import serializers
from .models import Voiture

class VoitureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voiture
        fields = "__all__"

    def validate_matricule(self, value):
        qs = Voiture.objects.filter(matricule=value)

        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(
                "Ce matricule est utilisé par une autre voiture."
            )

        return value

    def validate(self, data):
        statut = data.get("statut", self.instance.statut if self.instance else None)
        prix = data.get("prix_jour", self.instance.prix_jour if self.instance else None)

        if statut == "maintenance":
            data["prix_jour"] = None

        if statut in ["disponible", "louee"] and prix is None:
            raise serializers.ValidationError(
                "Le prix de jour est obligatoire si la voiture est disponible ou louée"
            )

        return data

    def validate_statutA(self, value):
        if self.instance is None and value == "louee":
            raise serializers.ValidationError(
                "Impossible de créer une voiture déjà louée."
            )
        return value
    
    def validate_statutM(self, value):
        if value == "louee":
            raise serializers.ValidationError(
                "Le statut 'louee' est géré automatiquement par les réservations."
            )
        return value

