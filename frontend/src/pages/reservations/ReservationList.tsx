import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Reservation } from "../../types/Reservation";
import { getReservations, deleteReservation, } from "../../services/reservationService";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FaCalendarAlt } from "react-icons/fa";
import "./ReservationList.css";


export default function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getReservations().then(setReservations);
  }, []);

  const events = reservations.map((r) => ({
    id: String(r.id),
    title: `${r.nom_client} - ${r.voiture_info ?? r.voiture}`,
    start: r.date_debut,
    end: r.date_fin,
  }));
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
          <p className="page-subtitle">
            Gestion et suivi des réservations
          </p>
        </div>
        <Link to="/reservations/create" className="btn-primary">
          + Ajouter une réservation
        </Link>
      </div> 

      {/* STATISTIQUES + RECHERCHE */}
      <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <span className="badge bg-primary me-2">
              Total : {reservations.length}
            </span>
          </div>
          <input
            className="form-control w-25"
            placeholder="Rechercher client ou voiture..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
      </div>

      {/* TABLEAU DES RESERVATIONS */}
      <div className="card table-card mb-4">
        <div className="card-body">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                  <th>Client</th>
                  <th>Voiture (Matricule)</th>
                  <th>Telephone</th>
                  <th>Dates</th>
                  <th>Montant</th>
                  <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                {reservations.map((r) => (
                    <tr key={r.id}>
                        <td>{r.nom_client}</td>
                        <td>{r.voiture_info ?? r.voiture}</td>
                        <td>{r.telephone}</td>
                        <td>
                            {r.date_debut} → {r.date_fin}
                        </td>
                        <td>{r.prix_total ?? "-"} MRU</td>
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
                {reservations.length === 0 && (
                    <tr>
                        <td colSpan={6} className="text-center">
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
