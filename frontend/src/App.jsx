import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { useMaterialTailwindController } from "@/context";

function App() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { userType } = controller;
  return (
    <Routes>
      <Route 
        path="/dashboard/*" 
        element={userType ? <Dashboard /> : <Navigate to="/auth/sign-in" replace />} 
      />
      <Route 
        path="/auth/*" 
        element={!userType ? <Auth /> : <Navigate to="/dashboard/home" replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to={userType ? "/dashboard/home" : "/auth/sign-in"} replace />} 
      />
    </Routes>
  );
}

export default App;
