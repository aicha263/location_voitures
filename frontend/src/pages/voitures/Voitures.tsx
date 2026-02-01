import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Voiture } from "../../types/Voiture";
import "./Voitures.css";
import {
  FaCar,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";


function Voitures() {
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVoitures = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/voitures/")
      .then((res) => res.json())
      .then((data) => {
        setVoitures(data);
        setLoading(false);
      });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchVoitures();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="voitures-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <FaCar className="me-2 text-primary" />
            Liste des voitures
          </h2>
          <p className="page-subtitle">Gestion et suivi de votre flotte</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/voitures/ajouter")}
        >
          <FaPlus className="me-2" />
          Ajouter une voiture
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="card table-card">
        <div className="card-body">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Matricule</th>
                <th>Marque</th>
                <th>Modèle</th>
                <th>Prix / jour</th>
                <th>Kilométrage</th>
                <th>Statut</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {voitures.map((v) => (
                <tr key={v.id}>
                  <td>{v.matricule}</td>
                  <td>{v.marque}</td>
                  <td>{v.modele}</td>
                  <td>
                    {v.statut === "maintenance" || v.prix_jour === null
                      ? "—"
                      : `${v.prix_jour}`}
                  </td>
                  <td>{v.kilometrage}</td>

                  {/* ✅ Statut avec Badge */}
                  <td>
                    <span
                      className={`badge ${
                        v.statut === "disponible"
                          ? "bg-success"
                          : v.statut === "maintenance"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {v.statut === "disponible"
                        ? "Disponible"
                        : v.statut === "maintenance"
                        ? "Maintenance"
                        : "Louée"}
                    </span>
                  </td>
                  
                  {/* ✅ Boutons Modifier / Supprimer */}
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => navigate(`/voitures/edit/${v.id}`)}
                    >
                      <FaEdit className="me-1" />
                      Modifier
                    </button>

                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => {
                        if (window.confirm("Voulez-vous vraiment supprimer cette voiture ?")) {
                          fetch(`http://127.0.0.1:8000/api/voitures/${v.id}/`, {
                            method: "DELETE",
                          }).then(fetchVoitures);
                        }
                      }}
                    >
                      <FaTrash className="me-1" />
                      Supprimer
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Voitures;
