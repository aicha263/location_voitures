from django.core.exceptions import ValidationError
from django.db import models

from reservations.models import Reservation
from voitures.models import Voiture


class Transaction(models.Model):
    TYPE_CHOICES = [
        ("revenu", "Revenu"),
        ("depense", "Depense"),
    ]

    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.SET_NULL,
        related_name="transactions",
        null=True,
        blank=True,
    )
    voiture = models.ForeignKey(
        Voiture,
        on_delete=models.SET_NULL,
        related_name="transactions",
        null=True,
        blank=True,
    )

    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, default="")
    date = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.montant is not None and self.montant <= 0:
            raise ValidationError("Le montant doit etre superieur a 0.")

        if self.reservation:
            reservation_voiture_id = self.reservation.voiture_id
            if self.voiture_id and self.voiture_id != reservation_voiture_id:
                raise ValidationError(
                    "La voiture de la transaction doit correspondre a la voiture de la reservation."
                )

            if not self.voiture_id:
                self.voiture_id = reservation_voiture_id

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.reservation_id:
            return f"{self.type} - Reservation #{self.reservation_id} - {self.montant}"
        return f"{self.type} - {self.montant}"
