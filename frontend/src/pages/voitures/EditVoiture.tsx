import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Voiture } from "../../types/Voiture";
import "./EditVoiture.css";
import {
  FaSave, 
  FaTimes
} from "react-icons/fa";

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
        matricule: data.matricule || "",
        marque: data.marque || "",
        modele: data.modele || "",
        prix_jour: data.prix_jour,
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

    setForm((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              name === "kilometrage"
                ? Number(value)
                : value,
            ...(name === "statut" && value === "maintenance"
              ? { prix_jour: null }
              : {}),
          }
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form) return;

  setSaving(true);

  const dataToSend = {
    ...form,
    prix_jour:
      form.statut === "maintenance"
        ? null
        : form.prix_jour,
  };

  await fetch(`http://127.0.0.1:8000/api/voitures/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSend),
  });

  navigate("/voitures");
};


  // ⏳ تحميل
  if (loading) return <p>Chargement...</p>;
  if (!form) return <p>Voiture introuvable</p>;

  // ✅ الفورم لا يُرسم إلا بعد وجود البيانات
  return (
    <div className="edit-page">
      <div className="edit-card">
        <h2 className="edit-title">
          ✏️ Modifier la voiture
        </h2>

        <form onSubmit={handleSubmit} className="edit-form">
        
          <div className="form-row">
            <div className="form-group">
              <label>Kilométrage</label>
              <input
                type="number"
                className="form-input"
                name="kilometrage"
                value={form.kilometrage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Statut</label>
            <select
              className="form-input"
              name="statut"
              value={form.statut}
              onChange={handleChange}
            >
              <option value="disponible">Disponible</option>
              <option value="maintenance">Maintenance</option>
              <option value="louee">Louée</option>
            </select>
          </div>

          {(form.statut === "disponible" || form.statut === "louee") && (
            <div className="form-group">
              <label>Prix / jour</label>
              <input
                type="number"
                className="form-input"
                name="prix_jour"
                value={form.prix_jour ?? ""}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-actions">
            <button className="btn-save" disabled={saving}>
              <FaSave style={{ marginRight: 8 }} />
              {saving ? "⏳ Enregistrement..." : " Enregistrer"}
            </button>
            
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/voitures")}
            >
              <FaTimes /> Annuler
            </button>
          </div>
        </form>

      </div>
    </div>
  );

}

export default EditVoiture;
