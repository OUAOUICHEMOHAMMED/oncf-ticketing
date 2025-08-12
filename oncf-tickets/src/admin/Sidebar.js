import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Sidebar.css';
import { faTachometerAlt, faTicketAlt, faUsers, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function Sidebar({ current, onNavigate, onLogout }) {
  return (
    <div className="bg-dark text-white vh-100 p-0 d-flex flex-column justify-content-between position-fixed sidebar" style={{width: 220, minWidth: 180, top: 0, left: 0, zIndex: 1000}}>
      <div>
        <div className="d-flex align-items-center justify-content-center py-3 border-bottom border-secondary">
          <span className="fs-4 fw-bold">ONCF <span className="text-primary">TicketPro</span></span>
        </div>
        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            <button className={`nav-link text-white border-0 bg-transparent w-100 text-start ${current === 'dashboard' ? 'active bg-primary' : ''}`} style={{cursor:'pointer'}} onClick={() => onNavigate('dashboard')}>
              <FontAwesomeIcon icon={faTachometerAlt} className="me-2" /> Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link text-white border-0 bg-transparent w-100 text-start ${current === 'tickets' ? 'active bg-primary' : ''}`} style={{cursor:'pointer'}} onClick={() => onNavigate('tickets')}>
              <FontAwesomeIcon icon={faTicketAlt} className="me-2" /> Tickets
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link text-white border-0 bg-transparent w-100 text-start ${current === 'users' ? 'active bg-primary' : ''}`} style={{cursor:'pointer'}} onClick={() => onNavigate('users')}>
              <FontAwesomeIcon icon={faUsers} className="me-2" /> Utilisateurs
            </button>
          </li>
        </ul>
      </div>
      <div className="mb-4 d-flex justify-content-center">
        <button className="btn btn-danger w-75 d-flex align-items-center justify-content-center" onClick={onLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Déconnexion
        </button>
      </div>
    </div>
  );
}

export default Sidebar; 