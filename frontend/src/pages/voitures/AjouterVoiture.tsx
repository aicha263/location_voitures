import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AjouterVoiture.css";

import {
  FaCar,
  FaTag,
  FaMoneyBillWave,
  FaRoad,
  FaPlus,
} from "react-icons/fa";

function AjouterVoiture() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    marque: "",
    modele: "",
    prix_jour: "",
    kilometrage: "",
    statut: "disponible",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch("http://127.0.0.1:8000/api/voitures/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    navigate("/voitures");
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <h2 className="form-title">🚗 Ajouter une voiture</h2>
      <p className="form-subtitle">
        Remplissez les informations de la voiture
      </p>

      {/* Marque */}
      <div className="input-group-custom">
        <label>Marque</label>
        <div className="input-group">
          <span className="input-group-text input-icon">
            <FaCar />
          </span>
          <input
            className="form-control"
            name="marque"
            placeholder="Ex: Toyota"
            value={form.marque}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Modèle */}
      <div className="input-group-custom">
        <label>Modèle</label>
        <div className="input-group">
          <span className="input-group-text input-icon">
            <FaTag />
          </span>
          <input
            className="form-control"
            name="modele"
            placeholder="Ex: Corolla"
            value={form.modele}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Prix */}
      <div className="input-group-custom">
        <label>Prix / jour</label>
        <div className="input-group">
          <span className="input-group-text input-icon">
            <FaMoneyBillWave />
          </span>
          <input
            type="number"
            className="form-control"
            name="prix_jour"
            placeholder="Ex: 5000"
            value={form.prix_jour}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Kilométrage */}
      <div className="input-group-custom">
        <label>Kilométrage</label>
        <div className="input-group">
          <span className="input-group-text input-icon">
            <FaRoad />
          </span>
          <input
            type="number"
            className="form-control"
            name="kilometrage"
            placeholder="Ex: 120000"
            value={form.kilometrage}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Statut */}
      <div className="input-group-custom">
        <label>Statut</label>
        <select
          className="form-select"
          name="statut"
          value={form.statut}
          onChange={handleChange}
        >
          <option value="disponible">Disponible</option>
          <option value="maintenance">Maintenance</option>
          <option value="louee">Louée</option>
        </select>
      </div>

      <button className="btn btn-success btn-submit">
        <FaPlus /> Ajouter la voiture
      </button>
    </form>
  );
}

export default AjouterVoiture;
