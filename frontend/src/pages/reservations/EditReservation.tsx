import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createReservation } from "../../services/reservationService";
import { getVoitures } from "../../services/voitureService";
import { FaTimes } from "react-icons/fa";
import type { ReservationCreate } from "../../types/Reservation";

type Voiture = {
  id: number;
  matricule: string;
  prix_jour: number | null;
  kilometrage: number;
  statut: string;
};

type ReservationForm = {
  voiture: string; // stocke juste l'ID
  nom_client: string;
  telephone: string;
  nni?: string;
  date_debut: string;
  heure_debut: string;
  date_fin: string;
  heure_fin: string;
};

export default function CreateReservation() {
  const navigate = useNavigate();

  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [selectedVoiture, setSelectedVoiture] = useState<Voiture | null>(null);

  const [form, setForm] = useState<ReservationForm>({
    voiture: "",
    nom_client: "",
    telephone: "",
    nni: "",
    date_debut: "",
    heure_debut: "",
    date_fin: "",
    heure_fin: "",
  });

  // Charger les voitures
  useEffect(() => {
    getVoitures().then((data) => {
      setVoitures(data.filter((v) => v.statut === "disponible"));
    });
  }, []);

  // Mettre à jour la voiture sélectionnée
  useEffect(() => {
    const voiture = voitures.find((v) => v.id === Number(form.voiture)) || null;
    setSelectedVoiture(voiture);
  }, [form.voiture, voitures]);

  // Gestion du formulaire
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Validation téléphone
    if (name === "telephone" && !/^\d*$/.test(value)) return;

    setForm({ ...form, [name]: value });
  };

  // Soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Vérification téléphone
    if (!/^([234])\d{7}$/.test(form.telephone)) {
      alert("Le téléphone doit commencer par 2, 3 ou 4 et contenir 8 chiffres.");
      return;
    }

    // Vérification dates
    const today = new Date();
    const debut = new Date(`${form.date_debut}T${form.heure_debut}`);
    const fin = new Date(`${form.date_fin}T${form.heure_fin}`);

    if (debut < today) {
      alert("La réservation ne peut pas commencer dans le passé.");
      return;
    }

    if (fin <= debut) {
      alert("La date de fin doit être après la date de début.");
      return;
    }

    // Préparer le payload pour l'API
    const payload: ReservationCreate = {
      voiture_id: Number(form.voiture),
      nom_client: form.nom_client,
      telephone: form.telephone,
      nni: form.nni,
      date_debut: `${form.date_debut}T${form.heure_debut}:00`,
      date_fin: `${form.date_fin}T${form.heure_fin}:00`,
    };

    try {
      await createReservation(payload);
      navigate("/reservations");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création de la réservation");
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="create-reservation-page">
      <div className="form-card">
        <h2>Nouvelle réservation</h2>
        <form onSubmit={handleSubmit} className="reservation-form">
          {/* Voiture */}
          <div className="form-group">
            <label>Voiture (Matricule)</label>
            <select name="voiture" value={form.voiture} onChange={handleChange} required>
              <option value="">-- Choisir une voiture --</option>
              {voitures.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.matricule}
                </option>
              ))}
            </select>
          </div>

          {/* Infos voiture readonly */}
          {selectedVoiture && (
            <div className="form-row">
              <div className="form-group">
                <label>Prix / jour</label>
                <input type="text" value={`${selectedVoiture.prix_jour ?? "-"} MRU`} readOnly />
              </div>
              <div className="form-group">
                <label>Kilométrage</label>
                <input type="text" value={`${selectedVoiture.kilometrage} km`} readOnly />
              </div>
            </div>
          )}

          {/* Nom client */}
          <div className="form-group">
            <label>Nom du client</label>
            <input name="nom_client" value={form.nom_client} onChange={handleChange} required />
          </div>

          {/* Téléphone */}
          <div className="form-group">
            <label>Téléphone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange} required />
            <small>Doit commencer par 2, 3 ou 4 et contenir 8 chiffres</small>
          </div>

          {/* NNI */}
          <div className="form-group">
            <label>NNI</label>
            <input name="nni" value={form.nni} onChange={handleChange} maxLength={10} />
          </div>

          {/* Date et heure */}
          <div className="form-row">
            <div className="form-group">
              <label>Date début</label>
              <input type="date" name="date_debut" value={form.date_debut} min={today} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Heure début</label>
              <input type="time" name="heure_debut" value={form.heure_debut} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date fin</label>
              <input type="date" name="date_fin" value={form.date_fin} min={form.date_debut || today} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Heure fin</label>
              <input type="time" name="heure_fin" value={form.heure_fin} onChange={handleChange} required />
            </div>
          </div>

          {/* Boutons */}
          <div className="form-actions">
            <button type="submit" className="btn-submit">Réserver</button>
            <button type="button" className="btn-cancel" onClick={() => navigate("/reservations")}>
              <FaTimes /> Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
