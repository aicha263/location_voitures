import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Reservation } from "../../types/Reservation";
import { createReservation } from "../../services/reservationService";
import { getVoitures } from "../../services/voitureService";
import "./CreateReservation.css";
import { FaTimes } from "react-icons/fa";

type Voiture = {
  id: number;
  matricule: string;
  statut: string;
};


export default function CreateReservation() {
  const navigate = useNavigate();

  const [voitures, setVoitures] = useState<Voiture[]>([]);

  const [form, setForm] = useState<Reservation>({
    id: 0,
    voiture: "",
    nom_client: "",
    telephone: "",
    date_debut: "",
    date_fin: "",
  });


  useEffect(() => {
  getVoitures().then((data) => {
    console.log("VOITURES FROM API:", data);
    setVoitures(data);
  });
}, []);


  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value, 
    });
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formatDate = (d: string) =>
      d.length === 16 ? `${d}:00` : d;

    await createReservation({
      ...form,
      voiture: Number(form.voiture),
      date_debut: formatDate(form.date_debut),
      date_fin: formatDate(form.date_fin),
    });

    navigate("/reservations");
  };


  return (
    <div className="create-reservation-page">
      <div className="form-card">
        <h2>Nouvelle réservation</h2>

        <form onSubmit={handleSubmit} className="reservation-form">
          {/* ✅ MATRICULE AU LIEU DE ID */}
          <div className="form-group">
            <label>Voiture (Matricule)</label>
            <select
              name="voiture"
              value={form.voiture}
              onChange={handleChange}
              required
            >
              <option value="">-- Choisir une voiture --</option>

              {voitures.map((v) => (
                <option
                  key={v.id}
                  value={v.id}
                  disabled={v.statut !== "disponible"}
                >
                  {v.matricule}
                  {v.statut !== "disponible" && " (Indisponible)"}
                </option>
              ))}
            </select>

          </div>


          <div className="form-group">
            <label>Nom du client</label>
            <input
              type="text"
              name="nom_client"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="text"
              name="telephone"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date début</label>
              <input
                type="datetime-local"
                name="date_debut"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date fin</label>
              <input
                type="datetime-local"
                name="date_fin"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Réserver
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
