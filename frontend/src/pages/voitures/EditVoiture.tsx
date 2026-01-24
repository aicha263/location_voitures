import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Voiture } from "../../types/Voiture";
import "./EditVoiture.css";


function EditVoiture() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<Voiture | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 جلب البيانات الحقيقية فقط
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/voitures/${id}/`)
      .then((res) => res.json())
      .then((data) => {
      setForm({
        id: data.id,
        marque: data.marque || "",
        modele: data.modele || "",
        prix_jour: Number(data.prix_jour ?? 0),
        kilometrage: Number(data.kilometrage ?? 0),
        statut: data.statut || "disponible",
      });
  setLoading(false);
});

  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!form) return;

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:
        name === "kilometrage"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);

    await fetch(`http://127.0.0.1:8000/api/voitures/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    navigate("/voitures");
  };

  // ⏳ تحميل
  if (loading) return <p>Chargement...</p>;
  if (!form) return <p>Voiture introuvable</p>;

  // ✅ الفورم لا يُرسم إلا بعد وجود البيانات
  return (
    <>
      <h2 className="mb-4">✏️ Modifier la voiture</h2>

      <form onSubmit={handleSubmit} className="card p-4" style={{ maxWidth: 500 }}>
        <input
          className="form-control mb-3"
          name="marque"
          value={form.marque ?? ""}
          onChange={handleChange}
        />

        <input
          className="form-control mb-3"
          name="modele"
          value={form.modele ?? ""}
          onChange={handleChange}
        />

        <input
          type="number"
          className="form-control mb-3"
          name="prix_jour"
          value={form.prix_jour ?? ""}
          onChange={handleChange}
        />

        <input
          type="number"
          className="form-control mb-3"
          name="kilometrage"
          value={form.kilometrage ?? ""}
          onChange={handleChange}
        />

        <select
          className="form-select mb-4"
          name="statut"
          value={form.statut}
          onChange={handleChange}
        >
          <option value="disponible">Disponible</option>
          <option value="maintenance">Maintenance</option>
          <option value="louee">Louée</option>
        </select>

        <div className="d-flex gap-2">
          <button className="btn btn-success" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/voitures")}
          >
            Annuler
          </button>
        </div>
      </form>
    </>
  );
}

export default EditVoiture;
