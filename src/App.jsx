import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ScrollToTop from "./components/ScrollToTop";
import RouteSeo from "./components/RouteSeo";

import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import TeamPage from "./pages/TeamPage";
import ProgramsPage from "./pages/ProgramsPage";
import InternshipsPage from "./pages/InternshipsPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import ApplicationPage from "./pages/ApplicationPage";
function App() {
  return (
    <>
      <ScrollToTop />
      <RouteSeo />
      <Routes>
      <Route path="/" element={<MainLayout />}>

        <Route index element={<Home />} />

        <Route
          path="about"
          element={<AboutPage />}
        />

        <Route
          path="team"
          element={<TeamPage />}
        />

        <Route
          path="programs"
          element={<ProgramsPage />}
        />

        <Route
          path="internships"
          element={<InternshipsPage />}
        />

        <Route
          path="contact"
          element={<ContactPage />}
        />

        <Route
          path="privacy-policy"
          element={<PrivacyPolicyPage />}
        />

        <Route
          path="terms-and-conditions"
          element={<TermsPage />}
        />

        <Route
          path="help-support"
          element={<HelpSupportPage />}
        />
<Route
  path="internship/apply/:courseName"
  element={<ApplicationPage />}
/>
      </Route>

      <Route path="admin" element={<AdminPage />} />
    </Routes>
    </>
  );
}

export default App;