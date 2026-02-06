import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Accueil from "./pages/Accueil";
import Voitures from "./pages/voitures/Voitures";
import AjouterVoiture from "./pages/voitures/AjouterVoiture";
import EditVoiture from "./pages/voitures/EditVoiture";

import ReservationList from "./pages/reservations/ReservationList";
import CreateReservation from "./pages/reservations/CreateReservation";
import EditReservation from "./pages/reservations/EditReservation";


function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Accueil */}
        <Route index element={<Accueil />} />

        {/* Voitures */}
        <Route path="voitures" element={<Voitures />} />
        <Route path="voitures/ajouter" element={<AjouterVoiture />} />
        <Route path="voitures/edit/:id" element={<EditVoiture />} />

        {/* Reservations ✅ */}
        <Route path="reservations" element={<ReservationList />} />
        <Route path="reservations/create" element={<CreateReservation />} />
        <Route path="reservations/edit/:id" element={<EditReservation />} />

      </Route>
    </Routes>
  );
}

export default App;
