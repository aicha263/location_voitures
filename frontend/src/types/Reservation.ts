export interface Reservation {
  id: number;

  voiture: string | number;          // ID voiture (pour POST)
  voiture_info?: string;    // affichage (optionnel)

  nom_client: string;
  telephone: string;

  date_debut: string;       // "YYYY-MM-DD"
  date_fin: string;

  prix_total?: number;
  created_at?: string;
}
