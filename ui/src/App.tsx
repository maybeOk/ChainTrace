import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { VerifyPage } from "./pages/VerifyPage";
import { EnterpriseProfilePage } from "./pages/EnterpriseProfilePage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/verify" element={<VerifyPage />} />
                <Route path="/verify/:id" element={<VerifyPage />} />
                <Route path="/enterprise-profile" element={<EnterpriseProfilePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;