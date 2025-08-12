import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './TicketTable.css';
import { faPen, faTrash, faSort, faSortUp, faSortDown, faBars } from '@fortawesome/free-solid-svg-icons';
import { Overlay, Popover, Button, Form } from 'react-bootstrap';

function TicketTable({ tickets = [], users = [], onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Tri dynamique
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [columnFilters, setColumnFilters] = useState({});
  const [filterTypes, setFilterTypes] = useState({});
  const [popoverCol, setPopoverCol] = useState(null);
  const popoverRefs = {
    id: useRef(null), titre: useRef(null), etat: useRef(null), user: useRef(null), type: useRef(null), famille: useRef(null), operateur: useRef(null), nature: useRef(null), equipement: useRef(null), ligne: useRef(null), priorite: useRef(null), description: useRef(null)
  };

  // Types de filtre disponibles
  const filterTypeOptions = [
    { value: 'contains', label: 'Contient' },
    { value: 'equals', label: 'Égal à' },
    { value: 'starts', label: 'Commence par' },
  ];

  // Appliquer les filtres par colonne
  const filteredTickets = tickets.filter(ticket => {
    return Object.entries(columnFilters).every(([key, value]) => {
      if (!value) return true;
      const type = filterTypes[key] || 'contains';
      let field = key === 'user' ? (ticket.user?.username || '') : (ticket[key] || '');
      field = field.toString().toLowerCase();
      const val = value.toLowerCase();
      if (type === 'contains') return field.includes(val);
      if (type === 'equals') return field === val;
      if (type === 'starts') return field.startsWith(val);
      return true;
    });
  }).filter(ticket => {
    // Recherche globale
    if (!search) return true;
    return Object.values(ticket).join(' ').toLowerCase().includes(search.toLowerCase()) ||
      (ticket.user && ticket.user.username && ticket.user.username.toLowerCase().includes(search.toLowerCase()));
  });

  // Tri
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    if (sortConfig.key === 'user') {
      aValue = a.user?.username || '';
      bValue = b.user?.username || '';
    }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const pageCount = Math.ceil(sortedTickets.length / itemsPerPage);
  const paginated = sortedTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key, direction = null) => {
    let dir = direction;
    if (!dir) {
      dir = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') dir = 'desc';
    }
    setSortConfig({ key, direction: dir });
  };

  const handleFilterChange = (key, value) => {
    setColumnFilters(f => ({ ...f, [key]: value }));
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (key, value) => {
    setFilterTypes(f => ({ ...f, [key]: value }));
  };

  const handleClearSort = () => {
    setSortConfig({ key: 'id', direction: 'desc' });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FontAwesomeIcon icon={faSort} className="ms-1 text-secondary" />;
    return sortConfig.direction === 'asc'
      ? <FontAwesomeIcon icon={faSortUp} className="ms-1 text-primary" />
      : <FontAwesomeIcon icon={faSortDown} className="ms-1 text-primary" />;
  };

  const renderFilterPopover = (col) => (
    <Popover id={`popover-${col}`}>
      <Popover.Body>
        <Form.Group className="mb-2">
          <Form.Label visuallyHidden>Type de filtre</Form.Label>
          <Form.Select size="sm" value={filterTypes[col] || 'contains'} onChange={e => handleFilterTypeChange(col, e.target.value)}>
            {filterTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label visuallyHidden>Valeur</Form.Label>
          <Form.Control size="sm" placeholder="Filtrer..." value={columnFilters[col] || ''} onChange={e => handleFilterChange(col, e.target.value)} />
        </Form.Group>
        <div className="d-flex flex-column gap-1">
          <Button variant="outline-primary" size="sm" onClick={() => handleSort(col, 'asc')}><FontAwesomeIcon icon={faSortUp} className="me-1" /> Sort Ascending</Button>
          <Button variant="outline-primary" size="sm" onClick={() => handleSort(col, 'desc')}><FontAwesomeIcon icon={faSortDown} className="me-1" /> Sort Descending</Button>
          <Button variant="outline-secondary" size="sm" onClick={handleClearSort}><FontAwesomeIcon icon={faSort} className="me-1" /> Clear sort</Button>
        </div>
      </Popover.Body>
    </Popover>
  );

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'titre', label: 'Titre' },
    { key: 'etat', label: 'État' },
    { key: 'user', label: 'Créé par' },
    { key: 'type', label: 'Type' },
    { key: 'famille', label: 'Famille' },
    { key: 'operateur', label: 'Opérateur' },
    { key: 'nature', label: 'Nature' },
    { key: 'equipement', label: 'Équipement' },
    { key: 'ligne', label: 'Ligne' },
    { key: 'priorite', label: 'Priorité' },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div className="card mt-4 ticket-table">
      <div className="d-flex justify-content-between align-items-center px-3 pt-3">
        <div className="d-flex align-items-center gap-2">
          <select className="form-select form-select-sm w-auto" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="ms-2">entries per page</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="me-2">Search:</span>
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Rechercher..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered align-middle mb-0 mt-2">
          <thead className="table-light align-middle">
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', minWidth: col.key === 'id' ? 50 : col.key === 'equipement' ? 70 : 90, width: col.key === 'id' ? 50 : col.key === 'equipement' ? 70 : undefined, maxWidth: col.key === 'equipement' ? 70 : undefined, overflow: col.key === 'equipement' ? 'hidden' : undefined, textOverflow: col.key === 'equipement' ? 'ellipsis' : undefined }}>
                  <div>{col.label}</div>
                  <div className="d-flex justify-content-center align-items-center mt-1" style={{gap: '0.3rem'}}>
                    <span style={{fontSize: '1rem', cursor: 'pointer'}} onClick={() => handleSort(col.key)}>{renderSortIcon(col.key)}</span>
                    <span ref={popoverRefs[col.key]} style={{fontSize: '1rem', cursor: 'pointer'}}>
                      <FontAwesomeIcon icon={faBars} className="text-secondary" onClick={e => { e.stopPropagation(); setPopoverCol(popoverCol === col.key ? null : col.key); }} />
                    </span>
                    <Overlay show={popoverCol === col.key} target={popoverRefs[col.key].current} placement="bottom" containerPadding={20} rootClose onHide={() => setPopoverCol(null)}>
                      {renderFilterPopover(col.key)}
                    </Overlay>
                  </div>
                </th>
              ))}
              <th className="text-center" style={{ fontWeight: 'bold', verticalAlign: 'middle' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="text-center">Aucun ticket</td></tr>
            ) : paginated.map((ticket, idx) => (
              <tr key={ticket.id}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.key === 'user' ? (ticket.user ? ticket.user.username : 'N/A') : ticket[col.key]}
                  </td>
                ))}
                <td className="text-center">
                  <div className="d-flex justify-content-center align-items-center" style={{gap: '0.5rem'}}>
                    <span
                      className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32, fontSize: '1.1rem', cursor: 'pointer' }}
                      title="Modifier"
                      onClick={() => onEdit && onEdit(ticket)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </span>
                    <span
                      className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32, fontSize: '1.1rem', cursor: 'pointer' }}
                      title="Supprimer"
                      onClick={() => onDelete && onDelete(ticket)}
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

export default TicketTable; 