from django.shortcuts import render, redirect, get_object_or_404
from .models import Voiture
from .forms import VoitureForm

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import VoitureSerializer


# def voiture_list(request):
#     voitures = Voiture.objects.all()
#     return render(request, 'voitures/voiture_list.html', {'voitures': voitures})

# def voiture_create(request):
#     form = VoitureForm(request.POST or None)
#     if form.is_valid():
#         form.save()
#         return redirect('voiture_list')
#     return render(request, 'voitures/voiture_form.html', {'form': form})

# def voiture_update(request, pk):
#     voiture = get_object_or_404(Voiture, pk=pk)
#     form = VoitureForm(request.POST or None, instance=voiture)
#     if form.is_valid():
#         form.save()
#         return redirect('voiture_list')
#     return render(request, 'voitures/voiture_form.html', {'form': form})

# def voiture_delete(request, pk):
#     voiture = get_object_or_404(Voiture, pk=pk)
#     if request.method == 'POST':
#         voiture.delete()
#         return redirect('voiture_list')
#     return render(request, 'voitures/voiture_delete.html', {'voiture': voiture})


@api_view(['GET', 'POST'])
def voiture_list_api(request):
    if request.method == 'GET':
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
