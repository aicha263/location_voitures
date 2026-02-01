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
        statut = data.get("statut")
        prix = data.get("prix_jour")

        if statut == "maintenance":
            data["prix_jour"] = None

        if statut in ["disponible", "louee"] and prix is None:
            raise serializers.ValidationError(
                "Le prix de jour est obligatoire si la voiture est disponible ou louée"
            )

        return data
