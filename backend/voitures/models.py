from django.db import models

class Voiture(models.Model):
    STATUS_CHOICES = [
        ('disponible', 'Disponible'),
        ('louee', 'Louée'),
        ('maintenance', 'Maintenance'),
    ]

    matricule = models.CharField(max_length=20, unique=True)
    marque = models.CharField(max_length=100)
    modele = models.CharField(max_length=100)

    prix_jour = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )

    kilometrage = models.IntegerField()
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default="disponible")

    def __str__(self):
        return f"{self.matricule} {self.marque}"
