import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Accueil from "./pages/Accueil";
import Voitures from "./pages/voitures/Voitures";
import AjouterVoiture from "./pages/voitures/AjouterVoiture";
import EditVoiture from "./pages/voitures/EditVoiture";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Accueil */}
        <Route path="/" element={<Accueil />} />

        {/* Voitures */}
        <Route path="voitures" element={<Voitures />} />
        <Route path="voitures/ajouter" element={<AjouterVoiture />} />
        <Route path="voitures/edit/:id" element={<EditVoiture />} />
      </Route>
    </Routes>
  );
}

export default App;
