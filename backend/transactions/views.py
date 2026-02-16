from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.request import Request
from django.core.exceptions import ValidationError
from django.db.models import Sum, Q
from django.utils.dateparse import parse_date
from datetime import datetime, timedelta
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Transaction CRUD operations with custom actions for analytics.
    
    Endpoints:
    - GET /transactions/ - List all transactions
    - POST /transactions/ - Create transaction
    - GET /transactions/{id}/ - Retrieve transaction
    - PATCH /transactions/{id}/ - Partial update
    - PUT /transactions/{id}/ - Full update
    - DELETE /transactions/{id}/ - Delete (Admin only)
    - GET /transactions/summary/ - Financial summary
    - GET /transactions/monthly-stats/ - Monthly statistics
    - GET /transactions/by-voiture/{voiture_id}/ - Transactions by vehicle
    """
    
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'reservation__nom_client']
    ordering_fields = ['date', 'montant', 'type']
    ordering = ['-date']
    
    def get_permissions(self):
        """
        Allow all operations for development.
        """
        permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter transactions based on query parameters.
        Optimize with select_related for better performance.
        """
        queryset = Transaction.objects.select_related(
            'reservation',
            'voiture'
        ).all()
        
        # Filter by type
        type_filter = self.request.query_params.get('type')
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        
        # Filter by category
        categorie_filter = self.request.query_params.get('categorie')
        if categorie_filter:
            queryset = queryset.filter(categorie=categorie_filter)
        
        # Filter by vehicle
        voiture_filter = self.request.query_params.get('voiture')
        if voiture_filter:
            queryset = queryset.filter(voiture_id=voiture_filter)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            try:
                from_date = parse_date(date_from)
                if from_date:
                    queryset = queryset.filter(date__date__gte=from_date)
            except (ValueError, TypeError):
                pass
        
        if date_to:
            try:
                to_date = parse_date(date_to)
                if to_date:
                    # Include entire day
                    queryset = queryset.filter(date__date__lte=to_date)
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def create(self, request: Request, *args, **kwargs):
        """
        Create a transaction with proper error handling for model validation.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            self.perform_create(serializer)
        except ValidationError as e:
            # Handle model validation errors
            error_dict = e.message_dict if hasattr(e, 'message_dict') else {'error': str(e)}
            return Response(
                error_dict,
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Handle any other exceptions
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request: Request, *args, **kwargs):
        """
        Update a transaction with proper error handling for model validation.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        try:
            self.perform_update(serializer)
        except ValidationError as e:
            # Handle model validation errors
            error_dict = e.message_dict if hasattr(e, 'message_dict') else {'error': str(e)}
            return Response(
                error_dict,
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Handle any other exceptions
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[AllowAny],
        url_path='summary'
    )
    def summary(self, request):
        """
        GET /transactions/summary/
        
        Returns financial summary:
        - total_revenu: Total revenue
        - total_depense: Total expenses
        - profit: Net profit (revenu - depense)
        - transaction_count: Total number of transactions
        """
        queryset = self.get_queryset()
        
        # Calculate totals
        totals = queryset.aggregate(
            total_revenu=Sum('montant', filter=Q(type='REVENU')),
            total_depense=Sum('montant', filter=Q(type='DEPENSE')),
        )
        
        total_revenu = totals['total_revenu'] or 0
        total_depense = totals['total_depense'] or 0
        profit = total_revenu - total_depense
        
        return Response({
            'total_revenu': float(total_revenu),
            'total_depense': float(total_depense),
            'profit': float(profit),
            'transaction_count': queryset.count(),
            'currency': 'MRU',
        })
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[AllowAny],
        url_path='monthly-stats'
    )
    def monthly_stats(self, request):
        """
        GET /transactions/monthly-stats/
        
        Returns transactions grouped by month with aggregations.
        """
        from django.db.models.functions import TruncMonth
        from django.db.models import Count
        
        queryset = self.get_queryset()
        
        # Group by month
        monthly_data = queryset.annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            total_revenu=Sum('montant', filter=Q(type='REVENU')),
            total_depense=Sum('montant', filter=Q(type='DEPENSE')),
            count=Count('id'),
        ).order_by('-month')
        
        # Format response
        stats = []
        for item in monthly_data:
            month_date = item['month']
            total_revenu = item['total_revenu'] or 0
            total_depense = item['total_depense'] or 0
            
            stats.append({
                'month': month_date.strftime('%Y-%m') if month_date else None,
                'total_revenu': float(total_revenu),
                'total_depense': float(total_depense),
                'profit': float(total_revenu - total_depense),
                'transaction_count': item['count'],
            })
        
        return Response({
            'monthly_stats': stats,
            'currency': 'MRU',
        })
    
    @action(
        detail=True,
        methods=['get'],
        permission_classes=[AllowAny],
        url_path='by-voiture/(?P<voiture_id>[^/.]+)',
        url_name='by-voiture'
    )
    def get_by_voiture(self, request, voiture_id=None):
        """
        GET /transactions/by-voiture/{voiture_id}/
        
        Returns all transactions for a specific vehicle with summary.
        """
        queryset = self.get_queryset().filter(voiture_id=voiture_id)
        
        if not queryset.exists():
            return Response(
                {'detail': 'No transactions found for this vehicle.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(queryset, many=True)
        
        # Calculate summary for this vehicle
        totals = queryset.aggregate(
            total_revenu=Sum('montant', filter=Q(type='REVENU')),
            total_depense=Sum('montant', filter=Q(type='DEPENSE')),
        )
        
        total_revenu = totals['total_revenu'] or 0
        total_depense = totals['total_depense'] or 0
        
        return Response({
            'voiture_id': voiture_id,
            'transactions': serializer.data,
            'summary': {
                'total_revenu': float(total_revenu),
                'total_depense': float(total_depense),
                'profit': float(total_revenu - total_depense),
                'transaction_count': queryset.count(),
            },
        })
