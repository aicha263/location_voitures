import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Reservation } from "../../types/Reservation";
import {
  getReservation,
  updateReservation,
} from "../../services/reservationService";
import { FaTimes } from "react-icons/fa";
import "./EditReservation.css";

export default function EditReservation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState<Reservation | null>(null);

    useEffect(() => {
        if (id) {
            getReservation(Number(id)).then(setForm);
        }
    }, [id]);

    if (!form) {
        return <p>Chargement...</p>;
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (id) {
            await updateReservation(Number(id), form);
        }
        navigate("/reservations");
    };

    return (
  <div className="create-reservation-page">
    <div className="form-card">
      <h2>Modifier réservation</h2>

      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-group">
          <label>Nom du client</label>
          <input
            name="nom_client"
            value={form.nom_client}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date début</label>
            <input
              type="date"
              name="date_debut"
              value={form.date_debut?.slice(0, 10)}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date fin</label>
            <input
              type="date"
              name="date_fin"
              value={form.date_fin?.slice(0, 10)}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Téléphone</label>
          <input
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            Enregistrer
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
