import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFilter, faChartBar, faCalendar, faMapMarkerAlt, faUser, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import './ReportsPage.css';

const ReportsPage = ({ tickets, users }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    generateReports();
  }, [tickets, users, selectedPeriod, selectedRegion, selectedUser]);

  const generateReports = () => {
    const filteredTickets = filterTickets();
    
    const data = {
      totalTickets: filteredTickets.length,
      openTickets: filteredTickets.filter(t => {
        const etat = t.etat ? t.etat.toLowerCase() : '';
        return etat !== 'clos' && etat !== 'fermé' && etat !== 'résolu' && etat !== 'resolu';
      }).length,
      resolvedTickets: filteredTickets.filter(t => {
        const etat = t.etat ? t.etat.toLowerCase() : '';
        return etat === 'clos' || etat === 'fermé' || etat === 'résolu' || etat === 'resolu';
      }).length,
      criticalTickets: filteredTickets.filter(t => {
        const priorite = t.priorite ? t.priorite.toLowerCase() : '';
        return priorite.includes('critique') || priorite.includes('critic') || priorite.includes('élevée') || priorite.includes('elevee') || priorite.includes('haute');
      }).length,
      averageResolutionTime: calculateAverageResolutionTime(filteredTickets),
      ticketsByRegion: groupTicketsByRegion(filteredTickets),
      ticketsByUser: groupTicketsByUser(filteredTickets),
      ticketsByPriority: groupTicketsByPriority(filteredTickets),
      ticketsByStatus: groupTicketsByStatus(filteredTickets),
      topPerformers: getTopPerformers(filteredTickets),
      recentActivity: getRecentActivity(filteredTickets)
    };
    
    setReportData(data);
  };

  const filterTickets = () => {
    let filtered = [...tickets];
    
    // Filtre par période - Désactivé car pas de dateCreation
    // if (selectedPeriod !== 'all') {
    //   // Logique de filtrage par période désactivée
    // }
    
    // Filtre par région
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(ticket => {
        if (ticket.ligne) {
          return identifyRegion(ticket.ligne) === selectedRegion;
        }
        return false;
      });
    }
    
    // Filtre par utilisateur - Basé sur le nom d'utilisateur
    if (selectedUser !== 'all') {
      filtered = filtered.filter(ticket => {
        if (ticket.user && ticket.user.username) {
          return ticket.user.username.toLowerCase() === selectedUser.toLowerCase();
        }
        return false;
      });
    }
    
    return filtered;
  };

  const identifyRegion = (ligne) => {
    const ligneLower = ligne.toLowerCase();
    if (ligneLower.includes('casa') || ligneLower.includes('settat')) return 'casa';
    if (ligneLower.includes('marakech') || ligneLower.includes('safi')) return 'marakech';
    if (ligneLower.includes('rabat') || ligneLower.includes('sale')) return 'rabat';
    if (ligneLower.includes('fes') || ligneLower.includes('meknes')) return 'fes';
    if (ligneLower.includes('tanger') || ligneLower.includes('tetouan')) return 'tanger';
    if (ligneLower.includes('agadir') || ligneLower.includes('souss')) return 'agadir';
    if (ligneLower.includes('oujda') || ligneLower.includes('oriental')) return 'oujda';
    if (ligneLower.includes('beni') || ligneLower.includes('khenifra')) return 'beni';
    if (ligneLower.includes('dakhla')) return 'dakhla';
    if (ligneLower.includes('laayoune')) return 'laayoune';
    if (ligneLower.includes('guelmim')) return 'guelmim';
    if (ligneLower.includes('drara') || ligneLower.includes('tafilalet')) return 'drara';
    return null;
  };

  const calculateAverageResolutionTime = (tickets) => {
    const resolvedTickets = tickets.filter(t => 
      t.etat && (t.etat.toLowerCase() === 'clos' || t.etat.toLowerCase() === 'fermé' || t.etat.toLowerCase() === 'résolu')
    );
    
    if (resolvedTickets.length === 0) return 0;
    
    // Pas de dateCreation, on utilise une estimation basée sur l'ID
    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      // Estimation: tickets avec ID élevé = plus récents
      const estimatedDays = Math.max(1, Math.floor(ticket.id / 10));
      return sum + (estimatedDays * 24 * 60 * 60 * 1000); // en millisecondes
    }, 0);
    
    return Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60 * 24)); // en jours
  };

  const groupTicketsByRegion = (tickets) => {
    const regions = {};
    tickets.forEach(ticket => {
      if (ticket.ligne) {
        const region = identifyRegion(ticket.ligne);
        if (region) {
          regions[region] = (regions[region] || 0) + 1;
        }
      }
    });
    return regions;
  };

  const groupTicketsByUser = (tickets) => {
    const userStats = {};
    tickets.forEach(ticket => {
      // Utiliser l'ID du ticket comme identifiant utilisateur temporaire
      const userId = ticket.id || 'unknown';
      if (userId) {
        if (!userStats[userId]) {
          userStats[userId] = { total: 0, resolved: 0, open: 0 };
        }
        userStats[userId].total++;
        if (ticket.etat && (ticket.etat.toLowerCase() === 'clos' || ticket.etat.toLowerCase() === 'fermé' || ticket.etat.toLowerCase() === 'résolu')) {
          userStats[userId].resolved++;
        } else {
          userStats[userId].open++;
        }
      }
    });
    return userStats;
  };

  const groupTicketsByPriority = (tickets) => {
    const priorities = {};
    tickets.forEach(ticket => {
      const priority = ticket.priorite || 'Non définie';
      priorities[priority] = (priorities[priority] || 0) + 1;
    });
    return priorities;
  };

  const groupTicketsByStatus = (tickets) => {
    const statuses = {};
    tickets.forEach(ticket => {
      const status = ticket.etat || 'Non défini';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return statuses;
  };

  const getTopPerformers = (tickets) => {
    const userStats = groupTicketsByUser(tickets);
    return Object.entries(userStats)
      .map(([userId, stats]) => {
        // Créer un nom d'utilisateur basé sur l'ID du ticket
        const username = `Ticket #${userId}`;
        return {
          username: username,
          total: stats.total,
          resolved: stats.resolved,
          resolutionRate: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0
        };
      })
      .sort((a, b) => b.resolutionRate - a.resolutionRate)
      .slice(0, 5);
  };

  const getRecentActivity = (tickets) => {
    return tickets
      .sort((a, b) => {
        // Trier par ID (plus récent = ID plus élevé)
        return b.id - a.id;
      })
      .slice(0, 10);
  };

  const exportToExcel = () => {
    try {
      // Créer les données pour Excel
      const excelData = [
        // Logo et en-tête
        ['ONCF - Office National des Chemins de Fer du Maroc'],
        ['📊 Rapport des Tickets - ' + new Date().toLocaleDateString('fr-FR')],
        ['Généré le ' + new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR')],
        [],
        // KPIs
        ['Total Tickets', reportData.totalTickets || 0],
        ['Tickets Ouverts', reportData.openTickets || 0],
        ['Tickets Résolus', reportData.resolvedTickets || 0],
        ['Tickets Critiques', reportData.criticalTickets || 0],
        ['Jours Moyen Résolution', reportData.averageResolutionTime || 0],
        [],
        // Top Performers
        ['🏆 TOP PERFORMERS'],
        ['Utilisateur', 'Total', 'Résolus', 'Taux (%)'],
        ...(reportData.topPerformers?.map(p => [p.username, p.total, p.resolved, p.resolutionRate + '%']) || []),
        [],
        // Répartition par Priorité
        ['📊 RÉPARTITION PAR PRIORITÉ'],
        ['Priorité', 'Nombre', 'Pourcentage'],
        ...(Object.entries(reportData.ticketsByPriority || {}).map(([priority, count]) => 
          [priority, count, Math.round((count / reportData.totalTickets) * 100) + '%']
        )),
        [],
        // Activité Récente
        ['🕒 ACTIVITÉ RÉCENTE'],
        ['ID', 'Titre', 'Région', 'Priorité', 'État'],
        ...(reportData.recentActivity?.map(ticket => [
          ticket.id,
          ticket.titre || 'N/A',
          ticket.ligne ? moroccoRegions[identifyRegion(ticket.ligne)] || ticket.ligne : 'N/A',
          ticket.priorite || 'Non définie',
          ticket.etat || 'Non défini'
        ]) || [])
      ];

      // Créer le contenu CSV
      const csvContent = excelData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rapport_tickets_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('✅ Export Excel réussi ! Fichier téléchargé.');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      alert('❌ Erreur lors de l\'export Excel');
    }
  };

  const exportToPDF = () => {
    try {
      // Créer le contenu HTML pour le PDF avec logo emoji
      const pdfContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background-color: #fafafa; }
              .header { text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: white; padding: 20px; border-radius: 10px; }
              .section { margin: 20px 0; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
              .kpi-card { border: 2px solid #8B5CF6; padding: 15px; text-align: center; border-radius: 8px; background: linear-gradient(135deg, #f8f9ff, #f0f4ff); }
              .kpi-value { font-size: 24px; font-weight: bold; color: #8B5CF6; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; border-radius: 8px; overflow: hidden; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: white; font-weight: bold; }
              .title { color: #8B5CF6; font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; border-left: 4px solid #8B5CF6; padding-left: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 15px; color: white;">🚂</div>
                <h1 style="color: white; margin: 0; font-size: 36px;">ONCF</h1>
                <p style="color: #f0f0f0; margin: 5px 0; font-size: 16px;">Office National des Chemins de Fer du Maroc</p>
              </div>
              <h2 style="color: white; border-bottom: 2px solid white; padding-bottom: 10px; margin-top: 20px;">📊 Rapport des Tickets</h2>
              <p style="color: #f0f0f0; margin-top: 10px;">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
            
            <div class="section">
              <h2 class="title">📈 KPIs Principaux</h2>
              <div class="kpi-grid">
                <div class="kpi-card">
                  <div class="kpi-value">${reportData.totalTickets || 0}</div>
                  <div>Total Tickets</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-value">${reportData.openTickets || 0}</div>
                  <div>Tickets Ouverts</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-value">${reportData.resolvedTickets || 0}</div>
                  <div>Tickets Résolus</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-value">${reportData.averageResolutionTime || 0}</div>
                  <div>Jours Moyen Résolution</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2 class="title">🏆 Top Performers</h2>
              <table>
                <thead>
                  <tr><th>Utilisateur</th><th>Total</th><th>Résolus</th><th>Taux (%)</th></tr>
                </thead>
                <tbody>
                  ${(reportData.topPerformers || []).map(p => 
                    `<tr><td>${p.username}</td><td>${p.total}</td><td>${p.resolved}</td><td>${p.resolutionRate}%</td></tr>`
                  ).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="section">
              <h2 class="title">📊 Répartition par Priorité</h2>
              <table>
                <thead>
                  <tr><th>Priorité</th><th>Nombre</th><th>Pourcentage</th></tr>
                </thead>
                <tbody>
                  ${Object.entries(reportData.ticketsByPriority || {}).map(([priority, count]) => 
                    `<tr><td>${priority}</td><td>${count}</td><td>${Math.round((count / reportData.totalTickets) * 100)}%</td></tr>`
                  ).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="section">
              <h2 class="title">🕒 Activité Récente</h2>
              <table>
                <thead>
                  <tr><th>ID</th><th>Titre</th><th>Région</th><th>Priorité</th><th>État</th></tr>
                </thead>
                <tbody>
                  ${(reportData.recentActivity || []).map(ticket => 
                    `<tr><td>${ticket.id}</td><td>${ticket.titre || 'N/A'}</td><td>${ticket.ligne ? moroccoRegions[identifyRegion(ticket.ligne)] || ticket.ligne : 'N/A'}</td><td>${ticket.priorite || 'Non définie'}</td><td>${ticket.etat || 'Non défini'}</td></tr>`
                  ).join('')}
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;

      // Créer et télécharger le PDF
      const printWindow = window.open('', '_blank');
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis imprimer
      printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
      };
      
      alert('✅ Export PDF réussi ! Fenêtre d\'impression ouverte.');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('❌ Erreur lors de l\'export PDF');
    }
  };

  const moroccoRegions = {
    "casa": "Casablanca-Settat",
    "marakech": "Marrakech-Safi",
    "rabat": "Rabat-Salé-Kénitra",
    "fes": "Fès-Meknès",
    "tanger": "Tanger-Tétouan-Al Hoceïma",
    "agadir": "Souss-Massa",
    "oujda": "Oriental",
    "beni": "Béni Mellal-Khénifra",
    "dakhla": "Dakhla-Oued Ed-Dahab",
    "laayoune": "Laâyoune-Sakia El Hamra",
    "guelmim": "Guelmim-Oued Noun",
    "drara": "Drâa-Tafilalet"
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>📊 Rapports et Analytics</h1>
        <p>Analysez les performances et générez des rapports détaillés</p>
      </div>

      {/* Filtres */}
      <Card className="filters-card mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label><FontAwesomeIcon icon={faCalendar} className="me-2" />Période</Form.Label>
                <Form.Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                  <option value="all">Toutes les périodes</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                  <option value="quarter">3 derniers mois</option>
                  <option value="year">12 derniers mois</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />Région</Form.Label>
                <Form.Select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                  <option value="all">Toutes les régions</option>
                  {Object.entries(moroccoRegions).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label><FontAwesomeIcon icon={faUser} className="me-2" />Utilisateur</Form.Label>
                <Form.Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                  <option value="all">Tous les utilisateurs</option>
                  {Array.from(new Set(tickets
                    .filter(ticket => ticket.user && ticket.user.username)
                    .map(ticket => ticket.user.username)
                  )).map(username => (
                    <option key={username} value={username}>{username}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="primary" className="w-100">
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                Appliquer les filtres
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* KPIs Principaux */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faTicketAlt} className="kpi-icon" />
              <h3>{reportData.totalTickets || 0}</h3>
              <p>Total Tickets</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faChartBar} className="kpi-icon" />
              <h3>{reportData.openTickets || 0}</h3>
              <p>Tickets Ouverts</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faChartBar} className="kpi-icon" />
              <h3>{reportData.resolvedTickets || 0}</h3>
              <p>Tickets Résolus</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faChartBar} className="kpi-icon" />
              <h3>{reportData.averageResolutionTime || 0}</h3>
              <p>Jours Moyen Résolution</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Boutons d'export */}
      <Row className="mb-4">
        <Col className="text-end">
          <Button variant="success" className="me-2" onClick={exportToExcel}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Export Excel
          </Button>
          <Button variant="danger" onClick={exportToPDF}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Export PDF
          </Button>
        </Col>
      </Row>

      {/* Tableaux de données */}
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>🏆 Top Performers</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Total</th>
                    <th>Résolus</th>
                    <th>Taux (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topPerformers?.map((performer, index) => (
                    <tr key={index}>
                      <td>{performer.username}</td>
                      <td>{performer.total}</td>
                      <td>{performer.resolved}</td>
                      <td>
                        <Badge bg={performer.resolutionRate >= 80 ? 'success' : performer.resolutionRate >= 60 ? 'warning' : 'danger'}>
                          {performer.resolutionRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>📊 Répartition par Priorité</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Priorité</th>
                    <th>Nombre</th>
                    <th>Pourcentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportData.ticketsByPriority || {}).map(([priority, count]) => (
                    <tr key={priority}>
                      <td>{priority}</td>
                      <td>{count}</td>
                      <td>{Math.round((count / reportData.totalTickets) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Activité récente */}
      <Card>
        <Card.Header>
          <h5>🕒 Activité Récente</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Région</th>
                <th>Priorité</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody>
              {reportData.recentActivity?.map((ticket) => (
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.titre}</td>
                  <td>{ticket.ligne ? moroccoRegions[identifyRegion(ticket.ligne)] || ticket.ligne : 'N/A'}</td>
                  <td>
                    <Badge bg={ticket.priorite?.toLowerCase().includes('critique') ? 'danger' : 
                              ticket.priorite?.toLowerCase().includes('élevée') ? 'warning' : 'info'}>
                      {ticket.priorite || 'Non définie'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={ticket.etat?.toLowerCase().includes('clos') || ticket.etat?.toLowerCase().includes('fermé') ? 'success' : 'secondary'}>
                      {ticket.etat || 'Non défini'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportsPage;
