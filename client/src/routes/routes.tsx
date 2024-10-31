import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Login } from "../pages/Login";
import { Main } from "../pages/Main";
import { ParticipantPage } from "../pages/Participant";

export const PrivateRoute = () => {
  const token = localStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export const useRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route index element={<Main />} />
        <Route path="*" element={<Main />} />
        <Route path="/participant/:userId" element={<ParticipantPage />} />
      </Route>
    </Routes>
  );
};
