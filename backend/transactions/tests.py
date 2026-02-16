from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import datetime, timedelta

from .models import Transaction
from voitures.models import Voiture
from reservations.models import Reservation


class TransactionModelTest(TestCase):
    """Test Transaction model validation and business rules"""
    
    def setUp(self):
        """Set up test data"""
        self.voiture = Voiture.objects.create(
            matricule='AA123456',
            marque='Toyota',
            modele='Corolla',
            prix_jour=Decimal('150.00'),
            kilometrage=45000,
            statut='disponible'
        )
        
        self.reservation = Reservation.objects.create(
            voiture=self.voiture,
            nom_client='Ali Smaïl',
            telephone='0555123456',
            date_debut=datetime.now(),
            date_fin=datetime.now() + timedelta(days=3),
            prix_total=Decimal('450.00')
        )
    
    def test_create_revenue_transaction(self):
        """Test creating a REVENU transaction"""
        transaction = Transaction.objects.create(
            type='REVENU',
            montant=Decimal('1500.00'),
            reservation=self.reservation,
            voiture=self.voiture
        )
        
        self.assertEqual(transaction.type, 'REVENU')
        self.assertEqual(transaction.montant, Decimal('1500.00'))
        self.assertIsNone(transaction.categorie)
        self.assertEqual(transaction.reservation, self.reservation)
    
    def test_create_expense_transaction(self):
        """Test creating a DEPENSE transaction"""
        transaction = Transaction.objects.create(
            type='DEPENSE',
            categorie='CARBURANT',
            montant=Decimal('250.00'),
            voiture=self.voiture,
            description='Fuel for vehicle'
        )
        
        self.assertEqual(transaction.type, 'DEPENSE')
        self.assertEqual(transaction.categorie, 'CARBURANT')
        self.assertEqual(transaction.montant, Decimal('250.00'))
    
    def test_revenue_cannot_have_category(self):
        """Test that REVENU type cannot have category"""
        with self.assertRaises(ValidationError):
            transaction = Transaction(
                type='REVENU',
                categorie='ENTRETIEN',
                montant=Decimal('1000.00')
            )
            transaction.clean()
    
    def test_expense_requires_category(self):
        """Test that DEPENSE type requires category"""
        with self.assertRaises(ValidationError):
            transaction = Transaction(
                type='DEPENSE',
                montant=Decimal('250.00')
            )
            transaction.clean()
    
    def test_montant_must_be_positive(self):
        """Test that montant must be positive"""
        with self.assertRaises(ValidationError):
            transaction = Transaction(
                type='REVENU',
                montant=Decimal('-100.00')
            )
            transaction.clean()
    
    def test_reservation_transaction_must_be_revenue(self):
        """Test that reservation-linked transaction must be REVENU"""
        with self.assertRaises(ValidationError):
            transaction = Transaction(
                type='DEPENSE',
                categorie='CARBURANT',
                montant=Decimal('100.00'),
                reservation=self.reservation
            )
            transaction.clean()
    
    def test_montant_zero_invalid(self):
        """Test that montant cannot be zero"""
        with self.assertRaises(ValidationError):
            transaction = Transaction(
                type='REVENU',
                montant=Decimal('0.00')
            )
            transaction.clean()


class TransactionSerializerTest(APITestCase):
    """Test Transaction serializer validation"""
    
    def setUp(self):
        """Set up test data"""
        self.voiture = Voiture.objects.create(
            matricule='BB654321',
            marque='Renault',
            modele='Dacia',
            prix_jour=Decimal('100.00'),
            kilometrage=50000,
            statut='disponible'
        )
    
    def test_serialize_revenue_transaction(self):
        """Test serializing a revenue transaction"""
        from .serializers import TransactionSerializer
        
        transaction = Transaction.objects.create(
            type='REVENU',
            montant=Decimal('1500.00'),
            voiture=self.voiture
        )
        
        serializer = TransactionSerializer(transaction)
        data = serializer.data
        
        self.assertEqual(data['type'], 'REVENU')
        self.assertEqual(data['type_display'], 'Revenue')
        self.assertEqual(data['montant'], '1500.00')
        self.assertIsNone(data['categorie_display'])
    
    def test_serialize_expense_transaction(self):
        """Test serializing an expense transaction"""
        from .serializers import TransactionSerializer
        
        transaction = Transaction.objects.create(
            type='DEPENSE',
            categorie='ENTRETIEN',
            montant=Decimal('500.00'),
            voiture=self.voiture,
            description='Maintenance work'
        )
        
        serializer = TransactionSerializer(transaction)
        data = serializer.data
        
        self.assertEqual(data['type'], 'DEPENSE')
        self.assertEqual(data['categorie_display'], 'Maintenance')
        self.assertEqual(data['montant'], '500.00')


