import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Faq from "../components/Faq";
import Contact from "../components/Contact";
import WhatsAppFloat from "../components/WhatsAppFloat";

const FAQ_PATHS = new Set(["/", "/about"]);
const CONTACT_PATHS = new Set(["/", "/about"]);

function MainLayout() {
  const { pathname } = useLocation();
  const showFaq = FAQ_PATHS.has(pathname);
  const showContact = CONTACT_PATHS.has(pathname);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <Outlet />
      {showFaq ? <Faq /> : null}
      {showContact ? <Contact /> : null}
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default MainLayout;
