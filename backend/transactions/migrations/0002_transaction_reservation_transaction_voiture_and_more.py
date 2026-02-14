from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("reservations", "0003_alter_reservation_date_debut_and_more"),
        ("transactions", "0001_initial"),
        ("voitures", "0004_alter_voiture_statut"),
    ]

    operations = [
        migrations.AddField(
            model_name="transaction",
            name="reservation",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="transactions",
                to="reservations.reservation",
            ),
        ),
        migrations.AddField(
            model_name="transaction",
            name="voiture",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="transactions",
                to="voitures.voiture",
            ),
        ),
        migrations.AlterField(
            model_name="transaction",
            name="date",
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name="transaction",
            name="description",
            field=models.TextField(blank=True, default=""),
        ),
    ]
