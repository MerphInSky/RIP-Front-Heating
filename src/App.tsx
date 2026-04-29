import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ComponentsPage from "./pages/ComponentsPage/ComponentsPage";
import { ROUTES } from "./Routes";
import ComponentPage from "./pages/ComponentPage/ComponentPage";
import HeatingPage from "./pages/HeatingPage/HeatingPage";
import MainLayout from "./layouts/MainLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index_style.css";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.COMPONENTS} element={<ComponentsPage />} />
          <Route path="/components" element={<Navigate to="/" replace />} />
          <Route path={ROUTES.COMPONENT} element={<ComponentPage />} />
          <Route path={ROUTES.HEATING} element={<HeatingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
