from django import forms

from .models import Transaction


class TransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = ["type", "montant", "reservation", "voiture", "description"]
        widgets = {
            "type": forms.Select(attrs={"class": "form-select"}),
            "montant": forms.NumberInput(attrs={"class": "form-control", "step": "0.01"}),
            "reservation": forms.Select(attrs={"class": "form-select"}),
            "voiture": forms.Select(attrs={"class": "form-select"}),
            "description": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
        }
