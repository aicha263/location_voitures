import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Reservation } from "../../types/Reservation";
import {
  getReservations,
  deleteReservation,
} from "../../services/reservationService";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { FaCalendarAlt } from "react-icons/fa";
import "./ReservationList.css";

export default function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");

  // Charger toutes les réservations
  const loadReservations = async () => {
    const data = await getReservations();
    console.log("Réservations reçues :", data);
    setReservations(data);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  // 🔍 Filtrer les réservations selon recherche
  const filteredReservations = reservations.filter((r) => {
    const value = search.toLowerCase();
    return (
      r.nom_client.toLowerCase().includes(value) ||
      r.telephone.includes(value) ||
      (r.nni?.includes(value) ?? false) ||
      (r.voiture?.marque.toLowerCase().includes(value) ?? false) ||
      (r.voiture?.modele.toLowerCase().includes(value) ?? false) ||
      (r.voiture?.matricule.toLowerCase().includes(value) ?? false)
    );
  });

  // 📅 Événements pour le calendrier
  const events = filteredReservations.map((r) => ({
    id: String(r.id),
    title: `${r.nom_client} - ${r.voiture.marque} ${r.voiture.modele}`,
    start: r.date_debut,
    end: r.date_fin,
  }));

  // 🗑 Supprimer une réservation
  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette réservation ?")) return;
    await deleteReservation(id);
    setReservations(reservations.filter((r) => r.id !== id));
  };

  return (
    <div className="reservation-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <FaCalendarAlt className="me-2 text-primary" />
            Réservations
          </h2>
          <p className="page-subtitle">Gestion et suivi des réservations</p>
        </div>
        <Link to="/reservations/create" className="btn-primary">
          + Ajouter une réservation
        </Link>
      </div>

      {/* STATS + RECHERCHE */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="badge bg-primary">
          Total : {filteredReservations.length}
        </span>

        <input
          className="form-control w-25"
          placeholder="Rechercher client, voiture, NNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLEAU DES RÉSERVATIONS */}
      <div className="card table-card mb-4">
        <div className="card-body">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Client</th>
                <th>NNI</th>
                <th>Voiture</th>
                <th>Téléphone</th>
                <th>Date début</th>
                <th>Date fin</th>
                <th>Montant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((r) => (
                <tr key={r.id}>
                  <td>{r.nom_client}</td>
                  <td>{r.nni ?? "—"}</td>
                  <td>
                    {r.voiture.marque} {r.voiture.modele} ({r.voiture.matricule})
                  </td>
                  <td>{r.telephone}</td>
                  <td>{new Date(r.date_debut).toLocaleString()}</td>
                  <td>{new Date(r.date_fin).toLocaleString()}</td>
                  <td>{r.prix_total?.toLocaleString() ?? "-"} MRU</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link
                        to={`/reservations/edit/${r.id}`}
                        className="btn-primary"
                      >
                        Modifier
                      </Link>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(r.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center">
                    Aucun résultat trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CALENDRIER */}
      <div className="card table-card">
        <div className="card-body">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            height="auto"
          />
        </div>
      </div>
    </div>
  );
}
