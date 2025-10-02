import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavbarNew";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tracked from "./pages/Tracked";
import AroundMe from "./pages/AroundMe";
import Login from "./pages/Login";
import AllEvents from "./pages/AllEvents";
import LiveEvents from "./pages/LiveEvents";
import { AppContext } from "./context/AppContext";


export default function App(){
  const { toast } = useContext(AppContext);
  return (
    <Router>
      
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artists" element={<Tracked/>} />
        <Route path="/around-me" element={<AroundMe />} />
        <Route path="/login" element={<Login />} />
        <Route path="/all-events" element={<AllEvents />} />
        <Route path="/live-events" element={<LiveEvents />} />
        <Route path="/tracked" element={<Tracked/>} />
      </Routes>
      {toast && (
        <div className="global-toast" role="status" aria-live="polite">{toast}</div>
      )}
      <Footer />
    </Router>
  );
}

