from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "montant", "reservation", "voiture", "date")
    list_filter = ("type", "date")
    search_fields = ("description", "reservation__nom_client", "voiture__matricule")
