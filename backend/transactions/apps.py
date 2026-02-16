from django.apps import AppConfig


class TransactionsConfig(AppConfig):
    name = 'transactions'
    
    def ready(self):
        """Import signals when the app is ready"""
        import transactions.signals
