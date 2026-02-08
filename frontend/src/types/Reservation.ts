import type { Voiture } from "./Voiture";

/* 🔹 Réservation retournée par l’API */
export interface Reservation {
  id: number;
  voiture: Voiture;
  nom_client: string;
  telephone: string;
  nni?: string;
  date_debut: string;
  date_fin: string;
  prix_total?: number;
  created_at?: string;
}

/* 🔹 Réservation envoyée à l’API */
export interface ReservationCreate {
  voiture_id: number; // ID seulement
  nom_client: string;
  telephone: string;
  nni?: string;
  date_debut: string;
  date_fin: string;
}