/**
 * PHOTOS BY DODO — MOODY BRUTALIST ESTIMATOR
 * Preserves 100% calculation math, Ilfov geo-boundaries, and WhatsApp formatting.
 *
 * FORMULA:
 * PREȚ = 200 + 80 × (ORE - 1) + 5 × max(0, PERSOANE - 30) + DEPLASARE + OPȚIUNI
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE ---
  let state = {
    date: '',
    guests: 30,
    startHour: 20,
    endHour: 2,
    locationZone: 'city',
    locationName: 'București (în oraș)',
    transportCost: 0, // In oras e UBER (decontat dupa eveniment)
    transportDisplay: 'UBER',
    addons: {
      express: false, // 200 lei
      preSession: false // 150 lei
    }
  };

  const ZONE_CONFIG = {
    city: { cost: 0, displayVal: 'UBER', label: 'BUCUREȘTI (UBER)', desc: 'București (în oraș) - UBER' },
    zone1: { cost: 60, displayVal: '60 LEI', label: 'ZONA 1: ILFOV APROPIAT (+60 LEI)', desc: 'Zona 1: Ilfov Apropiat (Ghencea, Chiajna, Otopeni, etc.)' },
    zone2: { cost: 100, displayVal: '100 LEI', label: 'ZONA 2: ILFOV EXTERIOR (+100 LEI)', desc: 'Zona 2: Ilfov Exterior (Domnești, Corbeanca, Snagov, etc.)' },
    zone3: { cost: 150, displayVal: '150 LEI', label: 'ZONA 3: PESTE 35 KM (+150 LEI)', desc: 'Zona 3: Peste 35 km / În afara Ilfovului' }
  };

  // --- DOM ELEMENTS ---
  const elEventDate = document.getElementById('inputEventDate');
  const elGuestsSlider = document.getElementById('inputGuestsSlider');
  const elGuestsDisplay = document.getElementById('txtGuestsDisplay');
  const elBtnMinus5 = document.getElementById('btnMinus5');
  const elBtnPlus5 = document.getElementById('btnPlus5');

  const elSelectStart = document.getElementById('selectStartHour');
  const elSelectEnd = document.getElementById('selectEndHour');
  const elHoursTotalBadge = document.getElementById('txtHoursTotalBadge');
  const elAlertInvalidInterval = document.getElementById('alertInvalidInterval');

  const elSelectLocationZone = document.getElementById('selectLocationZone');
  const elInputSearchAddress = document.getElementById('inputSearchAddress');
  const elBtnSearchAddress = document.getElementById('btnSearchAddress');
  const elLocationBadge = document.getElementById('txtLocationBadge');

  const elChkExpress = document.getElementById('chkExpressDelivery');
  const elChkPreSession = document.getElementById('chkPreSession');

  // Outputs
  const elGrandTotal = document.getElementById('txtGrandTotal');
  const elMobileTotal = document.getElementById('txtMobileTotal');
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
  const elBtnMobileWhatsapp = document.getElementById('btnMobileWhatsapp');
  const elToast = document.getElementById('toast');

  // --- CALCULATION LOGIC ---
  function computeDuration(start, end) {
    let s = parseInt(start, 10);
    let e = parseInt(end, 10);
    if (s === e) return 0;
    if (e < s) return (e + 24) - s;
    return e - s;
  }

  function generateSummaryText() {
    const ORE = computeDuration(state.startHour, state.endHour);
    const total = elGrandTotal.textContent;
    const startFormatted = `${state.startHour}:00`;
    const endFormatted = state.endHour < 10 ? `0${state.endHour}:00` : `${state.endHour}:00`;

    let activeAddons = [];
    if (state.addons.express) activeAddons.push('Livrare Rapidă 24-48h (+200 lei)');
    if (state.addons.preSession) activeAddons.push('Mini-ședință Portret înainte (+150 lei)');

    const transportInfo = state.locationZone === 'city' ? 'UBER (decontat la final)' : `${state.transportCost} lei`;

    return `📸 ESTIMARE FOTO MAJORAT - PHOTOS BY DODO\n` +
      `-----------------------------------------\n` +
      (state.date ? `• Data evenimentului: ${state.date}\n` : '') +
      `• Număr persoane: ${state.guests} invitați\n` +
      `• Interval fotografiere: ${startFormatted} - ${endFormatted} (${ORE} ore)\n` +
      `• Sosire: cu 30 min înainte de ${startFormatted} pentru echipament\n` +
      `• Locație / Deplasare: ${state.locationName} (${transportInfo})\n` +
      (activeAddons.length > 0 ? `• Opțiuni suplimentare: ${activeAddons.join(', ')}\n` : '') +
      `• PREȚ ESTIMAT: ${total} LEI` + (state.locationZone === 'city' ? ' + UBER noapte\n' : '\n') +
      `-----------------------------------------\n` +
      `Instagram: https://www.instagram.com/photosby_dodo/`;
  }

  function calculate() {
    const ORE = computeDuration(state.startHour, state.endHour);
    const isIntervalValid = ORE > 0;

    if (!isIntervalValid) {
      if (elAlertInvalidInterval) elAlertInvalidInterval.classList.remove('hidden');
      elGrandTotal.textContent = '0';
      if (elMobileTotal) elMobileTotal.textContent = '0';
      elHoursTotalBadge.textContent = 'INTERVAL INVALID';
      return;
    } else {
      if (elAlertInvalidInterval) elAlertInvalidInterval.classList.add('hidden');
    }

    const PERSOANE = state.guests;
    const TRANSPORT = state.transportCost;

    const baseCost = 200; // prima ora
    const extraHours = Math.max(0, ORE - 1);
    const extraHoursCost = extraHours * 80;

    // Strict non-negative check: sub 30 de persoane extraGuests este strict 0
    const extraGuests = Math.max(0, PERSOANE - 30);
    const extraGuestsCost = extraGuests * 5;

    let addonsCost = 0;
    if (state.addons.express) addonsCost += 200;
    if (state.addons.preSession) addonsCost += 150;

    const total = baseCost + extraHoursCost + extraGuestsCost + TRANSPORT + addonsCost;

    // Update Totals
    elGrandTotal.textContent = total.toLocaleString('ro-RO');
    if (elMobileTotal) elMobileTotal.textContent = total.toLocaleString('ro-RO');

    // Update Badge
    elHoursTotalBadge.textContent = `${ORE} ORE DE FOTOGRAFIERE`;

    // Update Breakdown
    elLblHoursExtra.textContent = `ORE SUPLIMENTARE (${extraHours} × 80 LEI):`;
    elValHoursExtra.textContent = `${extraHoursCost} LEI`;

    if (extraGuests > 0) {
      elLblGuestsExtra.textContent = `INVITAȚI PESTE 30 (${extraGuests} × 5 LEI):`;
      elValGuestsExtra.textContent = `+${extraGuestsCost} LEI`;
    } else {
      elLblGuestsExtra.textContent = `INVITAȚI PESTE 30:`;
      elValGuestsExtra.textContent = `0 LEI (INCLUS)`;
    }

    if (elValTransport) {
      elValTransport.textContent = state.locationZone === 'city' ? 'UBER' : `${TRANSPORT} LEI`;
    }
    if (elLblTransport) {
      elLblTransport.textContent = state.locationZone === 'city'
        ? 'DEPLASARE ÎN ORAȘ (NOAPTEA):'
        : `DEPLASARE ${state.locationName}:`;
    }

    if (addonsCost > 0) {
      elRowAddons.classList.remove('hidden');
      elValAddons.textContent = `+${addonsCost} LEI`;
    } else {
      elRowAddons.classList.add('hidden');
    }

    // Update WhatsApp links
    const summary = generateSummaryText();
    const waUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
    if (elBtnWhatsapp) elBtnWhatsapp.href = waUrl;
    if (elBtnMobileWhatsapp) elBtnMobileWhatsapp.href = waUrl;
  }

  // Set Zone
  function setZone(zoneKey, customLocationName) {
    if (!ZONE_CONFIG[zoneKey]) zoneKey = 'city';
    state.locationZone = zoneKey;
    state.transportCost = ZONE_CONFIG[zoneKey].cost;
    state.locationName = customLocationName || ZONE_CONFIG[zoneKey].desc;

    if (elSelectLocationZone) elSelectLocationZone.value = zoneKey;
    if (elLocationBadge) elLocationBadge.textContent = ZONE_CONFIG[zoneKey].label;

    calculate();
  }

  if (elSelectLocationZone) {
    elSelectLocationZone.addEventListener('change', (e) => {
      setZone(e.target.value);
    });
  }

  // Guests handling with step 5
  function setGuests(val) {
    let g = parseInt(val, 10);
    g = Math.round(g / 5) * 5;
    if (g < 15) g = 15;
    if (g > 120) g = 120;

    state.guests = g;
    elGuestsSlider.value = g;
    elGuestsDisplay.textContent = g;

    calculate();
  }

  if (elGuestsSlider) {
    elGuestsSlider.addEventListener('input', (e) => setGuests(e.target.value));
    elGuestsSlider.addEventListener('change', (e) => setGuests(e.target.value));
  }
  if (elBtnMinus5) elBtnMinus5.addEventListener('click', () => setGuests(state.guests - 5));
  if (elBtnPlus5) elBtnPlus5.addEventListener('click', () => setGuests(state.guests + 5));

  function onDropdownChange() {
    state.startHour = parseInt(elSelectStart.value, 10);
    state.endHour = parseInt(elSelectEnd.value, 10);
    calculate();
  }

  if (elSelectStart) elSelectStart.addEventListener('change', onDropdownChange);
  if (elSelectEnd) elSelectEnd.addEventListener('change', onDropdownChange);

  if (elEventDate) {
    elEventDate.addEventListener('change', (e) => {
      state.date = e.target.value;
      calculate();
    });
  }

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

  // Copy Action
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

  // --- LEAFLET MAP WITH CARTO DB DARK MATTER & STRICT 1PX POLYGONS ---
  const CENTER_BUCHAREST = [44.4323, 26.1063];
  let map = null;
  let clientMarker = null;

  function isPointInPolygon(point, polygon) {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
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
    const inBucharest = typeof GEO_BOUNDARIES !== 'undefined' && isPointInPolygon(point, GEO_BOUNDARIES.bucharest);
    const inIlfov = typeof GEO_BOUNDARIES !== 'undefined' && isPointInPolygon(point, GEO_BOUNDARIES.ilfov);

    if (inBucharest) {
      detectedZone = 'city';
    } else if (inIlfov) {
      detectedZone = distKm <= 16 ? 'zone1' : 'zone2';
    } else {
      detectedZone = 'zone3';
    }

    setZone(detectedZone, `${label} (~${Math.round(distKm)} KM)`);

    if (map) {
      if (clientMarker) {
        clientMarker.setLatLng([lat, lon]);
      } else {
        clientMarker = L.circleMarker([lat, lon], {
          radius: 7,
          color: '#c6ff00',
          fillColor: '#000000',
          fillOpacity: 1,
          weight: 2
        }).addTo(map);
      }
      clientMarker.bindPopup(`<b>${label}</b><br>DISTANȚĂ: ~${distKm.toFixed(1)} KM<br>ZONĂ: ${ZONE_CONFIG[detectedZone].label}`).openPopup();
      map.setView([lat, lon], 12);
    }
  }

  function initMap() {
    const elMap = document.getElementById('map');
    if (!elMap || typeof L === 'undefined') return;

    map = L.map('map', {
      center: CENTER_BUCHAREST,
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: false
    });

    // CartoDB Dark Matter Tiles (Clean, dark, minimal)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap, &copy; CARTO',
      maxZoom: 18
    }).addTo(map);

    if (typeof GEO_BOUNDARIES !== 'undefined') {
      // 1px Non-neon polygons
      L.polygon(GEO_BOUNDARIES.ilfov, {
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.08,
        weight: 1
      }).addTo(map).bindTooltip('JUDEȚUL ILFOV (+60 / +100 LEI)', { sticky: true });

      L.polygon(GEO_BOUNDARIES.bucharest, {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(map).bindTooltip('MUNICIPIUL BUCUREȘTI (UBER)', { sticky: true });
    }

    L.circleMarker(CENTER_BUCHAREST, {
      radius: 4,
      color: '#ffffff',
      fillColor: '#ffffff',
      fillOpacity: 1,
      weight: 1
    }).addTo(map).bindPopup('BUCUREȘTI CENTRU');

    map.on('click', (e) => {
      handleLocationSelected(e.latlng.lat, e.latlng.lng, 'LOCAȚIE SELECTATĂ PE HARTĂ');
    });
  }

  // Search Address
  async function searchAddress() {
    const query = elInputSearchAddress ? elInputSearchAddress.value.trim() : '';
    if (!query) return;

    if (elBtnSearchAddress) {
      elBtnSearchAddress.textContent = 'CAUT...';
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
        handleLocationSelected(lat, lon, shortName.toUpperCase());
      } else {
        alert('ADRESA NU A FOST GĂSITĂ. SELECTEAZĂ ZONA DIRECT DIN LISTĂ SAU FĂ CLICK PE HARTĂ.');
      }
    } catch (err) {
      alert('EROARE LA CĂUTARE. SELECTEAZĂ ZONA DIN MENIU.');
    } finally {
      if (elBtnSearchAddress) {
        elBtnSearchAddress.textContent = 'CAUTĂ';
        elBtnSearchAddress.disabled = false;
      }
    }
  }

  if (elBtnSearchAddress) elBtnSearchAddress.addEventListener('click', searchAddress);
  if (elInputSearchAddress) {
    elInputSearchAddress.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchAddress();
      }
    });
  }

  // --- ADVANCED LIGHTBOX SYSTEM ---
  // Pure black, arrows, swipe, Esc, mono counter 01/08, scroll lock, preloading
  const GALLERY_IMAGES = [
    'assets/gallery/photo-1.jpg',
    'assets/gallery/photo-2.jpg',
    'assets/gallery/photo-3.jpg',
    'assets/gallery/photo-4.jpg',
    'assets/gallery/photo-5.jpg',
    'assets/gallery/photo-6.jpg',
    'assets/gallery/photo-7.jpg',
    'assets/gallery/photo-8.jpg'
  ];

  let currentLightboxIndex = 0;
  const elModal = document.getElementById('lightboxModal');
  const elModalImg = document.getElementById('lightboxImage');
  const elCounter = document.getElementById('lightboxCounter');
  const elBtnClose = document.getElementById('btnCloseLightbox');
  const elBtnPrev = document.getElementById('btnPrevLightbox');
  const elBtnNext = document.getElementById('btnNextLightbox');

  function preloadImage(idx) {
    if (idx >= 0 && idx < GALLERY_IMAGES.length) {
      const img = new Image();
      img.src = GALLERY_IMAGES[idx];
    }
  }

  function updateLightboxView() {
    if (!elModalImg || !elCounter) return;
    elModalImg.src = GALLERY_IMAGES[currentLightboxIndex];
    const curNum = (currentLightboxIndex + 1).toString().padStart(2, '0');
    const totNum = GALLERY_IMAGES.length.toString().padStart(2, '0');
    elCounter.textContent = `${curNum} / ${totNum}`;

    // Preload next image
    const nextIdx = (currentLightboxIndex + 1) % GALLERY_IMAGES.length;
    preloadImage(nextIdx);
  }

  function openLightbox(index) {
    currentLightboxIndex = parseInt(index, 10) || 0;
    updateLightboxView();
    if (elModal) {
      elModal.classList.remove('hidden');
      document.body.classList.add('scroll-locked');
    }
  }

  function closeLightbox() {
    if (elModal) {
      elModal.classList.add('hidden');
      document.body.classList.remove('scroll-locked');
    }
  }

  function nextLightbox() {
    currentLightboxIndex = (currentLightboxIndex + 1) % GALLERY_IMAGES.length;
    updateLightboxView();
  }

  function prevLightbox() {
    currentLightboxIndex = (currentLightboxIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    updateLightboxView();
  }

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = item.getAttribute('data-index');
      openLightbox(idx);
    });
  });

  if (elBtnClose) elBtnClose.addEventListener('click', closeLightbox);
  if (elBtnNext) elBtnNext.addEventListener('click', nextLightbox);
  if (elBtnPrev) elBtnPrev.addEventListener('click', prevLightbox);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!elModal || elModal.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });

  // Touch swipe support on modal
  let touchStartX = 0;
  let touchEndX = 0;

  if (elModal) {
    elModal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    elModal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) nextLightbox(); // Swiped left -> next
        else prevLightbox(); // Swiped right -> prev
      }
    }, { passive: true });
  }

  // INITIAL RUN
  calculate();
  initMap();
});
