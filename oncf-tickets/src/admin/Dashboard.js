import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Dashboard.css';
import { faTicketAlt, faCheckCircle, faUsers, faUserShield, faPlusCircle, faExclamationTriangle, faClock, faChartLine, faCloud, faFileAlt, faEllipsisH, faUser, faCalendarAlt, faSignOutAlt, faEnvelope, faCrown, faPlus, faSun, faMoon, faEye, faInfo, faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

function Dashboard({
  totalTickets = 0,
  openTickets = 0,
  totalUsers = 0,
  adminUsers = 0,
  newTickets = 0,
  resolvedTickets = 0,
  tickets = [],
  users = [], // Added this prop
  currentUser = { name: 'Admin', email: 'admin@oncf.ma' },
  onNavigateToTickets = () => {},
  onLogout = () => {}
}) {
  // Logs de débogage pour vérifier les props reçues
  console.log('🚀 === DASHBOARD PROPS RECEIVED ===');
  console.log('🚀 totalTickets:', totalTickets);
  console.log('🚀 openTickets:', openTickets);
  console.log('🚀 totalUsers:', totalUsers);
  console.log('🚀 adminUsers:', adminUsers);
  console.log('🚀 newTickets:', newTickets);
  console.log('🚀 resolvedTickets:', resolvedTickets);
  console.log('🚀 tickets (array):', tickets);
  console.log('🚀 tickets.length:', tickets.length);
  console.log('🚀 users (array):', users);
  console.log('🚀 users.length:', users.length);
  console.log('🚀 currentUser:', currentUser);
  console.log('🚀 === FIN PROPS ===\n');
  
  // Logs de débogage pour voir la structure des tickets
  if (tickets.length > 0) {
    console.log('🔍 === STRUCTURE DU PREMIER TICKET ===');
    console.log('🔍 Premier ticket:', tickets[0]);
    console.log('🔍 Clés disponibles:', Object.keys(tickets[0]));
    console.log('🔍 dateCreation:', tickets[0].dateCreation);
    console.log('🔍 etat:', tickets[0].etat);
    console.log('🔍 === FIN STRUCTURE ===\n');
  }

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // États pour les dates de filtrage
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDayOfMonth.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // État pour forcer la mise à jour de l'interface
  const [filterApplied, setFilterApplied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Clé pour forcer le rafraîchissement
  
  // États séparés pour les métriques filtrées
  const [filteredMetrics, setFilteredMetrics] = useState({
    resolved: 0,
    open: 0,
    new: 0,
    critical: 0
  });
  
  // Filtrer les tickets selon les dates sélectionnées
  const filteredTickets = tickets.filter(ticket => {
    // Si le ticket n'a pas de date de création, l'exclure du filtre
    if (!ticket.dateCreation) {
      console.log('🔍 Ticket sans date:', ticket.id, '- EXCLU du filtre');
      return false; // Exclure les tickets sans date
    }
    
    const ticketDate = new Date(ticket.dateCreation);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ajuster l'heure pour inclure toute la journée
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    const isInRange = ticketDate >= start && ticketDate <= end;
    
    if (isInRange) {
      console.log('🔍 Ticket dans la plage:', ticket.id, ticketDate.toISOString().split('T')[0]);
    } else {
      console.log('🔍 Ticket hors plage:', ticket.id, ticketDate.toISOString().split('T')[0]);
    }
    
    return isInRange;
  });
  
  // Si aucun ticket n'a de date, créer un filtre alternatif basé sur l'ID
  const alternativeFilteredTickets = tickets.filter(ticket => {
    if (!ticket.dateCreation) {
      // Filtre alternatif : considérer les tickets avec ID élevé comme "récents"
      const isHighId = ticket.id > Math.max(...tickets.map(t => t.id)) - 5;
      console.log('🔍 Ticket sans date (filtre alternatif):', ticket.id, 'ID élevé:', isHighId);
      return isHighId;
    }
    return false;
  });
  
  // Utiliser le filtre principal ou le filtre alternatif
  const finalFilteredTickets = filteredTickets.length > 0 ? filteredTickets : alternativeFilteredTickets;
  
  console.log('🔍 === RÉSULTAT DU FILTRAGE ===');
  console.log('🔍 Tickets avec dates filtrés:', filteredTickets.length);
  console.log('🔍 Tickets sans dates (filtre alternatif):', alternativeFilteredTickets.length);
  console.log('🔍 Total final filtré:', finalFilteredTickets.length);
  console.log('🔍 === FIN FILTRAGE ===\n');
  
  // Mettre à jour les métriques selon les dates filtrées
  const updateMetricsForDateRange = () => {
    console.log('📅 === APPLICATION DU FILTRE DE DATES ===');
    console.log('📅 Période sélectionnée:', startDate, 'à', endDate);
    console.log('📅 Tickets totaux disponibles:', tickets.length);
    console.log('📅 Tickets dans la plage:', finalFilteredTickets.length);
    console.log('📅 Tickets exclus du filtre:', tickets.length - finalFilteredTickets.length);
    
    // Debug: Vérifier quelques tickets pour voir leur structure
    if (tickets.length > 0) {
      console.log('🔍 === STRUCTURE DES TICKETS ===');
      console.log('🔍 Premier ticket:', tickets[0]);
      console.log('🔍 Premier ticket dateCreation:', tickets[0].dateCreation);
      console.log('🔍 Premier ticket type dateCreation:', typeof tickets[0].dateCreation);
      
      // Vérifier quelques tickets avec dates
      const ticketsWithDates = tickets.filter(t => t.dateCreation);
      console.log('🔍 Tickets avec dateCreation:', ticketsWithDates.length);
      if (ticketsWithDates.length > 0) {
        console.log('🔍 Premier ticket avec date:', ticketsWithDates[0]);
        console.log('🔍 Date parsée:', new Date(ticketsWithDates[0].dateCreation));
      }
      console.log('🔍 === FIN STRUCTURE ===\n');
    }
    
    // Calculer les nouvelles métriques filtrées
    const newFilteredMetrics = {
      resolved: finalFilteredTickets.filter(ticket => {
        const isResolved = ticket.etat && (
          ticket.etat.toLowerCase().includes('résolu') ||
          ticket.etat.toLowerCase().includes('clos') ||
          ticket.etat.toLowerCase().includes('fermé')
        );
        return isResolved;
      }).length,
      
      open: finalFilteredTickets.filter(ticket => {
        const isOpen = ticket.etat && !ticket.etat.toLowerCase().includes('clos') && 
                      !ticket.etat.toLowerCase().includes('fermé') && 
                      !ticket.etat.toLowerCase().includes('résolu');
        return isOpen;
      }).length,
      
      new: finalFilteredTickets.filter(ticket => {
        if (!ticket.dateCreation) return false;
        const creationTime = new Date(ticket.dateCreation);
        const now = new Date();
        const hoursDiff = (now - creationTime) / (1000 * 60 * 60);
        return hoursDiff < 24;
      }).length,
      
      critical: finalFilteredTickets.filter(ticket => {
        return ticket.priorite && ticket.priorite.toLowerCase().includes('critique');
      }).length
    };
    
    // Debug: Comparer les métriques avant/après
    console.log('📊 === COMPARAISON MÉTRIQUES ===');
    console.log('📊 AVANT (métriques complètes):');
    console.log('📊 - Résolus:', resolvedTicketsCount);
    console.log('📊 - Ouverts:', openTicketsCount);
    console.log('📊 - Nouveaux:', newTicketsCount);
    console.log('📊 APRÈS (métriques filtrées):');
    console.log('📊 - Résolus:', newFilteredMetrics.resolved);
    console.log('📊 - Ouverts:', newFilteredMetrics.open);
    console.log('📊 - Nouveaux:', newFilteredMetrics.new);
    console.log('📊 - Critiques:', newFilteredMetrics.critical);
    console.log('📊 === FIN COMPARAISON ===\n');
    
    // Mettre à jour les métriques filtrées
    setFilteredMetrics(newFilteredMetrics);
    
    // Marquer que le filtre a été appliqué
    setFilterApplied(true);
    
    // Forcer le rafraîchissement de l'interface
    setRefreshKey(prev => prev + 1);
    
    // SUPPRIMÉ: Message de confirmation qui cause des problèmes
    // setShowConfirmation(true);
    // setTimeout(() => setShowConfirmation(false), 3000);
    
    console.log('📅 Métriques filtrées calculées:', newFilteredMetrics);
    console.log('📅 === FILTRE APPLIQUÉ ===\n');
    
    // Forcer la mise à jour de l'interface
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };
  
  // Réinitialiser le filtre
  const resetFilter = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setFilterApplied(false);
    
    // Remettre les métriques filtrées à zéro
    setFilteredMetrics({
      resolved: 0,
      open: 0,
      new: 0,
      critical: 0
    });
    
    setRefreshKey(prev => prev + 1); // Forcer le rafraîchissement
    console.log('🔄 Filtre réinitialisé aux dates par défaut');
  };
  
  // Appeler la fonction quand les dates changent
  useEffect(() => {
    updateMetricsForDateRange();
  }, [startDate, endDate, tickets]);

  // Calculer les métriques de performance (TOUS les tickets)
  const resolvedTicketsCount = tickets.filter(ticket => {
    const isResolved = ticket.etat && (
      ticket.etat.toLowerCase().includes('résolu') ||
      ticket.etat.toLowerCase().includes('clos') ||
      ticket.etat.toLowerCase().includes('fermé')
    );
    return isResolved;
  }).length;

  const openTicketsCount = tickets.filter(ticket => {
    const isOpen = ticket.etat && !ticket.etat.toLowerCase().includes('clos') && 
                  !ticket.etat.toLowerCase().includes('fermé') && 
                  !ticket.etat.toLowerCase().includes('résolu');
    return isOpen;
  }).length;

  // Logs de débogage pour le total
  console.log('📊 === MÉTRIQUES CALCULÉES ===');
  console.log('📊 refreshKey:', refreshKey); // Pour voir si l'interface se rafraîchit
  console.log('📊 Tickets filtrés:', finalFilteredTickets.length);
  console.log('📊 Tickets résolus (filtrés):', resolvedTicketsCount);
  console.log('📊 Tickets ouverts (filtrés):', openTicketsCount);
  console.log('📊 === FIN MÉTRIQUES ===\n');
  
  // Logique corrigée avec fallback pour détecter les nouveaux tickets
  console.log('🚀 === DÉBUT ANALYSE NOUVEAUX TICKETS ===');
  console.log('🚀 Total tickets à analyser:', tickets.length);
  
  const newTicketsCount = finalFilteredTickets.filter(ticket => {
    console.log('🔍 === ANALYSE TICKET ===');
    console.log('🔍 Ticket ID:', ticket.id);
    console.log('🔍 Ticket état:', ticket.etat);
    console.log('🔍 Ticket dateCreation (brute):', ticket.dateCreation);
    console.log('🔍 Ticket dateCreation (type):', typeof ticket.dateCreation);
    
    // Option 1: Si le ticket a une date de création valide
    if (ticket.dateCreation) {
      const creationTime = new Date(ticket.dateCreation);
      const now = new Date();
      const hoursDiff = (now - creationTime) / (1000 * 60 * 60);
      
      // Option 1: Tickets TRÈS récents (moins de 1h)
      const isVeryRecent = hoursDiff < 1;
      
      // Option 2: Tickets créés aujourd'hui
      const isToday = creationTime.toDateString() === now.toDateString();
      
      // Considérer comme nouveau si très récent OU créé aujourd'hui
      const isRecent = isVeryRecent || isToday;
      
      console.log('🔍 Résultats avec date:', {
        hoursDiff: hoursDiff.toFixed(2),
        isVeryRecent: isVeryRecent,
        isToday: isToday,
        isRecent: isRecent
      });
      
      if (isRecent) {
        console.log('✅ Ticket DÉTECTÉ comme nouveau (avec date)!');
      } else {
        console.log('❌ Ticket PAS détecté comme nouveau (trop ancien)');
      }
      
      console.log('🔍 === FIN ANALYSE ===\n');
      return isRecent;
    }
    
    // Option 2: FALLBACK - Si pas de date, considérer comme nouveau si ouvert et ID élevé
    console.log('🔍 Pas de date - utilisation du fallback...');
    
    // Considérer comme nouveau si :
    // 1. Le ticket est ouvert (non résolu)
    // 2. L'ID est élevé (probablement récent)
    const isOpen = ticket.etat && !ticket.etat.toLowerCase().includes('clos') && 
                  !ticket.etat.toLowerCase().includes('fermé') && 
                  !ticket.etat.toLowerCase().includes('résolu');
    
    // Considérer comme "récent" si l'ID est dans les 5 plus élevés
    const ticketIds = finalFilteredTickets.map(t => t.id).sort((a, b) => b - a);
    const top5Ids = ticketIds.slice(0, 5);
    const isHighId = top5Ids.includes(ticket.id);
    
    const isRecentFallback = isOpen && isHighId;
    
    console.log('🔍 Résultats fallback:', {
      isOpen: isOpen,
      ticketId: ticket.id,
      top5Ids: top5Ids,
      isHighId: isHighId,
      isRecentFallback: isRecentFallback
    });
    
    if (isRecentFallback) {
      console.log('✅ Ticket DÉTECTÉ comme nouveau (fallback)!');
    } else {
      console.log('❌ Ticket PAS détecté comme nouveau (fallback)');
    }
    
    console.log('🔍 === FIN ANALYSE ===\n');
    return isRecentFallback;
  }).length;
  
  // Mettre à jour le total des tickets pour les calculs de pourcentage
  const totalTicketsForRange = finalFilteredTickets.length;
  
  const resolutionRatePercent = totalTicketsForRange > 0 ? Math.round((resolvedTicketsCount / totalTicketsForRange) * 100) : 0;
  const openTicketsPercent = totalTicketsForRange > 0 ? Math.round((openTicketsCount / totalTicketsForRange) * 100) : 0;
  const newTicketsPercent = totalTicketsForRange > 0 ? Math.round((newTicketsCount / totalTicketsForRange) * 100) : 0;

  // Données pour les graphiques
  const lineData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Benguerir_Safi',
        data: [26, 37, 59, 60, 93, 8],
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        borderWidth: 0
      },
      {
        label: 'Casa_Jorf_Jadida',
        data: [20, 21, 21, 16, 21, 5],
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        borderWidth: 0
      },
      {
        label: 'Casa_Kenitra',
        data: [18, 18, 16, 15, 14, 3],
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        borderWidth: 0
      },
      {
        label: 'Casa_Marrakech',
        data: [11, 59, 15, 15, 12, 2],
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 0
      }
    ]
  };

  const equipmentData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Alimentation',
        data: [25, 35, 30, 28, 40, 8],
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        borderWidth: 0
      },
      {
        label: 'BSS_Radio',
        data: [20, 30, 25, 22, 35, 6],
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        borderWidth: 0
      },
      {
        label: 'Core',
        data: [15, 25, 20, 18, 30, 5],
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        borderWidth: 0
      },
      {
        label: 'Deconnexion',
        data: [15, 45, 47, 57, 75, 9],
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 0
      }
    ]
  };

  const criticalityData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Avertissement',
        data: [8, 15, 12, 10, 8, 2],
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 0
      },
      {
        label: 'Critique',
        data: [37, 89, 60, 76, 81, 20],
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 0
      },
      {
        label: 'Majeur',
        data: [30, 45, 49, 49, 28, 6],
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        borderWidth: 0
      },
      {
        label: 'Mineur',
        data: [20, 15, 12, 10, 8, 2],
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 0
      }
    ]
  };

  const companyData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'ODM',
        data: [56, 75, 62, 65, 100, 18],
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        borderWidth: 0
      },
      {
        label: 'Huawei',
        data: [19, 36, 33, 33, 52, 6],
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        borderWidth: 0
      },
      {
        label: 'ONCF',
        data: [15, 25, 20, 18, 30, 5],
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        borderWidth: 0
      },
      {
        label: 'Orange',
        data: [10, 20, 15, 12, 25, 4],
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 0
      }
    ]
  };

  const chartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Tickets Ouverts',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2
      },
      {
        label: 'Tickets Résolus',
        data: [8, 15, 12, 20, 18, 25],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2
      }
    ]
  };

  const categoryData = {
    labels: ['Infrastructure', 'Signalisation', 'Équipement', 'Logiciel'],
    datasets: [
      {
        label: 'Tickets par Catégorie',
        data: [35, 25, 20, 20],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const getNotificationCount = () => {
    let count = 0;
    
    console.log('🔍 Debug - Tickets disponibles:', tickets.length);
    console.log('🔍 Debug - Utilisateurs disponibles:', users.length);
    
    // Compter les tickets critiques (plus flexible)
    const criticalTickets = tickets.filter(ticket => {
      const isCritical = ticket.priorite && (
        ticket.priorite.toLowerCase().includes('critique') ||
        ticket.priorite.toLowerCase().includes('high') ||
        ticket.priorite.toLowerCase().includes('élevée')
      );
      if (isCritical) {
        console.log('🚨 Ticket critique trouvé:', ticket.id, ticket.priorite);
      }
      return isCritical;
    }).length;
    
    // Compter les tickets en attente (plus flexible)
    const now = new Date();
    const pendingTickets = tickets.filter(ticket => {
      // Vérifier si le ticket n'est pas fermé
      const isOpen = ticket.etat && !ticket.etat.toLowerCase().includes('clos') && 
                    !ticket.etat.toLowerCase().includes('fermé') && 
                    !ticket.etat.toLowerCase().includes('résolu');
      
      // Vérifier le temps d'attente (plus flexible)
      let isPending = false;
      if (ticket.dateCreation) {
        const creationTime = new Date(ticket.dateCreation);
        const hoursDiff = (now - creationTime) / (1000 * 60 * 60);
        isPending = hoursDiff >= 0; // Détecte tous les tickets ouverts, même 0h
      } else {
        // Si pas de date de création, considérer comme en attente
        isPending = isOpen;
      }
      
      if (isPending && isOpen) {
        console.log('⏰ Ticket en attente trouvé:', ticket.id, ticket.etat, 'Temps:', ticket.dateCreation ? Math.floor((now - new Date(ticket.dateCreation)) / (1000 * 60 * 60)) + 'h' : 'N/A');
      }
      
      return isPending && isOpen;
    }).length;
    
    // Compter les nouveaux utilisateurs (plus flexible)
    const newUsers = users.filter(user => {
      let isNew = false;
      if (user.dateCreation) {
        const creationTime = new Date(user.dateCreation);
        const hoursDiff = (now - creationTime) / (1000 * 60 * 60);
        isNew = hoursDiff < 48; // Étendu à 48h au lieu de 24h
      } else {
        // Si pas de date de création, considérer comme nouveau
        isNew = true;
      }
      
      if (isNew) {
        console.log('👤 Nouvel utilisateur trouvé:', user.username);
      }
      
      return isNew;
    }).length;
    
    // Ajouter des alertes pour les tickets récents (moins de 24h)
    const recentTickets = tickets.filter(ticket => {
      if (ticket.dateCreation) {
        const creationTime = new Date(ticket.dateCreation);
        const hoursDiff = (now - creationTime) / (1000 * 60 * 60);
        return hoursDiff < 24;
      }
      return false;
    }).length;
    
    // Ajouter des alertes pour les tickets très récents (0h)
    const veryRecentTickets = tickets.filter(ticket => {
      if (ticket.dateCreation) {
        const creationTime = new Date(ticket.dateCreation);
        const hoursDiff = (now - creationTime) / (1000 * 60 * 60);
        return hoursDiff < 1; // Tickets de moins d'1h
      }
      return false;
    }).length;
    
    count = criticalTickets + pendingTickets + newUsers + (recentTickets > 0 ? 1 : 0) + (veryRecentTickets > 0 ? 1 : 0);
    
    console.log('📊 Résumé des alertes:', {
      criticalTickets,
      pendingTickets,
      newUsers,
      recentTickets,
      veryRecentTickets,
      totalCount: count
    });
    
    return count > 0 ? count : 0;
  };

  const generateNotifications = () => {
    const notifications = [];
    
    console.log('🔍 Génération des notifications...');
    
    // 1. Tickets critiques (plus flexible)
    const criticalTickets = tickets.filter(ticket => {
      const isCritical = ticket.priorite && (
        ticket.priorite.toLowerCase().includes('critique') ||
        ticket.priorite.toLowerCase().includes('high') ||
        ticket.priorite.toLowerCase().includes('élevée')
      );
      return isCritical;
    }).slice(0, 2);
    
    criticalTickets.forEach(ticket => {
      notifications.push({
        type: 'danger',
        icon: faExclamationTriangle,
        title: `Ticket #${ticket.id} - Critique`,
        description: ticket.titre || 'Ticket sans titre',
        status: `Priorité: ${ticket.priorite || 'Non définie'}`,
        buttonType: 'primary',
        buttonText: 'Traiter',
        action: () => {
          onNavigateToTickets('tickets');
        }
      });
    });
    
    // 2. Tickets en attente (plus flexible)
    const now = new Date();
    const pendingTickets = tickets.filter(ticket => {
      const isOpen = ticket.etat && !ticket.etat.toLowerCase().includes('clos') && 
                    !ticket.etat.toLowerCase().includes('fermé') && 
                    !ticket.etat.toLowerCase().includes('résolu');
      
      let isPending = false;
      if (ticket.dateCreation) {
        const creationTime = new Date(ticket.dateCreation);
        const hoursDiff = (now - creationTime) / (1000 * 60 * 60);
        isPending = hoursDiff >= 0; // Détecte tous les tickets ouverts, même 0h
      } else {
        isPending = isOpen;
      }
      
      return isPending && isOpen;
    }).slice(0, 2);
    
    pendingTickets.forEach(ticket => {
      const creationTime = ticket.dateCreation ? new Date(ticket.dateCreation) : now;
      const hoursDiff = Math.floor((now - creationTime) / (1000 * 60 * 60));
      
      // Message adaptatif selon le temps d'attente
      let statusMessage = '';
      if (hoursDiff === 0) {
        statusMessage = 'Créé récemment';
      } else if (hoursDiff === 1) {
        statusMessage = 'En attente depuis 1h';
      } else {
        statusMessage = `En attente depuis ${hoursDiff}h`;
      }
      
      notifications.push({
        type: 'warning',
        icon: faClock,
        title: `Ticket #${ticket.id} - En attente`,
        description: ticket.titre || 'Ticket sans titre',
        status: statusMessage,
        buttonType: 'warning',
        buttonText: 'Assigner',
        action: () => {
          onNavigateToTickets('tickets');
        }
      });
    });
    
    // 3. Nouveaux utilisateurs (plus flexible)
    const newUsers = users.filter(user => {
      let isNew = false;
      if (user.dateCreation) {
        const creationTime = new Date(user.dateCreation);
        const hoursDiff = (now - creationTime) / (1000 * 60 * 60);
        isNew = hoursDiff < 48;
      } else {
        isNew = true;
      }
      return isNew;
    }).slice(0, 1);
    
    newUsers.forEach(user => {
      const creationTime = user.dateCreation ? new Date(user.dateCreation) : now;
      const hoursDiff = Math.floor((now - creationTime) / (1000 * 60 * 60));
      
      notifications.push({
        type: 'info',
        icon: faUser,
        title: 'Nouveau technicien',
        description: `${user.username || 'Utilisateur'} a rejoint l'équipe`,
        status: `Il y a ${hoursDiff}h`,
        buttonType: 'info',
        buttonText: 'Voir profil',
        action: () => {
          onNavigateToTickets('users');
        }
      });
    });
    
    // 4. Tickets récents (nouveaux)
    const recentTickets = tickets.filter(ticket => {
      if (ticket.dateCreation) {
        const creationTime = new Date(ticket.dateCreation);
        const hoursDiff = (now - creationTime) / (1000 * 60 * 60);
        return hoursDiff < 24;
      }
      return false;
    }).slice(0, 1);
    
    recentTickets.forEach(ticket => {
      const creationTime = new Date(ticket.dateCreation);
      const hoursDiff = Math.floor((now - creationTime) / (1000 * 60 * 60));
      
      // Message adaptatif selon le temps de création
      let statusMessage = '';
      if (hoursDiff === 0) {
        statusMessage = 'Créé il y a moins d\'1h';
      } else if (hoursDiff === 1) {
        statusMessage = 'Créé il y a 1h';
      } else {
        statusMessage = `Créé il y a ${hoursDiff}h`;
      }
      
      notifications.push({
        type: 'success',
        icon: faPlusCircle,
        title: `Nouveau Ticket #${ticket.id}`,
        description: ticket.titre || 'Ticket sans titre',
        status: statusMessage,
        buttonType: 'success',
        buttonText: 'Voir',
        action: () => {
          onNavigateToTickets('tickets');
        }
      });
    });
    
    console.log('📝 Notifications générées:', notifications.length);
    
    // Si pas assez de notifications, ajouter des notifications par défaut
    if (notifications.length < 3) {
      const remainingSlots = 3 - notifications.length;
      
      for (let i = 0; i < remainingSlots; i++) {
        notifications.push({
          type: 'secondary',
          icon: faInfo,
          title: 'Aucune alerte critique',
          description: 'Tous les systèmes fonctionnent normalement',
          status: 'Statut stable',
          buttonType: 'secondary',
          buttonText: 'Voir détails',
          action: () => {
            onNavigateToTickets('dashboard');
          }
        });
      }
    }
    
    return notifications.slice(0, 3);
  };

  return (
    <div className="container-fluid p-0 dashboard">
      {/* Barre utilitaire en haut */}
      <div className="bg-dark text-white py-2 px-4">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faCloud} />
              <span className="small">Publier</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faFileAlt} />
              <span className="small">Préparer les données pour l'IA</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary rounded px-2 py-1">
                <span className="small text-white">Copilot</span>
              </div>
            </div>
            <FontAwesomeIcon icon={faEllipsisH} />
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="small">{currentUser.name}</span>
            <button 
              className="btn btn-link text-white p-0 border-0"
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{ textDecoration: 'none' }}
              title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </button>
            <div className="position-relative">
              <button 
                className="btn btn-link text-white p-0 border-0"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ textDecoration: 'none' }}
              >
                <FontAwesomeIcon icon={faUser} />
              </button>
              
              {showUserMenu && (
                <div className="position-absolute top-100 end-0 mt-2 bg-white rounded shadow-lg border" style={{ minWidth: '250px', zIndex: 1000 }}>
                  <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                        <FontAwesomeIcon icon={faUser} className="text-white" />
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{currentUser.name || 'Utilisateur'}</div>
                        <div className="small text-muted">{currentUser.role || 'USER'}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center text-muted">
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      <span className="small">{currentUser.email || 'Aucun email'}</span>
                    </div>
                  </div>
                  <div className="p-2">
                    <button 
                      className="btn btn-link text-danger w-100 text-start p-2"
                      onClick={onLogout}
                      style={{ textDecoration: 'none' }}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header principal avec logo ONCF */}
      <div className="bg-primary text-white py-4 px-4">
        <div className="d-flex justify-content-between align-items-center">
          {/* Logo et branding */}
          <div className="d-flex align-items-center">
            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center me-4" style={{ width: '60px', height: '60px' }}>
              <img 
                src="/oncf-logo1.png" 
                alt="ONCF Logo" 
                style={{ width: '70px', height: '70px', objectFit: 'contain' }}
              />
            </div>
            <h3 className="mb-0 fw-bold">TicketPro</h3>
          </div>

          {/* Contrôles et KPIs */}
          <div className="d-flex align-items-center gap-5">
            {/* Sélecteur de dates */}
            <div className="d-flex align-items-center gap-4">
              <div className="d-flex flex-column">
                <label className="small text-white-50 mb-2">Date de début</label>
                <input 
                  type="date" 
                  className="form-control form-control-sm" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '160px', height: '40px' }}
                />
              </div>
              <div className="d-flex align-items-center gap-2">
              <div className="d-flex flex-column">
                <label className="small text-white-50 mb-2">Date de fin</label>
                <input 
                  type="date" 
                  className="form-control form-control-sm" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '160px', height: '40px' }}
                />
              </div>
                <div className="d-flex flex-column justify-content-end">
                  <button 
                    className="btn btn-primary btn-sm px-3 py-2" 
                    onClick={updateMetricsForDateRange}
                    style={{ height: '40px', marginTop: '24px' }}
                    title="Appliquer le filtre de dates"
                  >
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    Appliquer
                  </button>
                </div>
              </div>
              
              {/* Indicateur de filtre actif */}
              {/* SUPPRIMÉ: Message bloqué qui cause des problèmes d'affichage
              {filterApplied && finalFilteredTickets.length !== tickets.length && (
                <div className="d-flex align-items-center gap-2 bg-success bg-opacity-25 px-3 py-2 rounded border border-success">
                  <FontAwesomeIcon icon={faFilter} className="text-success" />
                  <span className="small text-success fw-bold">
                    ✅ Filtre APPLIQUÉ: {finalFilteredTickets.length} tickets sur {tickets.length} total
                  </span>
                  <span className="small text-success">
                    (Période: {startDate} à {endDate})
                  </span>
                  <button 
                    className="btn btn-sm btn-outline-success ms-2"
                    onClick={resetFilter}
                    title="Réinitialiser le filtre"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              )}
              */}
              
              {/* Indicateur de filtre en attente */}
              {!filterApplied && (startDate !== (() => {
                const today = new Date();
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                return firstDayOfMonth.toISOString().split('T')[0];
              })() || endDate !== (() => {
                const today = new Date();
                return today.toISOString().split('T')[0];
              })()) && (
                <div className="d-flex align-items-center gap-2 bg-warning bg-opacity-25 px-3 py-2 rounded border border-warning">
                  <FontAwesomeIcon icon={faClock} className="text-warning" />
                  <span className="small text-warning fw-bold">
                    ⏳ Filtre en attente - Cliquez "Appliquer" pour voir les changements
                  </span>
                </div>
              )}
              
              {/* Bouton de réinitialisation simple */}
              {filterApplied && (
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={resetFilter}
                  title="Réinitialiser le filtre"
                >
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Réinitialiser
                </button>
              )}
              
              {/* Message de confirmation */}
              {/* {showConfirmation && (
                <div className="d-flex align-items-center gap-2 bg-success bg-opacity-25 px-3 py-2 rounded border border-success animate__animated animate__fadeIn">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
                  <span className="small text-success fw-bold">
                    ✅ Filtre appliqué avec succès ! Les métriques ont été mises à jour.
                  </span>
                </div>
              )} */}
            </div>

            {/* Cartes KPI flottantes avec vraies données */}
            <div className="d-flex gap-4">
              <div className="bg-white text-dark rounded-3 px-4 py-3 shadow-sm" style={{ minWidth: '140px' }}>
                <div className="small text-muted mb-1">Incidents résolus</div>
                <div className="h3 mb-0 fw-bold text-success">{resolvedTicketsCount}</div>
                <small className="text-muted">sur {totalTicketsForRange} tickets</small>
              </div>
              <div className="bg-white text-dark rounded-3 px-4 py-3 shadow-sm" style={{ minWidth: '140px' }}>
                <div className="small text-muted mb-1">Incidents en cours</div>
                <div className="h3 mb-0 fw-bold text-warning">{openTicketsCount}</div>
                <small className="text-muted">sur {totalTicketsForRange} tickets</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container-fluid py-4">
        {/* En-tête avec informations et actions */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h1 className="h3 mb-1 fw-bold text-dark">Tableau de Bord</h1>
            <p className="text-muted mb-0 small">Vue d'ensemble des tickets et utilisateurs</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <small className="text-muted d-block">Dernière mise à jour :</small>
              <small className="text-dark fw-bold">{new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</small>
            </div>
            <button className="btn btn-primary px-3 py-2" onClick={() => onNavigateToTickets('tickets')}>
              <FontAwesomeIcon icon={faEye} className="me-2" />
              Vue sur les tickets
            </button>
          </div>
        </div>

        {/* Indicateurs Clés (KPIs) */}
        <div className="row g-3 mb-3">
          <div className="col-lg-3 col-md-6">
            <div className="card bg-gradient-primary text-white border-0 shadow">
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title text-white-50 mb-1 small">Tickets Résolus</h6>
                    <h3 className="mb-0 fw-bold" key={`resolved-${refreshKey}`}>
                      {filterApplied ? filteredMetrics.resolved : resolvedTicketsCount}
                    </h3>
                    <div className="d-flex align-items-center mt-1">
                      <span className="text-dark bg-warning px-1 py-0 rounded me-1 fw-bold small">
                        ↗ {filterApplied && finalFilteredTickets.length > 0 ? 
                          Math.round((filteredMetrics.resolved / finalFilteredTickets.length) * 100) : 
                          resolutionRatePercent}%
                      </span>
                      <small className="text-dark bg-white px-1 py-0 rounded small">de taux</small>
                    </div>
                    {filterApplied && finalFilteredTickets.length !== tickets.length && (
                      <small className="text-white-50 d-block mt-1">
                        📅 Période: {startDate} à {endDate}
                      </small>
                    )}
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card bg-gradient-warning text-white border-0 shadow">
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title text-white-50 mb-1 small">Tickets en Cours</h6>
                    <h3 className="mb-0 fw-bold" key={`open-${refreshKey}`}>
                      {filterApplied ? filteredMetrics.open : openTicketsCount}
                    </h3>
                    <div className="d-flex align-items-center mt-1">
                      <span className="text-dark bg-white px-1 py-0 rounded me-1 fw-bold small">
                        ↘ {filterApplied && finalFilteredTickets.length > 0 ? 
                          Math.round((filteredMetrics.open / finalFilteredTickets.length) * 100) : 
                          openTicketsPercent}%
                      </span>
                      <small className="text-dark bg-white px-1 py-0 rounded small">en attente</small>
                    </div>
                    {filterApplied && finalFilteredTickets.length !== tickets.length && (
                      <small className="text-white-50 d-block mt-1">
                        📅 Période: {startDate} à {endDate}
                      </small>
                    )}
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card bg-gradient-danger text-white border-0 shadow">
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title text-white-50 mb-1 small">Tickets Critiques</h6>
                    <h3 className="mb-0 fw-bold" key={`critical-${refreshKey}`}>
                      {filterApplied ? filteredMetrics.critical : 
                        tickets.filter(t => t.priorite && t.priorite.toLowerCase().includes('critique')).length}
                    </h3>
                    <div className="d-flex align-items-center mt-1">
                      <span className="text-dark bg-warning px-1 py-0 rounded me-1 fw-bold small">
                        ↗ {filterApplied ? filteredMetrics.critical : 
                          tickets.filter(t => t.priorite && t.priorite.toLowerCase().includes('critique')).length}
                      </span>
                      <small className="text-dark bg-white px-1 py-0 rounded small">Nécessitent attention</small>
                    </div>
                    {filterApplied && finalFilteredTickets.length !== tickets.length && (
                      <small className="text-white-50 d-block mt-1">
                        📅 Période: {startDate} à {endDate}
                      </small>
                    )}
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card bg-gradient-info text-white border-0 shadow">
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title text-white-50 mb-1 small">Nouveaux Tickets</h6>
                    <h3 className="mb-0 fw-bold" key={`new-${refreshKey}`}>
                      {filterApplied ? filteredMetrics.new : newTicketsCount}
                    </h3>
                    <div className="d-flex align-items-center mt-1">
                      <span className="text-dark bg-success px-1 py-0 rounded me-1 fw-bold small">
                        ↗ {filterApplied ? filteredMetrics.new : newTicketsCount}
                      </span>
                      <small className="text-dark bg-white px-1 py-0 rounded small">Aujourd'hui</small>
                    </div>
                    {filterApplied && finalFilteredTickets.length !== tickets.length && (
                      <small className="text-white-50 d-block mt-1">
                        📅 Période: {startDate} à {endDate}
                      </small>
                    )}
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <FontAwesomeIcon icon={faPlusCircle} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes et Notifications */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 d-flex align-items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 text-warning" />
                  Alertes et Notifications
                </h5>
                <span className="badge bg-danger">{getNotificationCount()} nouvelles</span>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {generateNotifications().map((notification, index) => (
                    <div key={index} className="list-group-item d-flex align-items-center py-3">
                      <div className={`bg-${notification.type} rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px' }}>
                        <FontAwesomeIcon icon={notification.icon} className="text-white" />
                    </div>
                    <div className="flex-grow-1">
                        <h6 className="mb-1">{notification.title}</h6>
                        <p className="mb-1 text-muted">{notification.description}</p>
                        <small className={`text-${notification.type}`}>{notification.status}</small>
                    </div>
                      <button 
                        className={`btn btn-sm btn-outline-${notification.buttonType}`}
                        onClick={notification.action}
                      >
                        {notification.buttonText}
                      </button>
                  </div>
                  ))}
                    </div>
                {getNotificationCount() === 0 && (
                  <div className="text-center py-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-success mb-2" style={{ fontSize: '2rem' }} />
                    <p className="text-muted mb-0">Aucune alerte en cours</p>
                    <small className="text-muted">Tous les systèmes fonctionnent normalement</small>
                    </div>
                )}
                  </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-transparent border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-success" />
                  Performance
                  {finalFilteredTickets.length !== tickets.length && (
                    <span className="badge bg-warning ms-2">
                      📅 Filtre actif
                    </span>
                  )}
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Objectif de résolution</span>
                    <span className="fw-bold text-success">{resolutionRatePercent}%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${resolutionRatePercent}%` }}
                    ></div>
                  </div>
                  {finalFilteredTickets.length !== tickets.length && (
                    <small className="text-muted d-block mt-1">
                      📅 Basé sur {finalFilteredTickets.length} tickets (période: {startDate} à {endDate})
                    </small>
                  )}
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Tickets en cours</span>
                    <span className="fw-bold text-primary">{openTicketsCount}</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${openTicketsPercent}%` }}></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Nouveaux tickets</span>
                    <span className="fw-bold text-warning">{newTicketsCount}</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-warning" style={{ width: `${newTicketsPercent}%` }}></div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <button className="btn btn-outline-primary btn-sm" onClick={() => onNavigateToTickets('tickets')}>
                    <FontAwesomeIcon icon={faChartLine} className="me-2" />
                    Voir rapport complet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="row g-4">
          {/* Graphique 1: Tickets par ligne */}
          <div className="col-lg-6">
            <div className="card bg-white border-0 shadow-sm h-100" style={{ borderRadius: '8px' }}>
              <div className="card-header bg-white border-0" style={{ padding: '20px 24px 0' }}>
                <h5 className="text-dark mb-0 d-flex align-items-center fw-bold">
                  <FontAwesomeIcon icon={faChartLine} className="me-2" style={{ color: '#6366f1' }} />
                  Évolution du nombre de tickets par ligne
                </h5>
                <p className="text-muted mb-0 mt-1 small">Analyse par ligne ferroviaire</p>
              </div>
              <div className="card-body" style={{ padding: '16px 24px 24px' }}>
                <div style={{ height: '300px' }}>
                  <Bar data={lineData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Graphique 2: Tickets par famille d'équipement */}
          <div className="col-lg-6">
            <div className="card bg-white border-0 shadow-sm h-100" style={{ borderRadius: '8px' }}>
              <div className="card-header bg-white border-0" style={{ padding: '20px 24px 0' }}>
                <h5 className="text-dark mb-0 d-flex align-items-center fw-bold">
                  <FontAwesomeIcon icon={faChartLine} className="me-2" style={{ color: '#8b5cf6' }} />
                  Évolution du nombre de tickets par famille d'équipement
                </h5>
                <p className="text-muted mb-0 mt-1 small">Répartition par type d'équipement</p>
              </div>
              <div className="card-body" style={{ padding: '16px 24px 24px' }}>
                <div style={{ height: '300px' }}>
                  <Bar data={equipmentData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Graphique 3: Tickets par criticité */}
          <div className="col-lg-6">
            <div className="card bg-white border-0 shadow-sm h-100" style={{ borderRadius: '8px' }}>
              <div className="card-header bg-white border-0" style={{ padding: '20px 24px 0' }}>
                <h5 className="text-dark mb-0 d-flex align-items-center fw-bold">
                  <FontAwesomeIcon icon={faChartLine} className="me-2" style={{ color: '#f59e0b' }} />
                  Évolution du nombre de tickets par criticité
                </h5>
                <p className="text-muted mb-0 mt-1 small">Niveaux de priorité et urgence</p>
              </div>
              <div className="card-body" style={{ padding: '16px 24px 24px' }}>
                <div style={{ height: '300px' }}>
                  <Bar data={criticalityData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Graphique 4: Tickets par entreprise */}
          <div className="col-lg-6">
            <div className="card bg-white border-0 shadow-sm h-100" style={{ borderRadius: '8px' }}>
              <div className="card-header bg-white border-0" style={{ padding: '20px 24px 0' }}>
                <h5 className="text-dark mb-0 d-flex align-items-center fw-bold">
                  <FontAwesomeIcon icon={faChartLine} className="me-2" style={{ color: '#10b981' }} />
                  Évolution du nombre de tickets par entreprise
                </h5>
                <p className="text-muted mb-0 mt-1 small">Analyse par partenaire</p>
              </div>
              <div className="card-body" style={{ padding: '16px 24px 24px' }}>
                <div style={{ height: '300px' }}>
                  <Bar data={companyData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 