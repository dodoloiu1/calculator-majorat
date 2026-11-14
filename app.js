/**
 * Calculator Servicii Foto Majorat - Photos by Dodo
 * https://www.instagram.com/photosby_dodo/
 *
 * FORMULA:
 * PREȚ = 200 + 80 × (ORE - 1) + 5 × max(0, PERSOANE - 30) + DEPLASARE + OPȚIUNI
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Dark Mode Handler ---
  const elBtnThemeToggle = document.getElementById('btnThemeToggle');
  
  if (elBtnThemeToggle) {
    elBtnThemeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateSliderFill(elGuestsSlider);
    });
  }

  // --- Lightbox Galerie ---
  const elLightbox = document.getElementById('galleryLightbox');
  const elLightboxImg = document.getElementById('lightboxImage');
  const elBtnCloseLightbox = document.getElementById('btnCloseLightbox');
  const galleryItems = document.querySelectorAll('.gallery-item');

  function openLightbox(src) {
    if (!elLightbox || !elLightboxImg) return;
    elLightboxImg.src = src;
    elLightbox.classList.remove('hidden');
    requestAnimationFrame(() => {
      elLightbox.classList.remove('opacity-0');
      elLightbox.classList.add('opacity-100');
    });
  }

  function closeLightbox() {
    if (!elLightbox) return;
    elLightbox.classList.remove('opacity-100');
    elLightbox.classList.add('opacity-0');
    setTimeout(() => {
      elLightbox.classList.add('hidden');
      if (elLightboxImg) elLightboxImg.src = '';
    }, 200);
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      if (src) openLightbox(src);
    });
  });

  if (elBtnCloseLightbox) {
    elBtnCloseLightbox.addEventListener('click', closeLightbox);
  }
  if (elLightbox) {
    elLightbox.addEventListener('click', (e) => {
      if (e.target === elLightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elLightbox && !elLightbox.classList.contains('hidden')) {
      closeLightbox();
    }
  });

  // --- DOM Elements ---
  const elEventDate = document.getElementById('inputEventDate');
  const elGuestsSlider = document.getElementById('inputGuestsSlider');
  const elGuestsDisplay = document.getElementById('txtGuestsDisplay');
  const elBtnMinus5 = document.getElementById('btnMinus5');
  const elBtnPlus5 = document.getElementById('btnPlus5');
  const elPersonRuleHint = document.getElementById('txtPersonRuleHint');

  const elSelectStart = document.getElementById('selectStartHour');
  const elSelectEnd = document.getElementById('selectEndHour');
  const elHoursTotalBadge = document.getElementById('txtHoursTotalBadge');
  const elAlertInvalidInterval = document.getElementById('alertInvalidInterval');

  // Location & Map Elements
  const elSelectLocationZone = document.getElementById('selectLocationZone');
  const elInputSearchAddress = document.getElementById('inputSearchAddress');
  const elBtnSearchAddress = document.getElementById('btnSearchAddress');
  const elLocationBadge = document.getElementById('txtLocationBadge');

  // Addons
  const elChkExpress = document.getElementById('chkExpressDelivery');
  const elChkPreSession = document.getElementById('chkPreSession');

  // Outputs
  const elGrandTotal = document.getElementById('txtGrandTotal');
  const elLblHoursExtra = document.getElementById('lblHoursExtraFormula');
  const elValHoursExtra = document.getElementById('valHoursExtraFormula');
  const elLblGuestsExtra = document.getElementById('lblGuestsExtraFormula');
  const elValGuestsExtra = document.getElementById('valGuestsExtraFormula');
  const elLblTransport = document.getElementById('lblTransportSummary');
  const elValTransport = document.getElementById('valTransportFormula');
  const elRowAddons = document.getElementById('rowAddonsSummary');
  const elValAddons = document.getElementById('valAddonsFormula');

  const elBtnCopyText = document.getElementById('btnCopyText');
  const elBtnWhatsapp = document.getElementById('btnSendWhatsapp');
  const elToast = document.getElementById('toast');

  // --- State ---
  let state = {
    date: '',
    guests: 30,
    startHour: 20,
    endHour: 2,
    locationZone: 'city', // 'city', 'zone1', 'zone2', 'zone3'
    locationName: 'București (în oraș)',
    transportCost: 0, // In oras se deconteaza cursa de UBER
    transportLabel: 'UBER',
    addons: {
      express: false, // 200 lei
      preSession: false // 150 lei
    }
  };

  const ZONE_CONFIG = {
    city: { cost: 0, displayVal: 'UBER', label: 'În oraș (UBER noapte)', desc: 'București (în oraș) - UBER' },
    zone1: { cost: 60, displayVal: '60 lei', label: 'Zona 1: Ilfov Apropiat (+60 lei)', desc: 'Zona 1: Ilfov Apropiat (Ghencea, Chiajna, Otopeni, etc.)' },
    zone2: { cost: 100, displayVal: '100 lei', label: 'Zona 2: Ilfov Exterior (+100 lei)', desc: 'Zona 2: Ilfov Exterior (Domnești, Corbeanca, Snagov, etc.)' },
    zone3: { cost: 150, displayVal: '150 lei', label: 'Zona 3: Peste 35 km (+150 lei)', desc: 'Zona 3: Peste 35 km / În afara Ilfovului' }
  };

  // Helper to compute duration across midnight safely
  function computeDuration(start, end) {
    let s = parseInt(start, 10);
    let e = parseInt(end, 10);
    if (s === e) {
      return 0;
    }
    if (e < s) {
      return (e + 24) - s;
    }
    return e - s;
  }

  // Update dynamic colored track on range input
  function updateSliderFill(el) {
    if (!el) return;
    const isDark = document.documentElement.classList.contains('dark');
    const min = parseFloat(el.min) || 15;
    const max = parseFloat(el.max) || 120;
    const val = parseFloat(el.value) || 30;
    const percentage = ((val - min) / (max - min)) * 100;
    
    const activeColor = isDark ? '#3b82f6' : '#1e3a8a';
    const trackColor = isDark ? '#334155' : '#e2e8f0';
    
    el.style.background = `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${percentage}%, ${trackColor} ${percentage}%, ${trackColor} 100%)`;
  }

  // Generate readable summary text
  function generateSummaryText() {
    const ORE = computeDuration(state.startHour, state.endHour);
    const total = elGrandTotal.textContent;
    const startFormatted = `${state.startHour}:00`;
    const endFormatted = state.endHour < 10 ? `0${state.endHour}:00` : `${state.endHour}:00`;

    let activeAddons = [];
    if (state.addons.express) activeAddons.push('Livrare Rapidă 24-48h (+200 lei)');
    if (state.addons.preSession) activeAddons.push('Mini-ședință Portret înainte (+150 lei)');

    const transportText = state.locationZone === 'city' ? 'UBER (decontare la final)' : `${state.transportCost} lei`;

    return `📸 ESTIMARE FOTO MAJORAT - PHOTOS BY DODO\n` +
      `-----------------------------------------\n` +
      (state.date ? `• Data evenimentului: ${state.date}\n` : '') +
      `• Număr persoane: ${state.guests} invitați\n` +
      `• Interval fotografiere: ${startFormatted} - ${endFormatted} (${ORE} ore)\n` +
      `• Sosire: cu 30 min înainte de ${startFormatted} pentru echipament\n` +
      `• Locație / Deplasare: ${state.locationName} (${transportText})\n` +
      (activeAddons.length > 0 ? `• Opțiuni suplimentare: ${activeAddons.join(', ')}\n` : '') +
      `• PREȚ ESTIMAT: ${total} LEI` + (state.locationZone === 'city' ? ' + UBER noapte\n' : '\n') +
      `-----------------------------------------\n` +
      `Instagram: https://www.instagram.com/photosby_dodo/`;
  }

  // --- Core Calculation ---
  function calculate() {
    const ORE = computeDuration(state.startHour, state.endHour);
    const isIntervalValid = ORE > 0;

    if (!isIntervalValid) {
      if (elAlertInvalidInterval) elAlertInvalidInterval.classList.remove('hidden');
      elGrandTotal.textContent = '0';
      elHoursTotalBadge.textContent = 'Interval invalid';
      return;
    } else {
      if (elAlertInvalidInterval) elAlertInvalidInterval.classList.add('hidden');
    }

    const PERSOANE = state.guests;
    const TRANSPORT = state.transportCost;

    const baseCost = 200; // prima oră
    const extraHours = Math.max(0, ORE - 1);
    const extraHoursCost = extraHours * 80;

    const extraGuests = Math.max(0, PERSOANE - 30);
    const extraGuestsCost = extraGuests * 5;

    let addonsCost = 0;
    if (state.addons.express) addonsCost += 200;
    if (state.addons.preSession) addonsCost += 150;

    const total = baseCost + extraHoursCost + extraGuestsCost + TRANSPORT + addonsCost;

    // Update Grand Total
    elGrandTotal.textContent = total.toLocaleString('ro-RO');

    // Update Hours Badge
    elHoursTotalBadge.textContent = `${ORE} ore de fotografiere`;

    // Update Formula Breakdown
    elLblHoursExtra.textContent = `• ${extraHours} ore suplimentare × 80 lei:`;
    elValHoursExtra.textContent = `${extraHoursCost} lei`;

    if (extraGuests > 0) {
      elLblGuestsExtra.textContent = `• ${extraGuests} persoane peste 30 × 5 lei:`;
      elValGuestsExtra.textContent = `+${extraGuestsCost} lei`;
      elPersonRuleHint.textContent = `+${extraGuestsCost} lei pentru cele ${extraGuests} persoane peste 30`;
    } else {
      elLblGuestsExtra.textContent = `• 0 persoane peste 30:`;
      elValGuestsExtra.textContent = `0 lei`;
      elPersonRuleHint.textContent = `30 persoane incluse în preț`;
    }

    // Transport row
    if (elValTransport) {
      elValTransport.textContent = state.locationZone === 'city' ? 'UBER' : `${TRANSPORT} lei`;
    }
    if (elLblTransport) {
      elLblTransport.textContent = state.locationZone === 'city'
        ? '• Deplasare în oraș (noaptea):'
        : `• Deplasare ${state.locationName}:`;
    }

    if (addonsCost > 0) {
      elRowAddons.classList.remove('hidden');
      elValAddons.textContent = `+${addonsCost} lei`;
    } else {
      elRowAddons.classList.add('hidden');
    }

    // Update WhatsApp link href
    if (elBtnWhatsapp) {
      const summary = generateSummaryText();
      elBtnWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(summary)}`;
    }
  }

  // --- Set Zone Logic ---
  function setZone(zoneKey, customLocationName) {
    if (!ZONE_CONFIG[zoneKey]) zoneKey = 'city';
    state.locationZone = zoneKey;
    state.transportCost = ZONE_CONFIG[zoneKey].cost;
    state.locationName = customLocationName || ZONE_CONFIG[zoneKey].desc;

    if (elSelectLocationZone) {
      elSelectLocationZone.value = zoneKey;
    }
    if (elLocationBadge) {
      elLocationBadge.textContent = ZONE_CONFIG[zoneKey].label;
      if (zoneKey === 'city') {
        elLocationBadge.className = 'text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-900';
      } else if (zoneKey === 'zone1') {
        elLocationBadge.className = 'text-xs font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-900';
      } else if (zoneKey === 'zone2') {
        elLocationBadge.className = 'text-xs font-mono font-bold text-orange-600 dark:text-orange-400 px-2 py-0.5 bg-orange-50 dark:bg-orange-950/40 rounded border border-orange-200 dark:border-orange-900';
      } else {
        elLocationBadge.className = 'text-xs font-mono font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900';
      }
    }

    calculate();
  }

  if (elSelectLocationZone) {
    elSelectLocationZone.addEventListener('change', (e) => {
      setZone(e.target.value);
    });
  }

  // Set guests with step 5
  function setGuests(val) {
    let g = parseInt(val, 10);
    g = Math.round(g / 5) * 5;
    if (g < 15) g = 15;
    if (g > 120) g = 120;

    state.guests = g;
    elGuestsSlider.value = g;
    elGuestsDisplay.textContent = `${g} pers`;
    updateSliderFill(elGuestsSlider);

    calculate();
  }

  // Event Listeners
  if (elEventDate) {
    elEventDate.addEventListener('change', (e) => {
      state.date = e.target.value;
      calculate();
    });
  }

  elGuestsSlider.addEventListener('input', (e) => {
    setGuests(e.target.value);
  });
  elGuestsSlider.addEventListener('change', (e) => {
    setGuests(e.target.value);
  });

  elBtnMinus5.addEventListener('click', () => {
    setGuests(state.guests - 5);
  });
  elBtnPlus5.addEventListener('click', () => {
    setGuests(state.guests + 5);
  });

  function onDropdownChange() {
    state.startHour = parseInt(elSelectStart.value, 10);
    state.endHour = parseInt(elSelectEnd.value, 10);
    calculate();
  }

  elSelectStart.addEventListener('change', onDropdownChange);
  elSelectEnd.addEventListener('change', onDropdownChange);

  // Addons Checkbox Events
  if (elChkExpress) {
    elChkExpress.addEventListener('change', (e) => {
      state.addons.express = e.target.checked;
      calculate();
    });
  }
  if (elChkPreSession) {
    elChkPreSession.addEventListener('change', (e) => {
      state.addons.preSession = e.target.checked;
      calculate();
    });
  }

  // Copy Calculation Action
  if (elBtnCopyText) {
    elBtnCopyText.addEventListener('click', () => {
      const text = generateSummaryText();
      navigator.clipboard.writeText(text).then(() => {
        if (elToast) {
          elToast.classList.remove('opacity-0');
          elToast.classList.add('opacity-100');
          setTimeout(() => {
            elToast.classList.remove('opacity-100');
            elToast.classList.add('opacity-0');
          }, 2400);
        }
      });
    });
  }

  // --- Point-in-Polygon Algorithm (Ray-Casting) ---
  function isPointInPolygon(point, polygon) {
    const x = point[0]; // lat
    const y = point[1]; // lon
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // --- Leaflet Map Integration cu Poligoane Reale Delimitate ---
  const CENTER_BUCHAREST = [44.4323, 26.1063]; // Piata Unirii
  let map = null;
  let clientMarker = null;

  function initMap() {
    const elMap = document.getElementById('map');
    if (!elMap || typeof L === 'undefined') return;

    map = L.map('map', {
      center: CENTER_BUCHAREST,
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    if (typeof GEO_BOUNDARIES !== 'undefined') {
      // 1. Poligon Județul Ilfov (Zonă bine delimitată)
      const polyIlfov = L.polygon(GEO_BOUNDARIES.ilfov, {
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.16,
        weight: 2
      }).addTo(map);
      polyIlfov.bindTooltip('Județul Ilfov (Zona Deplasare: +60 / +100 lei)', { sticky: true });

      // 2. Poligon Municipiul București (Zonă bine delimitată)
      const polyBucharest = L.polygon(GEO_BOUNDARIES.bucharest, {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.24,
        weight: 2.5
      }).addTo(map);
      polyBucharest.bindTooltip('Municipiul București (UBER)', { sticky: true });
    }

    // Center Reference Marker (Piața Unirii)
    L.circleMarker(CENTER_BUCHAREST, {
      radius: 6,
      color: '#1e3a8a',
      fillColor: '#ffffff',
      fillOpacity: 1,
      weight: 3
    }).addTo(map).bindPopup('<b>București Centru</b>');

    // Click on map to place marker
    map.on('click', (e) => {
      handleLocationSelected(e.latlng.lat, e.latlng.lng, 'Locație selectată pe hartă');
    });
  }

  // Calculate Distance & Determine Exact Zone based on Boundaries
  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function handleLocationSelected(lat, lon, label) {
    const distKm = calculateDistanceKm(CENTER_BUCHAREST[0], CENTER_BUCHAREST[1], lat, lon);
    const point = [lat, lon];
    
    let detectedZone = 'city';

    // Verificare geometrică exactă pe poligoanele reale
    const inBucharest = typeof GEO_BOUNDARIES !== 'undefined' && isPointInPolygon(point, GEO_BOUNDARIES.bucharest);
    const inIlfov = typeof GEO_BOUNDARIES !== 'undefined' && isPointInPolygon(point, GEO_BOUNDARIES.ilfov);

    if (inBucharest) {
      detectedZone = 'city';
    } else if (inIlfov) {
      // Dacă e în Ilfov, delimităm după distanța față de oraș
      // Sub 16km = Ilfov apropiat (+60 lei), peste 16km = Ilfov exterior (+100 lei)
      if (distKm <= 16) {
        detectedZone = 'zone1';
      } else {
        detectedZone = 'zone2';
      }
    } else {
      // În afara Ilfovului
      detectedZone = 'zone3';
    }

    setZone(detectedZone, `${label} (~${Math.round(distKm)} km)`);

    if (map) {
      if (clientMarker) {
        clientMarker.setLatLng([lat, lon]);
      } else {
        clientMarker = L.marker([lat, lon], {
          icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
          })
        }).addTo(map);
      }
      clientMarker.bindPopup(`<b>${label}</b><br>Zonă detectată: ${ZONE_CONFIG[detectedZone].label}<br>Distanță: ~${distKm.toFixed(1)} km`).openPopup();
      map.setView([lat, lon], 12);
    }
  }

  // Search Address via Nominatim Geocoding
  async function searchAddress() {
    const query = elInputSearchAddress ? elInputSearchAddress.value.trim() : '';
    if (!query) return;

    if (elBtnSearchAddress) {
      elBtnSearchAddress.textContent = 'Caut...';
      elBtnSearchAddress.disabled = true;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=ro&q=${encodeURIComponent(query + ' Romania')}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        const shortName = place.display_name.split(',').slice(0, 2).join(',');
        handleLocationSelected(lat, lon, shortName);
      } else {
        alert('Nu am găsit adresa exactă. Te rugăm să selectezi zona direct din listă sau fă click pe hartă.');
      }
    } catch (err) {
      console.error('Eroare geocoding:', err);
      alert('Eroare la căutarea adresei. Te rugăm să selectezi zona din listă.');
    } finally {
      if (elBtnSearchAddress) {
        elBtnSearchAddress.textContent = 'Localizează';
        elBtnSearchAddress.disabled = false;
      }
    }
  }

  if (elBtnSearchAddress) {
    elBtnSearchAddress.addEventListener('click', searchAddress);
  }
  if (elInputSearchAddress) {
    elInputSearchAddress.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchAddress();
      }
    });
  }

  // Initial setup
  updateSliderFill(elGuestsSlider);
  calculate();
  initMap();
});
