import React from "react";
import { Link } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link to="/" className="navbar-brand">Fitness App</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link to="/login" className="nav-link">Iniciar sesión</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link">Registrarse</Link>
            </li>
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Dashboard() {
  return (
    <div>
      <Navbar />
      <h1>Dashboard Page</h1>
    </div>
  );
}

export default Dashboard;