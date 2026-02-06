from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

from .models import Reservation
from voitures.models import Voiture
from .serializers import ReservationSerializer


# تنظيف الحجوزات المنتهية
def nettoyer_reservations_expirees():
    current_time = now()
    reservations_expirees = Reservation.objects.filter(date_fin__lte=current_time)

    for r in reservations_expirees:
        voiture = r.voiture
        voiture.statut = "disponible"
        voiture.save()
        r.delete()


@api_view(['GET', 'POST'])
def reservation_list_api(request):
    nettoyer_reservations_expirees()

    if request.method == 'GET':
        reservations = Reservation.objects.all().order_by('-id')
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = ReservationSerializer(data=request.data)
        if serializer.is_valid():
            reservation = serializer.save()

            voiture = reservation.voiture
            voiture.statut = "louee"
            voiture.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def reservation_detail_api(request, pk):
    nettoyer_reservations_expirees()

    reservation = get_object_or_404(Reservation, pk=pk)

    if request.method == 'GET':
        serializer = ReservationSerializer(reservation)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = ReservationSerializer(reservation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        voiture = reservation.voiture
        reservation.delete()

        voiture.statut = "disponible"
        voiture.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
