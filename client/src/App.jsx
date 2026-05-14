import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import ProtectedRoute from "./components/ProtectedRoute";
import AcceptInvite from "./pages/AcceptInvite";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />

        <Route
          path="/projects"
          element={<ProtectedRoute><Projects /></ProtectedRoute>}
        />

        <Route
          path="/tasks"
          element={<ProtectedRoute><Tasks /></ProtectedRoute>}
        />
        <Route 
        path="/accept-invite/:token"
         element={<AcceptInvite />}
          />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
      <Route
        path="/signup"
        element={<Signup />}
      />
      </Routes>
    </BrowserRouter>
  );
}

export default App;