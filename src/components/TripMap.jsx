import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Route, Locate, Layers, X } from 'lucide-react';

const TripMap = ({ markers = [], destination = '' }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const userMarker = useRef(null);
  const routingControl = useRef(null);
  const watchId = useRef(null);
  const destMarker = useRef(null);
  const [L, setL] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [routeFrom, setRouteFrom] = useState(null);
  const [routeTo, setRouteTo] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [mapLayer, setMapLayer] = useState('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const loadLeaflet = async () => {
      const leaflet = await import('leaflet');
      await import('leaflet-routing-machine');
      setL(leaflet.default || leaflet);
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !L || mapInstance.current) return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const defaultCenter = [20, 0];
    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      markers.length > 0 ? [markers[0].lat, markers[0].lng] : defaultCenter,
      markers.length > 0 ? 12 : 2
    );

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      map.remove();
      mapInstance.current = null;
      markersLayer.current = null;
    };
  }, [L]);

  // Geocode and highlight the destination when map is ready
  useEffect(() => {
    if (!mapInstance.current || !L || !destination) return;
    if (markers.length > 0) return; // Don't override if we have activity markers

    const geocodeDestination = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data.length === 0) return;

        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);

        if (destMarker.current) {
          mapInstance.current.removeLayer(destMarker.current);
        }

        const destIcon = L.divIcon({
          html: `<div style="position:relative;">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:3px solid white;border-radius:50%;box-shadow:0 4px 20px rgba(139,92,246,0.5);display:flex;align-items:center;justify-content:center;font-size:22px;">🌍</div>
            <div style="position:absolute;top:-4px;left:-4px;width:56px;height:56px;border:2px solid #8b5cf6;border-radius:50%;opacity:0.4;animation:pulse 2s infinite;"></div>
          </div>`,
          className: '',
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        destMarker.current = L.marker([latNum, lngNum], { icon: destIcon, zIndexOffset: 900 })
          .addTo(mapInstance.current)
          .bindPopup(`<div style="min-width:150px"><strong style="font-size:14px;">📍 ${destination}</strong><br/><span style="font-size:11px;color:#666">${display_name}</span></div>`);

        mapInstance.current.setView([latNum, lngNum], 11, { animate: true });
      } catch (e) {
        console.warn('Destination geocoding failed:', e);
      }
    };

    geocodeDestination();
  }, [L, destination, markers.length]);

  // Location search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstance.current || !L) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const flyToResult = (result) => {
    if (!mapInstance.current || !L) return;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    const searchIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:#f59e0b;border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">🔍</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([lat, lng], { icon: searchIcon })
      .addTo(mapInstance.current)
      .bindPopup(`<strong>${result.display_name.split(',').slice(0, 2).join(', ')}</strong>`)
      .openPopup();

    mapInstance.current.setView([lat, lng], 14, { animate: true });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Switch map tiles
  useEffect(() => {
    if (!mapInstance.current || !L) return;
    const tiles = {
      streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    };
    mapInstance.current.eachLayer(layer => {
      if (layer instanceof L.TileLayer) mapInstance.current.removeLayer(layer);
    });
    L.tileLayer(tiles[mapLayer] || tiles.streets, {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance.current);
  }, [mapLayer, L]);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current || !L || !markersLayer.current) return;
    markersLayer.current.clearLayers();

    const typeColors = { flight: '#3b82f6', hotel: '#10b981', activity: '#8b5cf6', transport: '#f59e0b' };
    const typeEmoji = { flight: '✈️', hotel: '🏨', activity: '🎯', transport: '🚗' };

    markers.forEach((m, idx) => {
      const color = typeColors[m.type] || '#8b5cf6';
      const emoji = typeEmoji[m.type] || '📍';
      const icon = L.divIcon({
        html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;">
          ${emoji}
        </div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([m.lat, m.lng], { icon })
        .addTo(markersLayer.current)
        .bindPopup(`
          <div style="min-width:160px;">
            <strong style="font-size:14px;">${m.title}</strong><br/>
            <span style="text-transform:capitalize;color:#666;font-size:12px;">${m.type}</span><br/>
            <div style="margin-top:8px;display:flex;gap:4px;">
              <button onclick="window.__tripMapRoute('to', ${m.lat}, ${m.lng}, '${m.title.replace(/'/g, "\\'")}')" 
                style="background:#0ea5e9;color:white;border:none;padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;">
                📍 Directions here
              </button>
            </div>
          </div>
        `);
    });

    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      mapInstance.current.fitBounds(bounds, { padding: [60, 60] });
    } else if (markers.length === 1) {
      mapInstance.current.setView([markers[0].lat, markers[0].lng], 12);
    }
  }, [markers, L]);

  // Global route handler for popup buttons
  useEffect(() => {
    window.__tripMapRoute = (direction, lat, lng, title) => {
      if (direction === 'to') {
        setRouteTo({ lat, lng, title });
        if (userLocation) {
          setRouteFrom({ lat: userLocation.lat, lng: userLocation.lng, title: 'My Location' });
        }
        setShowRoutePanel(true);
      }
    };
    return () => { delete window.__tripMapRoute; };
  }, [userLocation]);

  // Live location tracking
  const toggleTracking = useCallback(() => {
    if (!L || !mapInstance.current) return;

    if (tracking) {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      if (userMarker.current) {
        mapInstance.current.removeLayer(userMarker.current);
        userMarker.current = null;
      }
      setTracking(false);
      setUserLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    setTracking(true);

    const updatePosition = (pos) => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      setUserLocation({ lat, lng, accuracy });

      const pulseIcon = L.divIcon({
        html: `<div style="position:relative;">
          <div style="width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>
          <div style="position:absolute;top:-6px;left:-6px;width:30px;height:30px;border:2px solid #3b82f6;border-radius:50%;opacity:0.4;animation:pulse 2s infinite;"></div>
        </div>`,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      if (userMarker.current) {
        userMarker.current.setLatLng([lat, lng]);
      } else {
        userMarker.current = L.marker([lat, lng], { icon: pulseIcon, zIndexOffset: 1000 })
          .addTo(mapInstance.current)
          .bindPopup(`<strong>📍 You are here</strong><br/><span style="font-size:11px;color:#666;">Accuracy: ~${Math.round(accuracy)}m</span>`);
        mapInstance.current.setView([lat, lng], 14);
      }
    };

    navigator.geolocation.getCurrentPosition(updatePosition, () => {
      setTracking(false);
      alert('Unable to get your location');
    }, { enableHighAccuracy: true });

    watchId.current = navigator.geolocation.watchPosition(updatePosition, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });
  }, [L, tracking]);

  // Center on user
  const centerOnUser = () => {
    if (userLocation && mapInstance.current) {
      mapInstance.current.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
    }
  };

  // Calculate route
  const routePolyline = useRef(null);
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [routeLoading, setRouteLoading] = useState(false);

  const geocodeText = async (text) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), title: data[0].display_name.split(',')[0] };
  };

  const calculateRoute = useCallback(async () => {
    if (!L || !mapInstance.current) return;

    // Resolve from/to — prefer pre-set coords, else geocode text
    let from = routeFrom;
    let to = routeTo;

    try {
      setRouteLoading(true);
      setRouteInfo(null);

      if (!from && fromText.trim()) from = await geocodeText(fromText);
      if (!to && toText.trim()) to = await geocodeText(toText);

      if (!from || !to) {
        setRouteInfo({ error: 'Could not find one or both locations. Try being more specific.' });
        return;
      }

      // Draw "from" and "to" markers
      const fromIcon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;">A</div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 14],
      });
      const toIcon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;">B</div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 14],
      });

      if (markersLayer.current) {
        L.marker([from.lat, from.lng], { icon: fromIcon }).addTo(markersLayer.current)
          .bindPopup(`<strong>From: ${from.title}</strong>`);
        L.marker([to.lat, to.lng], { icon: toIcon }).addTo(markersLayer.current)
          .bindPopup(`<strong>To: ${to.title}</strong>`);
      }

      // Call OSRM routing API directly
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(osrmUrl);
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes?.length) {
        setRouteInfo({ error: 'Could not calculate route between these locations.' });
        return;
      }

      const route = data.routes[0];
      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = Math.round(route.duration / 60);
      const hours = Math.floor(durMin / 60);
      const mins = durMin % 60;

      // Draw route polyline
      if (routePolyline.current) mapInstance.current.removeLayer(routePolyline.current);
      routePolyline.current = L.geoJSON(route.geometry, {
        style: { color: '#3b82f6', weight: 5, opacity: 0.9 }
      }).addTo(mapInstance.current);

      // Fit map to route
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      mapInstance.current.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });

      // Extract steps from legs
      const steps = route.legs?.[0]?.steps?.slice(0, 8).map(s => s.maneuver?.instruction || s.name).filter(Boolean) || [];
      setRouteInfo({ distance: distKm, duration: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`, steps });
      setRouteFrom(from);
      setRouteTo(to);
    } catch (err) {
      console.error('Route error:', err);
      setRouteInfo({ error: 'Routing failed. Check your connection and try again.' });
    } finally {
      setRouteLoading(false);
    }
  }, [L, routeFrom, routeTo, fromText, toText]);

  const clearRoute = () => {
    if (routingControl.current && mapInstance.current) {
      mapInstance.current.removeControl(routingControl.current);
      routingControl.current = null;
    }
    setRouteFrom(null);
    setRouteTo(null);
    setRouteInfo(null);
    setShowRoutePanel(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* CSS for pulse animation */}
      <style>{`@keyframes pulse{0%{transform:scale(1);opacity:0.4}100%{transform:scale(2.5);opacity:0}}`}</style>
      
      {/* Map controls bar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <button onClick={toggleTracking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tracking ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:border-primary'
            }`}>
            <Navigation className="h-3.5 w-3.5" />
            {tracking ? 'Tracking On' : 'My Location'}
          </button>
          {userLocation && (
            <button onClick={centerOnUser}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-foreground hover:border-primary transition-all">
              <Locate className="h-3.5 w-3.5" /> Center
            </button>
          )}
          <button onClick={() => setShowRoutePanel(!showRoutePanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showRoutePanel ? 'bg-accent text-accent-foreground' : 'bg-card border border-border text-foreground hover:border-primary'
            }`}>
            <Route className="h-3.5 w-3.5" /> Directions
          </button>
        </div>
        <div className="flex items-center gap-1">
          {['streets', 'satellite', 'terrain'].map(layer => (
            <button key={layer} onClick={() => setMapLayer(layer)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium capitalize transition-all ${
                mapLayer === layer ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}>
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="p-3 border-b border-border bg-muted/20 relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (!e.target.value) setSearchResults([]); }}
              placeholder="🔍 Search for a place..."
              className="w-full border border-border rounded-xl px-4 py-2 text-xs bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none pr-8"
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button type="submit" disabled={searching}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50">
            {searching ? '...' : 'Search'}
          </button>
        </form>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-3 right-3 top-[calc(100%-8px)] z-[1000] bg-card border border-border rounded-xl shadow-xl overflow-hidden">
            {searchResults.map((result, i) => (
              <button key={i} onClick={() => flyToResult(result)}
                className="w-full text-left px-4 py-2.5 text-xs hover:bg-muted transition-all border-b border-border/50 last:border-0 flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span className="truncate text-foreground">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Directions panel */}
      {showRoutePanel && (
        <div className="p-3 border-b border-border bg-card space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Route className="h-4 w-4 text-primary" /> Get Directions
            </h4>
            <button onClick={clearRoute} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground ml-1">From</label>
              <div className="flex gap-2">
                <select value={routeFrom ? `${routeFrom.lat},${routeFrom.lng}` : ''}
                  onChange={e => {
                    if (e.target.value === 'me' && userLocation) {
                      setRouteFrom({ lat: userLocation.lat, lng: userLocation.lng, title: 'My Location' });
                      setFromText('');
                    } else if (e.target.value) {
                      const [lat, lng] = e.target.value.split(',').map(Number);
                      const m = markers.find(m => m.lat === lat && m.lng === lng);
                      setRouteFrom({ lat, lng, title: m?.title || 'Point' });
                      setFromText('');
                    } else {
                      setRouteFrom(null);
                    }
                  }}
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none min-w-0">
                  <option value="">Select activity...</option>
                  {userLocation && <option value="me">📍 My Location</option>}
                  {markers.map((m, i) => (
                    <option key={i} value={`${m.lat},${m.lng}`}>{m.title}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  value={fromText}
                  onChange={e => { setFromText(e.target.value); setRouteFrom(null); }}
                  placeholder="Or type address..."
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none min-w-0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground ml-1">To</label>
              <div className="flex gap-2">
                <select value={routeTo ? `${routeTo.lat},${routeTo.lng}` : ''}
                  onChange={e => {
                    if (e.target.value) {
                      const [lat, lng] = e.target.value.split(',').map(Number);
                      const m = markers.find(m => m.lat === lat && m.lng === lng);
                      setRouteTo({ lat, lng, title: m?.title || 'Point' });
                      setToText('');
                    } else {
                      setRouteTo(null);
                    }
                  }}
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none min-w-0">
                  <option value="">Select activity...</option>
                  {markers.map((m, i) => (
                    <option key={i} value={`${m.lat},${m.lng}`}>{m.title}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  value={toText}
                  onChange={e => { setToText(e.target.value); setRouteTo(null); }}
                  placeholder="Or type address..."
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none min-w-0"
                />
              </div>
            </div>
          </div>
          <button 
            onClick={calculateRoute} 
            disabled={routeLoading || (!routeFrom && !fromText.trim()) || (!routeTo && !toText.trim())}
            className="w-full gradient-primary text-primary-foreground py-2.5 rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
            {routeLoading ? (
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : <Navigation className="h-3.5 w-3.5" />}
            {routeLoading ? 'Calculating...' : 'Get Directions'}
          </button>
          {routeInfo && !routeInfo.error && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold text-foreground">🚗 {routeInfo.distance} km</span>
                <span className="font-semibold text-foreground">⏱️ {routeInfo.duration}</span>
              </div>
              {routeInfo.steps.length > 0 && (
                <div className="space-y-1">
                  {routeInfo.steps.map((step, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                      <span className="bg-primary/10 text-primary rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 text-[9px] font-bold mt-0.5">{i + 1}</span>
                      {step}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
          {routeInfo?.error && (
            <p className="text-xs text-destructive">Could not calculate route. Try different points.</p>
          )}
        </div>
      )}

      {/* Map */}
      {markers.length === 0 && !L ? (
        <div className="relative h-64 flex items-center justify-center bg-muted">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground font-medium">{destination}</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Add activities with coordinates to see them on the map</p>
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="h-[500px] w-full" />
      )}

      {/* Location info bar */}
      {userLocation && (
        <div className="px-3 py-2 border-t border-border bg-muted/30 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Live: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}</span>
          <span className="ml-auto">~{Math.round(userLocation.accuracy)}m accuracy</span>
        </div>
      )}
    </div>
  );
};

export default TripMap;
