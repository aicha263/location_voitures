import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { createReservation } from "../../services/reservationService";
import { getVoitures } from "../../services/voitureService";
import "./CreateReservation.css";
import { FaTimes } from "react-icons/fa";
import type { Voiture } from "../../types/Voiture";
import type { ReservationCreate } from "../../types/Reservation";

export default function CreateReservation() {

  const navigate = useNavigate();

  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [selectedVoiture, setSelectedVoiture] = useState<Voiture | null>(null);

  // Formulaire
  const [form, setForm] = useState({
    voiture: "",
    nom_client: "",
    telephone: "",
    nni: "",
    date_debut: "",
    date_fin: "",
    heure_debut: "",
    heure_fin: "",
  });

  // Charger les voitures
  useEffect(() => {
    getVoitures().then((data) => {
      setVoitures(data);
    });
  }, []);

  // Mettre à jour la voiture sélectionnée
  useEffect(() => {
    const voiture = voitures.find((v) => v.id === Number(form.voiture)) || null;
    setSelectedVoiture(voiture);
  }, [form.voiture, voitures]);

  // Validation téléphone : 8 chiffres, commence par 2, 3 ou 4
  const handleTelephoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[234]\d{0,7}$/.test(val) || val === "") {
      setForm({ ...form, telephone: val });
    }
  };

  // Validation NNI : 10 chiffres max
  const handleNniChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) {
      setForm({ ...form, nni: val });
    }
  };

  // Gestion des autres inputs
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Soumission formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.date_debut || !form.date_fin || !form.heure_debut || !form.heure_fin) {
      alert("Veuillez remplir toutes les dates et heures.");
      return;


    }

    const dateDebut = `${form.date_debut}T${form.heure_debut}:00`;
    const dateFin = `${form.date_fin}T${form.heure_fin}:00`;

    const payload: ReservationCreate = {
      voiture_id: Number(form.voiture),
      nom_client: form.nom_client,
      telephone: form.telephone,
      nni: form.nni,
      date_debut: dateDebut,
      date_fin: dateFin,
    };

    try {
      await createReservation(payload);
      navigate("/reservations");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la réservation");
    }

  };

  // Date minimale = aujourd’hui
  const today = new Date().toISOString().slice(0, 10);

  const getVoitureStatusLabel = (statut: string) => {
    if (statut === "disponible") return "";
    if (statut === "maintenance") return "Indisponible (en maintenance)";
    if (statut === "louee") return "Indisponible (déjà louée)";
    return "Indisponible";
  };


  return (
    <div className="create-reservation-page">
      <div className="form-card">
        <h2>Nouvelle réservation</h2>
        <form onSubmit={handleSubmit} className="reservation-form">

          {/* Sélection voiture */}
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
                  style={{ color: v.statut !== "disponible" ? "#6c757d" : "inherit" }}
                >
                  {v.matricule} {getVoitureStatusLabel(v.statut)}
                </option>

              ))}
            </select>

          </div>

          {/* Infos voiture readonly */}
          {selectedVoiture && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Marque</label>
                  <input
                    type="text"
                    value={selectedVoiture.marque}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Modèle</label>
                  <input
                    type="text"
                    value={selectedVoiture.modele}
                    readOnly
                  />
                </div>
              </div>

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
            </>
          )}


          {/* Nom client */}
          <div className="form-group">
            <label>Nom du client</label>
            <input
              type="text"
              name="nom_client"
              value={form.nom_client}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <div style={{ display: "flex" }}>
              <span
                style={{
                  background: "#e5e7eb",
                  padding: "10px",
                  borderRadius: "8px 0 0 8px",
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                }}
              >
                +222
              </span>
              <input
                type="text"
                name="telephone"
                value={form.telephone}
                onChange={handleTelephoneChange}
                required
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "0 8px 8px 0",
                  border: "1px solid #e5e7eb",
                  borderLeft: "none",
                }}
                placeholder="XXXXXXXX"
              />
            </div>
            <small>8 chiffres, commence par 2, 3 ou 4</small>
          </div>


          {/* NNI */}
          <div className="form-group">
            <label>NNI</label>
            <div style={{ display: "flex", gap: "5px" }}>

              <input
                type="text"
                name="nni"
                value={form.nni}
                onChange={handleNniChange}
                placeholder="XXXXXXXXXX"
                style={{ flex: 1, borderRadius: "0 8px 8px 0", border: "1px solid #e5e7eb", padding: "10px" }}
                required
              />
            </div>
            <small>10 chiffres </small>
          </div>

          {/* Date début / Date fin */}
          <div className="form-row">
            <div className="form-group">
              <label>Date début</label>
              <input
                type="date"
                name="date_debut"
                value={form.date_debut}
                min={today}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Date fin</label>
              <input
                type="date"
                name="date_fin"
                value={form.date_fin}
                min={form.date_debut || today}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Heure début / Heure fin */}
          <div className="form-row">
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

          {/* Boutons */}
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
