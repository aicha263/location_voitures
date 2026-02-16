from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal
from reservations.models import Reservation
from voitures.models import Voiture


class Transaction(models.Model):
    """
    Transaction model to manage all financial operations.
    
    Supports two types:
    - REVENU: Income from reservations or other sources
    - DEPENSE: Expenses with required category
    """
    
    TYPE_CHOICES = [
        ('REVENU', 'Revenue'),
        ('DEPENSE', 'Expense'),
    ]
    
    CATEGORIE_CHOICES = [
        ('ENTRETIEN', 'Maintenance'),
        ('ASSURANCE', 'Insurance'),
        ('REPARATION', 'Repair'),
        ('CARBURANT', 'Fuel'),
        ('AUTRE', 'Other'),
    ]
    
    # Primary Fields
    id = models.AutoField(primary_key=True)
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        help_text="Type of transaction: Income or Expense"
    )
    categorie = models.CharField(
        max_length=20,
        choices=CATEGORIE_CHOICES,
        null=True,
        blank=True,
        help_text="Category is required only for DEPENSE type"
    )
    
    # Amount and Details
    montant = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Transaction amount (must be positive)"
    )
    description = models.TextField(
        null=True,
        blank=True,
        help_text="Optional transaction description"
    )
    
    # Relationships
    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
        help_text="Associated reservation (if applicable)"
    )
    voiture = models.ForeignKey(
        Voiture,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
        help_text="Associated vehicle (if applicable)"
    )
    
    # Timestamps
    date = models.DateTimeField(
        auto_now_add=True,
        help_text="Transaction creation date"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Record creation timestamp"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Record last update timestamp"
    )
    
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['type', 'date']),
            models.Index(fields=['voiture', 'date']),
            models.Index(fields=['reservation']),
        ]
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
    
    def clean(self):
        """
        Validate business rules:
        1. If type=REVENU, categorie must be null
        2. If type=DEPENSE, categorie is required
        3. montant must be positive
        4. If linked to reservation, type must be REVENU
        """
        errors = {}
        
        # Validate montant is positive
        if self.montant is not None and self.montant <= 0:
            errors['montant'] = "Amount must be positive."
        
        # Validate type and categorie relationship
        if self.type == 'REVENU':
            if self.categorie is not None:
                errors['categorie'] = "Category must be null for REVENU type."
        elif self.type == 'DEPENSE':
            if not self.categorie:
                errors['categorie'] = "Category is required for DEPENSE type."
        
        # If linked to reservation, type must be REVENU
        if self.reservation and self.type != 'REVENU':
            errors['type'] = "Transactions linked to reservations must be REVENU type."
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Save with validation"""
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        montant_display = f"{self.montant} DA"
        if self.type == 'REVENU':
            return f"[REVENU] {montant_display} - {self.date.strftime('%Y-%m-%d')}"
        else:
            categorie_label = dict(self.CATEGORIE_CHOICES).get(self.categorie, self.categorie)
            return f"[DEPENSE-{categorie_label}] {montant_display} - {self.date.strftime('%Y-%m-%d')}"
    
    @property
    def type_display(self):
        """Return readable type label"""
        return dict(self.TYPE_CHOICES).get(self.type, self.type)
    
    @property
    def categorie_display(self):
        """Return readable categorie label"""
        if self.categorie:
            return dict(self.CATEGORIE_CHOICES).get(self.categorie, self.categorie)
        return None
