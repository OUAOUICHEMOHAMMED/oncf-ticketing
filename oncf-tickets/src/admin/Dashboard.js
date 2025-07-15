import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faCheckCircle, faUsers, faUserShield, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

function Dashboard({
  totalTickets = 0,
  openTickets = 0,
  totalUsers = 0,
  adminUsers = 0,
  newTickets = 0
}) {
  return (
    <div className="container-fluid py-4">
      <div className="row g-4 mb-4">
        <div className="col-md-2">
          <div className="card text-white bg-primary h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <FontAwesomeIcon icon={faTicketAlt} size="2x" className="mb-2" />
              <h3 className="card-title">{totalTickets}</h3>
              <p className="card-text">Tickets Total</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-white bg-success h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <FontAwesomeIcon icon={faCheckCircle} size="2x" className="mb-2" />
              <h3 className="card-title">{openTickets}</h3>
              <p className="card-text">Tickets Ouverts</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-white bg-info h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <FontAwesomeIcon icon={faPlusCircle} size="2x" className="mb-2" />
              <h3 className="card-title">{newTickets}</h3>
              <p className="card-text">Tickets Nouveaux</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-white bg-warning h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <FontAwesomeIcon icon={faUserShield} size="2x" className="mb-2" />
              <h3 className="card-title">{adminUsers}</h3>
              <p className="card-text">Admins</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-white bg-secondary h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <FontAwesomeIcon icon={faUsers} size="2x" className="mb-2" />
              <h3 className="card-title">{totalUsers}</h3>
              <p className="card-text">Utilisateurs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 