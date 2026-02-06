export type Voiture = {
  id: number;
  matricule: string;
  statut: string;
};

const API_URL = "http://127.0.0.1:8000/api/voitures/";

export async function getVoitures(): Promise<Voiture[]> {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des voitures");
  }

  return res.json(); // ⬅️ يرجع Array مباشرة
}
