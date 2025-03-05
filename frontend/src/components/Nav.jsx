import React from "react";
import { Link } from "react-router-dom";

const Nav = () => {
  return (
    <nav className="navbar navbar-dark bg-dark px-3 py-3">
      <h1 className="navbar-brand">Email</h1>
      <ul className="navbar-nav d-flex flex-row ms-auto gap-3">
        <li className="nav-item">
          <Link className="nav-link text-light" to="/">Home</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-light" to="/about">About</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-light" to="/services">Services</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-light" to="/contact">Contact</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-light" to="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
