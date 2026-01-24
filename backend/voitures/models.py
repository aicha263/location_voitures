from django.db import models

class Voiture(models.Model):
    STATUS_CHOICES = [
        ('disponible', 'Disponible'),
        ('louee', 'Louée'),
        ('maintenance', 'Maintenance'),
    ]

    marque = models.CharField(max_length=100)
    modele = models.CharField(max_length=100)
    prix_jour = models.DecimalField(max_digits=8, decimal_places=2)
    kilometrage = models.IntegerField()
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return f"{self.marque} {self.modele}"
