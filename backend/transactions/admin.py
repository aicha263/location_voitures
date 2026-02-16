from django.contrib import admin
from django.db.models import Sum, Q
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """
    Admin interface for Transaction model with filtering, search, and display options.
    """
    
    list_display = (
        'id',
        'type',
        'categorie_display',
        'montant_display',
        'reservation_link',
        'voiture_link',
        'date_formatted',
    )
    
    list_filter = (
        'type',
        'categorie',
        'date',
        'voiture',
    )
    
    search_fields = (
        'description',
        'reservation__nom_client',
        'voiture__matricule',
    )
    
    readonly_fields = (
        'id',
        'date',
        'created_at',
        'updated_at',
        'type_display',
        'categorie_display',
        'reservation_details',
        'voiture_details',
        'financial_summary',
    )
    
    fieldsets = (
        ('Transaction Information', {
            'fields': (
                'id',
                'type',
                'type_display',
                'montant',
            )
        }),
        ('Category (for Expenses)', {
            'fields': (
                'categorie',
                'categorie_display',
            ),
            'classes': ('collapse',)
        }),
        ('Related Objects', {
            'fields': (
                'reservation',
                'reservation_details',
                'voiture',
                'voiture_details',
            ),
            'classes': ('collapse',)
        }),
        ('Description', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': (
                'date',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ('-date',)
    date_hierarchy = 'date'
    
    def montant_display(self, obj):
        """Display montant with currency and formatting"""
        return f"{obj.montant} DA"
    montant_display.short_description = 'Amount'
    
    def type_display(self, obj):
        """Display readable type label"""
        return obj.type_display
    
    def categorie_display(self, obj):
        """Display readable categorie label"""
        if obj.categorie:
            return obj.categorie_display
        return '—'
    categorie_display.short_description = 'Category'
    
    def date_formatted(self, obj):
        """Display date in readable format"""
        return obj.date.strftime('%Y-%m-%d %H:%M')
    date_formatted.short_description = 'Date'
    
    def reservation_link(self, obj):
        """Display reservation with client name"""
        if obj.reservation:
            return f"{obj.reservation.nom_client}"
        return '—'
    reservation_link.short_description = 'Reservation'
    
    def voiture_link(self, obj):
        """Display vehicle info"""
        if obj.voiture:
            return f"{obj.voiture.matricule}"
        return '—'
    voiture_link.short_description = 'Vehicle'
    
    def reservation_details(self, obj):
        """Display full reservation details in readonly field"""
        if obj.reservation:
            res = obj.reservation
            return f"""
            Client: {res.nom_client}
            Vehicle: {res.voiture.matricule}
            Price: {res.prix_total} DA
            """
        return 'Not linked'
    reservation_details.short_description = 'Reservation Details'
    
    def voiture_details(self, obj):
        """Display full vehicle details in readonly field"""
        if obj.voiture:
            v = obj.voiture
            return f"""
            Matricule: {v.matricule}
            Marque: {v.marque}
            Modèle: {v.modele}
            """
        return 'Not linked'
    voiture_details.short_description = 'Vehicle Details'
    
    def financial_summary(self, obj):
        """Display financial summary"""
        total_revenu = Transaction.objects.filter(type='REVENU').aggregate(
            total=Sum('montant')
        )['total'] or 0
        total_depense = Transaction.objects.filter(type='DEPENSE').aggregate(
            total=Sum('montant')
        )['total'] or 0
        profit = total_revenu - total_depense
        
        return f"""
        Total Revenue: {total_revenu} DA
        Total Expenses: {total_depense} DA
        Net Profit: {profit} DA
        """
    financial_summary.short_description = 'Financial Summary'
    
    def has_delete_permission(self, request):
        """Only superusers can delete transactions"""
        return request.user.is_superuser
