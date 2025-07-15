import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

function UserTable({ users = [], onEdit, onDelete, onAdd }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Trie les utilisateurs du plus récent au plus ancien (id décroissant)
  const sortedUsers = [...users].sort((a, b) => b.id - a.id);

  const filtered = sortedUsers.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
  );
  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-bold">Liste des utilisateurs</span>
        <div className="d-flex align-items-center" style={{gap: '0.5rem'}}>
          <input
            type="text"
            className="form-control w-auto"
            placeholder="Rechercher..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          <button className="btn btn-success" onClick={() => onAdd && onAdd()}>
            + Ajouter utilisateur
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Nom d'utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={5} className="text-center">Aucun utilisateur</td></tr>
            ) : paginated.map((user, idx) => (
              <tr key={user.id}>
                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td>{user.username}</td>
                <td>{user.email || '-'}</td>
                <td>{user.role}</td>
                <td className="text-center">
                  <div className="d-flex justify-content-center align-items-center" style={{gap: '0.5rem'}}>
                    <span
                      className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32, fontSize: '1.1rem', cursor: 'pointer' }}
                      title="Modifier"
                      onClick={() => onEdit && onEdit(user)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </span>
                    <span
                      className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32, fontSize: '1.1rem', cursor: 'pointer' }}
                      title="Supprimer"
                      onClick={() => onDelete && onDelete(user)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <nav className="mt-2">
          <ul className="pagination justify-content-center mb-0">
            <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>&laquo;</button>
            </li>
            {[...Array(pageCount)].map((_, idx) => (
              <li key={idx + 1} className={`page-item${currentPage === idx + 1 ? " active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
              </li>
            ))}
            <li className={`page-item${currentPage === pageCount ? " disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === pageCount}>&raquo;</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default UserTable; 