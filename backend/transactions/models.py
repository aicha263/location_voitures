from django.db import models

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('revenu', 'Revenu'),
        ('depense', 'Dépense'),
    ]

    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    date = models.DateField(auto_now_add=True)
