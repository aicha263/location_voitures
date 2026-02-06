from rest_framework import viewsets
from .models import Voiture
from .serializers import VoitureSerializer

class VoitureViewSet(viewsets.ModelViewSet):
    queryset = Voiture.objects.filter(statut='disponible')
    serializer_class = VoitureSerializer
