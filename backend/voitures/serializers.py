from rest_framework import serializers
from .models import Voiture

class VoitureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voiture
        fields = '__all__'
