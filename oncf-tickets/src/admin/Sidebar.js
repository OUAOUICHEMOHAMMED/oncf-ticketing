import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTicketAlt, faUsers, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function Sidebar({ current, onNavigate, onLogout }) {
  return (
    <div className="bg-dark text-white vh-100 p-0 d-flex flex-column justify-content-between" style={{width: 220, minWidth: 180}}>
      <div>
        <div className="d-flex align-items-center justify-content-center py-3 border-bottom border-secondary">
          <span className="fs-4 fw-bold">ONCF <span className="text-primary">Helpdesk</span></span>
        </div>
        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            <a className={`nav-link text-white ${current === 'dashboard' ? 'active bg-primary' : ''}`} style={{cursor:'pointer'}} onClick={() => onNavigate('dashboard')}>
              <FontAwesomeIcon icon={faTachometerAlt} className="me-2" /> Dashboard
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link text-white ${current === 'tickets' ? 'active bg-primary' : ''}`} style={{cursor:'pointer'}} onClick={() => onNavigate('tickets')}>
              <FontAwesomeIcon icon={faTicketAlt} className="me-2" /> Tickets
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link text-white ${current === 'users' ? 'active bg-primary' : ''}`} style={{cursor:'pointer'}} onClick={() => onNavigate('users')}>
              <FontAwesomeIcon icon={faUsers} className="me-2" /> Utilisateurs
            </a>
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