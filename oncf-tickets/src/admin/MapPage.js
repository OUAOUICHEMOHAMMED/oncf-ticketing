import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';

// Icônes personnalisées pour les marqueurs (sans emojis pour éviter les erreurs d'encodage)
const createCustomIcon = (color = '#8B5CF6') => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
        <circle cx="16" cy="16" r="3" fill="${color}"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const MapPage = ({ tickets, users }) => {
  const [regionStats, setRegionStats] = useState({});
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Données des régions marocaines (simplifiées)
  const moroccoRegions = {
    "casa": { name: "Casablanca-Settat", center: [33.5731, -7.5898], flag: "🇲🇦" },
    "marakech": { name: "Marrakech-Safi", center: [31.6295, -7.9811], flag: "🇲🇦" },
    "rabat": { name: "Rabat-Salé-Kénitra", center: [34.0209, -6.8416], flag: "🇲🇦" },
    "fes": { name: "Fès-Meknès", center: [34.0181, -5.0078], flag: "🇲🇦" },
    "tanger": { name: "Tanger-Tétouan-Al Hoceïma", center: [35.7595, -5.8340], flag: "🇲🇦" },
    "agadir": { name: "Souss-Massa", center: [30.4278, -9.5981], flag: "🇲🇦" },
    "oujda": { name: "Oriental", center: [34.6814, -1.9086], flag: "🇲🇦" },
    "beni": { name: "Béni Mellal-Khénifra", center: [32.3373, -6.3498], flag: "🇲🇦" },
    "dakhla": { name: "Dakhla-Oued Ed-Dahab", center: [23.6847, -15.9579], flag: "🇲🇦" },
    "laayoune": { name: "Laâyoune-Sakia El Hamra", center: [27.1537, -13.2034], flag: "🇲🇦" },
    "guelmim": { name: "Guelmim-Oued Noun", center: [28.9871, -10.0574], flag: "🇲🇦" },
    "drara": { name: "Drâa-Tafilalet", center: [31.1728, -4.0000], flag: "🇲🇦" }
  };

  useEffect(() => {
    calculateRegionStats();
  }, [tickets]);

  const calculateRegionStats = () => {
    const stats = {};
    
    tickets.forEach(ticket => {
      if (ticket.ligne) {
        // Parser la ligne pour identifier la région
        const region = identifyRegion(ticket.ligne);
        if (region && moroccoRegions[region]) {
          if (!stats[region]) {
            stats[region] = { count: 0, tickets: [] };
          }
          stats[region].count++;
          stats[region].tickets.push(ticket);
        }
      }
    });
    
    setRegionStats(stats);
  };

  const identifyRegion = (ligne) => {
    const ligneLower = ligne.toLowerCase();
    
    // Mapping des lignes vers les régions
    if (ligneLower.includes('casa') || ligneLower.includes('settat')) return 'casa';
    if (ligneLower.includes('marakech') || ligneLower.includes('safi')) return 'marakech';
    if (ligneLower.includes('rabat') || ligneLower.includes('sale') || ligneLower.includes('kenitra')) return 'rabat';
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

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
  };

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>🗺️ Carte du Maroc - Répartition des Tickets</h1>
        <p>Visualisez la distribution des tickets par région</p>
      </div>
      
      <div className="map-container">
        <MapContainer 
          center={[31.7917, -7.0926]} 
          zoom={6} 
          style={{ height: '80vh', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Marqueurs pour chaque région */}
          {Object.keys(moroccoRegions).map(regionKey => {
            const region = moroccoRegions[regionKey];
            const stats = regionStats[regionKey] || { count: 0, tickets: [] };
            
            // Couleur différente selon le nombre de tickets
            let markerColor = '#8B5CF6'; // Violet par défaut
            if (stats.count > 0) {
              if (stats.count > 5) markerColor = '#EF4444'; // Rouge pour beaucoup de tickets
              else if (stats.count > 2) markerColor = '#F59E0B'; // Orange pour quelques tickets
              else markerColor = '#10B981'; // Vert pour peu de tickets
            }
            
            return (
              <Marker
                key={regionKey}
                position={region.center}
                icon={createCustomIcon(markerColor)}
                eventHandlers={{
                  click: () => handleRegionClick(regionKey)
                }}
              >
                <Popup>
                  <div className="region-popup">
                    <h4>🏛️ {region.name}</h4>
                    <p><strong>📊 Tickets: {stats.count}</strong></p>
                    {stats.count > 0 && (
                      <div>
                        <p>🎫 Derniers tickets:</p>
                        <ul>
                          {stats.tickets.slice(0, 3).map(ticket => (
                            <li key={ticket.id}>#{ticket.id} - {ticket.titre}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      
      {/* Panneau des statistiques */}
      <div className="stats-panel">
        <h3>📊 Statistiques par Région</h3>
        <div className="stats-grid">
          {Object.keys(moroccoRegions).map(regionKey => {
            const region = moroccoRegions[regionKey];
            const stats = regionStats[regionKey] || { count: 0 };
            
            return (
              <div 
                key={regionKey} 
                className={`stat-card ${selectedRegion === regionKey ? 'selected' : ''}`}
                onClick={() => handleRegionClick(regionKey)}
              >
                <div className="region-flag">🏛️</div>
                <div className="region-name">{region.name}</div>
                <div className="ticket-count">
                  {stats.count > 0 ? `📊 ${stats.count} tickets` : '📊 Aucun ticket'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