class TransactionAPITest(APITestCase):
    """Test Transaction API endpoints"""
    
    def setUp(self):
        """Set up test data and client"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='admin',
            password='adminpass123',
            email='admin@test.com'
        )
        
        # Create test vehicle
        self.voiture = Voiture.objects.create(
            matricule='CC111111',
            marque='BMW',
            modele='X5',
            prix_jour=Decimal('200.00'),
            kilometrage=30000,
            statut='disponible'
        )
        
        # Create test reservation
        self.reservation = Reservation.objects.create(
            voiture=self.voiture,
            nom_client='Test Client',
            telephone='0666666666',
            date_debut=datetime.now(),
            date_fin=datetime.now() + timedelta(days=2),
            prix_total=Decimal('400.00')
        )
    
    def test_list_transactions_requires_auth(self):
        """Test that listing requires authentication"""
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_transactions(self):
        """Test listing transactions"""
        self.client.force_authenticate(user=self.user)
        
        Transaction.objects.create(
            type='REVENU',
            montant=Decimal('1000.00'),
            voiture=self.voiture
        )
        
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
    
    def test_create_transaction(self):
        """Test creating a transaction"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'type': 'DEPENSE',
            'categorie': 'CARBURANT',
            'montant': '150.00',
            'voiture': self.voiture.id,
            'description': 'Fuel expense'
        }
        
        response = self.client.post('/api/transactions/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.count(), 1)
    
    def test_create_transaction_validation(self):
        """Test transaction creation validation"""
        self.client.force_authenticate(user=self.user)
        
        # Missing category for DEPENSE
        data = {
            'type': 'DEPENSE',
            'montant': '150.00'
        }
        
        response = self.client.post('/api/transactions/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_delete_requires_admin(self):
        """Test that delete requires admin permission"""
        transaction = Transaction.objects.create(
            type='REVENU',
            montant=Decimal('1000.00'),
            voiture=self.voiture
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/transactions/{transaction.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_delete(self):
        """Test that admin can delete"""
        transaction = Transaction.objects.create(
            type='REVENU',
            montant=Decimal('1000.00'),
            voiture=self.voiture
        )
        
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/transactions/{transaction.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_summary_endpoint(self):
        """Test financial summary endpoint"""
        self.client.force_authenticate(user=self.user)
        
        Transaction.objects.create(
            type='REVENU',
            montant=Decimal('5000.00'),
            voiture=self.voiture
        )
        
        Transaction.objects.create(
            type='DEPENSE',
            categorie='ENTRETIEN',
            montant=Decimal('1000.00'),
            voiture=self.voiture
        )
        
        response = self.client.get('/api/transactions/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(float(data['total_revenu']), 5000.0)
        self.assertEqual(float(data['total_depense']), 1000.0)
        self.assertEqual(float(data['profit']), 4000.0)
    
    def test_monthly_stats_endpoint(self):
        """Test monthly statistics endpoint"""
        self.client.force_authenticate(user=self.user)
        
        Transaction.objects.create(
            type='REVENU',
            montant=Decimal('3000.00'),
            voiture=self.voiture
        )
        
        response = self.client.get('/api/transactions/monthly-stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertGreater(len(data['monthly_stats']), 0)
    
    def test_by_voiture_endpoint(self):
        """Test transactions by vehicle endpoint"""
        self.client.force_authenticate(user=self.user)
        
        Transaction.objects.create(
            type='REVENU',
            montant=Decimal('2000.00'),
            voiture=self.voiture
        )
        
        response = self.client.get(f'/api/transactions/by-voiture/{self.voiture.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['voiture_id'], str(self.voiture.id))
        self.assertEqual(len(data['transactions']), 1)
