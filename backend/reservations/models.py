from django.db import models
from django.core.exceptions import ValidationError
from datetime import date
from voitures.models import Voiture  # أو from voitures.models import Voiture

class Reservation(models.Model):
    voiture = models.ForeignKey(
        Voiture,
        on_delete=models.CASCADE,
        related_name="reservations"
    )

    nni = models.CharField(max_length=10, blank=True, null=True)
    nom_client = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20)

    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()

    prix_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # Vérifier si une voiture est sélectionnée
        if self.voiture is None:
            raise ValidationError("La voiture doit être sélectionnée.")

        # Vérifier disponibilité
        if self.voiture.statut != 'disponible' and not self.pk:
            raise ValidationError("Cette voiture n'est pas disponible.")

        # Vérifier dates
        if self.date_fin < self.date_debut:
            raise ValidationError("La date de fin doit être après la date de début.")

        # Vérifier chevauchement avec d'autres réservations
        if self.__class__.objects.filter(
            voiture=self.voiture,
            date_fin__gte=self.date_debut,
            date_debut__lte=self.date_fin
        ).exclude(pk=self.pk).exists():
            raise ValidationError("Cette voiture est déjà réservée sur cette période.")
        






    def save(self, *args, **kwargs):
        self.clean()

        # calcul nombre de jours
        nb_jours = (self.date_fin - self.date_debut).days + 1

        if self.voiture.prix_jour:
            self.prix_total = nb_jours * self.voiture.prix_jour

        super().save(*args, **kwargs)

        # mettre la voiture en statut louée (une seule fois)
        if self.voiture.statut == 'disponible':
            self.voiture.statut = 'louee'
            self.voiture.save()

    def __str__(self):
        return f"{self.nom_client} - {self.voiture.matricule}"
