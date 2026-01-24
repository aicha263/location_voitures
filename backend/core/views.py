from django.shortcuts import render
from voitures.models import Voiture
from reservations.models import Reservation
from transactions.models import Transaction
from django.db.models import Sum

def dashboard(request):
    revenus = Transaction.objects.filter(type='revenu').aggregate(Sum('montant'))['montant__sum'] or 0
    depenses = Transaction.objects.filter(type='depense').aggregate(Sum('montant'))['montant__sum'] or 0

    context = {
        'revenus': revenus,
        'depenses': depenses,
        'profit': revenus - depenses,
        'total_voitures': Voiture.objects.count(),
        'reservations_mois': Reservation.objects.count(),
        'dernieres_reservations': Reservation.objects.all()[:5]
    }
    return render(request, 'core/dashboard.html', context)
