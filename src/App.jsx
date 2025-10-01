import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Liked from "./pages/Liked";
import AroundMe from "./pages/AroundMe";
import Login from "./pages/Login";
import AllEvents from "./pages/AllEvents";
import LiveEvents from "./pages/LiveEvents";

export default function App(){
  return (
    <Router>
      
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/liked" element={<Liked />} />
        <Route path="/around-me" element={<AroundMe />} />
        <Route path="/login" element={<Login />} />
        <Route path="/all-events" element={<AllEvents />} />
        <Route path="/live-events" element={<LiveEvents />} />
      </Routes>
      <Footer />
    </Router>
  );
}

