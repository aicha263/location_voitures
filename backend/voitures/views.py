from django.shortcuts import render, redirect, get_object_or_404
from django.utils.timezone import now
from reservations.models import Reservation
from .models import Voiture
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import VoitureSerializer


@api_view(['GET', 'POST'])
def voiture_list_api(request):
    if request.method == 'GET':
        current_time = now()

        for r in Reservation.objects.all():
            if r.date_fin <= current_time:
                voiture = r.voiture
                voiture.statut = "disponible"
                voiture.save()

        voitures = Voiture.objects.all()
        serializer = VoitureSerializer(voitures, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = VoitureSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def voiture_detail_api(request, pk):
    voiture = get_object_or_404(Voiture, pk=pk)

    if request.method == 'GET':
        serializer = VoitureSerializer(voiture)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = VoitureSerializer(voiture, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        voiture.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

