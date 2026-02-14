from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Transaction
from .serializers import TransactionSerializer


@api_view(["GET", "POST"])
def transaction_list_api(request):
    if request.method == "GET":
        transactions = Transaction.objects.all().order_by("-id")
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    serializer = TransactionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
def transaction_detail_api(request, pk):
    transaction = get_object_or_404(Transaction, pk=pk)

    if request.method == "GET":
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)

    if request.method == "PUT":
        serializer = TransactionSerializer(transaction, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    transaction.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
