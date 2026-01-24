from django.db import models
from voitures.models import Voiture

class Reservation(models.Model):
    client = models.CharField(max_length=100)
    voiture = models.ForeignKey(Voiture, on_delete=models.CASCADE)
    date_debut = models.DateField()
    date_fin = models.DateField()
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20)

    def __str__(self):
        return self.client
