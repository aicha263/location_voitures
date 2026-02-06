import type { Reservation } from "../types/Reservation";

const API_URL = "http://127.0.0.1:8000/api/reservations/";

export async function createReservation(
  reservation: Reservation
): Promise<Reservation> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reservation),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la création de la réservation");
  }

  return res.json();
}


export async function getReservations(): Promise<Reservation[]> {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("Erreur lors du chargement");
  }

  return res.json();
}

export async function updateReservation(
  id: number,
  reservation: Reservation
): Promise<Reservation> {
  const res = await fetch(`${API_URL}${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reservation),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la modification");
  }

  return res.json();
}

export async function getReservation(id: number): Promise<Reservation> {
  const res = await fetch(`${API_URL}${id}/`);

  console.log("STATUS:", res.status);

  if (!res.ok) {
    throw new Error("Erreur lors du chargement");
  }

  return res.json();
}

export async function deleteReservation(id: number): Promise<void> {
  const res = await fetch(`${API_URL}${id}/`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la suppression");
  }
}

