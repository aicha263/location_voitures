from rest_framework import serializers

from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    voiture_info = serializers.CharField(source="voiture.matricule", read_only=True)
    client_info = serializers.CharField(source="reservation.nom_client", read_only=True)

    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ("voiture",)

    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit etre superieur a 0.")
        return value

    def validate(self, data):
        reservation = data.get("reservation") or getattr(self.instance, "reservation", None)
        voiture = data.get("voiture") or getattr(self.instance, "voiture", None)

        if reservation and voiture and reservation.voiture_id != voiture.id:
            raise serializers.ValidationError(
                {
                    "voiture": "La voiture doit correspondre a la reservation selectionnee."
                }
            )

        if reservation and not data.get("voiture"):
            data["voiture"] = reservation.voiture

        return data
