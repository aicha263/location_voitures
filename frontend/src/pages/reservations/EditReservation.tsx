import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

import {
  getReservation,
  updateReservation,
} from "../../services/reservationService";
import { getVoitures } from "../../services/voitureService";

import type { ReservationCreate } from "../../types/Reservation";
import type { Voiture } from "../../types/Voiture";

export default function EditReservation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [selectedVoiture, setSelectedVoiture] = useState<Voiture | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    voiture: "",
    nom_client: "",
    telephone: "",
    nni: "",
    date_debut: "",
    heure_debut: "",
    date_fin: "",
    heure_fin: "",
  });

  /* 🔹 Charger voitures + réservation */
  useEffect(() => {
    async function loadData() {
      try {
        const voituresData = await getVoitures();
        setVoitures(voituresData);

        const reservation = await getReservation(Number(id));

        setForm({
          voiture: String(reservation.voiture.id),
          nom_client: reservation.nom_client,
          telephone: reservation.telephone,
          nni: reservation.nni ?? "",
          date_debut: reservation.date_debut.slice(0, 10),
          heure_debut: reservation.date_debut.slice(11, 16),
          date_fin: reservation.date_fin.slice(0, 10),
          heure_fin: reservation.date_fin.slice(11, 16),
        });
      } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  /* 🔹 Voiture sélectionnée */
  useEffect(() => {
    const voiture =
      voitures.find((v) => v.id === Number(form.voiture)) || null;
    setSelectedVoiture(voiture);
  }, [form.voiture, voitures]);

  /* 🔹 Gestion des champs */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  /* 🔹 Label statut voiture */
  const getVoitureStatusLabel = (statut: string) => {
    if (statut === "disponible") return "";
    if (statut === "maintenance") return "Indisponible (maintenance)";
    if (statut === "louee") return "Indisponible (louée)";
    return "Indisponible";
  };

  /* 🔹 Soumission */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload: ReservationCreate = {
      voiture_id: Number(form.voiture),
      nom_client: form.nom_client,
      telephone: form.telephone,
      nni: form.nni || undefined,
      date_debut: `${form.date_debut}T${form.heure_debut}:00`,
      date_fin: `${form.date_fin}T${form.heure_fin}:00`,
    };

    try {
      await updateReservation(Number(id), payload);
      navigate("/reservations");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification");
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Chargement...</p>;
  }

  return (
    <div className="create-reservation-page">
      <div className="form-card">
        <h2>Modifier la réservation</h2>

        <form onSubmit={handleSubmit} className="reservation-form">
          {/* 🔹 Sélection voiture */}
          <div className="form-group">
            <label>Voiture</label>
            <select
              name="voiture"
              value={form.voiture}
              onChange={handleChange}
              required
            >
              <option value="">-- Choisir une voiture --</option>

              {voitures.map((v) => {
                const isCurrent =
                  v.id === Number(form.voiture);

                const disabled =
                  v.statut !== "disponible" && !isCurrent;

                return (
                  <option
                    key={v.id}
                    value={v.id}
                    disabled={disabled}
                    style={{
                      color: disabled ? "#6c757d" : "inherit",
                    }}
                  >
                    {v.matricule} {getVoitureStatusLabel(v.statut)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 🔹 Infos voiture */}
          {selectedVoiture && (
            <div className="form-row">
              <div className="form-group">
                <label>Prix / jour</label>
                <input
                  type="text"
                  value={selectedVoiture.prix_jour ?? "-"}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Kilométrage</label>
                <input
                  type="text"
                  value={selectedVoiture.kilometrage}
                  readOnly
                />
              </div>
            </div>
          )}

          {/* 🔹 Nom client */}
          <div className="form-group">
            <label>Nom du client</label>
            <input
              name="nom_client"
              value={form.nom_client}
              onChange={handleChange}
              required
            />
          </div>

          {/* 🔹 Téléphone */}
          <div className="form-group">
            <label>Téléphone</label>
            <input
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              required
            />
          </div>

          {/* 🔹 NNI */}
          <div className="form-group">
            <label>NNI</label>
            <input
              name="nni"
              value={form.nni}
              onChange={handleChange}
              maxLength={10}
            />
          </div>

          {/* 🔹 Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Date début</label>
              <input
                type="date"
                name="date_debut"
                value={form.date_debut}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Heure début</label>
              <input
                type="time"
                name="heure_debut"
                value={form.heure_debut}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date fin</label>
              <input
                type="date"
                name="date_fin"
                value={form.date_fin}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Heure fin</label>
              <input
                type="time"
                name="heure_fin"
                value={form.heure_fin}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 🔹 Boutons */}
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Modifier
            </button>

            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/reservations")}
            >
              <FaTimes /> Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
