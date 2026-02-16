from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for Transaction model with custom validation
    and readable field labels.
    """
    
    # Related object details
    reservation_details = serializers.SerializerMethodField(read_only=True)
    voiture_details = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id',
            'type',
            'type_display',
            'categorie',
            'categorie_display',
            'montant',
            'description',
            'date',
            'reservation',
            'reservation_details',
            'voiture',
            'voiture_details',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'date',
            'created_at',
            'updated_at',
            'type_display',
            'categorie_display',
            'reservation_details',
            'voiture_details',
        ]
    
    def get_reservation_details(self, obj):
        """Return reservation details if linked"""
        if obj.reservation:
            return {
                'id': obj.reservation.id,
                'nom_client': obj.reservation.nom_client,
                'voiture': str(obj.reservation.voiture),
                'prix_total': str(obj.reservation.prix_total),
            }
        return None
    
    def get_voiture_details(self, obj):
        """Return vehicle details if linked"""
        if obj.voiture:
            return {
                'id': obj.voiture.id,
                'matricule': obj.voiture.matricule,
                'marque': obj.voiture.marque,
                'modele': obj.voiture.modele,
            }
        return None
    
    def validate_montant(self, value):
        """Validate that montant is positive"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value
    
    def validate(self, data):
        """
        Validate business rules:
        1. If type=REVENU, categorie must be null
        2. If type=DEPENSE, categorie is required
        3. If linked to reservation, type must be REVENU
        """
        type_val = data.get('type')
        categorie_val = data.get('categorie')
        reservation_val = data.get('reservation')
        
        # Check type and categorie relationship
        if type_val == 'REVENU':
            if categorie_val is not None:
                raise serializers.ValidationError({
                    'categorie': 'Category must be null for REVENU type.'
                })
        elif type_val == 'DEPENSE':
            if not categorie_val:
                raise serializers.ValidationError({
                    'categorie': 'Category is required for DEPENSE type.'
                })
        
        # If linked to reservation, type must be REVENU
        if reservation_val and type_val != 'REVENU':
            raise serializers.ValidationError({
                'type': 'Transactions linked to reservations must be REVENU type.'
            })
        
        return data
