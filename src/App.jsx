import ArtistProfile from "./pages/ArtistProfile";
import Artists from "./pages/Artists";
import Following from "./pages/Following";
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavbarNew";
// Footer removed from global layout; it's rendered only on Home page now
// import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tracked from "./pages/Tracked";
import AroundMe from "./pages/AroundMe";
import Login from "./pages/Login";
import AllEvents from "./pages/AllEvents";
import LiveEvents from "./pages/LiveEvents";
import Plan from "./pages/Plan";
import PressKit from "./pages/PressKit";
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import About from "./pages/About";
import ViewPlan from "./pages/ViewPlan";
import Profile from "./pages/Profile";
import { AppContext } from "./context/AppContext";


export default function App(){
  const { toast } = useContext(AppContext);
  return (
    <Router>
      
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
  <Route path="/artists" element={<Artists />} />
  <Route path="/following" element={<Following />} />
  <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/around-me" element={<AroundMe />} />
  <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/all-events" element={<AllEvents />} />
        <Route path="/live-events" element={<LiveEvents />} />
  <Route path="/plan" element={<Plan />} />
  <Route path="/plan/:id" element={<Plan />} />
        <Route path="/tracked" element={<Tracked/>} />
        <Route path="/press-kit" element={<PressKit/>} />
        <Route path="/support" element={<Support/>} />
        <Route path="/privacy" element={<Privacy/>} />
        <Route path="/terms" element={<Terms/>} />
        <Route path="/cookies" element={<Cookies/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/plans/:id" element={<ViewPlan/>} />
      </Routes>
      {toast && (
        <div className="global-toast" role="status" aria-live="polite">{toast}</div>
      )}
    </Router>
  );
}

