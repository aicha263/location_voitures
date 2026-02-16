from django.db.models.signals import post_save
from django.dispatch import receiver
from reservations.models import Reservation
from .models import Transaction


@receiver(post_save, sender=Reservation)
def create_revenue_transaction(sender, instance, created, **kwargs):
    """
    Signal handler to automatically create a REVENU transaction
    when a Reservation is created or updated with status CONFIRMED.
    
    This ensures financial tracking is automatic and synchronized
    with reservation creation.
    """
    if created:
        # Check if reservation has a prix_total
        if instance.prix_total and instance.prix_total > 0:
            # Check if transaction already exists for this reservation
            if not Transaction.objects.filter(reservation=instance).exists():
                Transaction.objects.create(
                    type='REVENU',
                    categorie=None,
                    montant=instance.prix_total,
                    reservation=instance,
                    voiture=instance.voiture,
                    description=f"Revenue from reservation: {instance.nom_client} - {instance.voiture.matricule}"
                )
