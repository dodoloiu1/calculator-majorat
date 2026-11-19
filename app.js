/**
 * PHOTOS BY DODO — MOODY BRUTALIST ESTIMATOR
 * Preserves 100% calculation math, Ilfov geo-boundaries, and WhatsApp formatting.
 *
 * FORMULA:
 * PREȚ = 200 + 80 × (ORE - 1) + 5 × max(0, PERSOANE - 30) + DEPLASARE + OPȚIUNI
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- CONFIG: NUMĂR WHATSAPP CLIENT ---
  const WHATSAPP_PHONE = '40736195520';

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
    if (state.addons.express) activeAddons.push('Predare rapidă 24-48h (+200 lei)');
    if (state.addons.preSession) activeAddons.push('Mini-ședință portret înainte (+150 lei)');

    const transportInfo = state.locationZone === 'city' ? 'Uber decontat de tine, la final (noaptea)' : `${state.transportCost} lei`;

    return `📸 ESTIMARE FOTO MAJORAT - PHOTOS BY DODO\n` +
      `-----------------------------------------\n` +
      (state.date ? `• Data evenimentului: ${state.date}\n` : '') +
      `• Număr persoane: ${state.guests} invitați\n` +
      `• Interval fotografiere: ${startFormatted} - ${endFormatted} (${ORE} ore)\n` +
      `• Sosire: cu 30 min înainte de ${startFormatted} pentru echipament\n` +
      `• Locație: ${state.locationName} (${transportInfo})\n` +
      (activeAddons.length > 0 ? `• Opțiuni: ${activeAddons.join(', ')}\n` : '') +
      `• PREȚ ESTIMAT: ${total} LEI` + (state.locationZone === 'city' ? ' + Uber noapte\n' : '\n') +
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

    // Update WhatsApp links with international format 40736195520
    const summary = generateSummaryText();
    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(summary)}`;
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

  // Guests handling with step 5 & Slider percentage tracking
  function updateSliderFill(el) {
    if (!el) return;
    const min = parseFloat(el.min) || 15;
    const max = parseFloat(el.max) || 120;
    const val = parseFloat(el.value) || 30;
    const pct = ((val - min) / (max - min)) * 100;
    el.style.setProperty('--pct', `${pct}%`);
  }

  function setGuests(val) {
    let g = parseInt(val, 10);
    g = Math.round(g / 5) * 5;
    if (g < 15) g = 15;
    if (g > 120) g = 120;

    state.guests = g;
    elGuestsSlider.value = g;
    elGuestsDisplay.textContent = g;
    updateSliderFill(elGuestsSlider);

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

  // Date: no past dates. Min is today; typed past dates are rejected.
  function todayISO() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  if (elEventDate) {
    elEventDate.min = todayISO();
    elEventDate.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value && value < todayISO()) {
        e.target.value = '';
        state.date = '';
        showToast('DATA NU POATE FI ÎN TRECUT.');
        calculate();
        return;
      }
      state.date = value;
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

  // Toast (shared by "copiază" and by search/geocoding errors)
  let toastTimer = null;
  function showToast(message) {
    if (!elToast) return;
    elToast.textContent = message;
    elToast.classList.remove('opacity-0');
    elToast.classList.add('opacity-100');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elToast.classList.remove('opacity-100');
      elToast.classList.add('opacity-0');
    }, 2600);
  }

  // Copy Action
  if (elBtnCopyText) {
    elBtnCopyText.addEventListener('click', () => {
      const text = generateSummaryText();
      const done = () => showToast('CALCUL COPIAT ÎN CLIPBOARD!');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => showToast('NU AM PUTUT COPIA. SELECTEAZĂ TEXTUL MANUAL.'));
      } else {
        showToast('NU AM PUTUT COPIA. SELECTEAZĂ TEXTUL MANUAL.');
      }
    });
  }

  // --- LEAFLET MAP WITH CARTO DB DARK MATTER & STRICT 1PX NON-NEON POLYGONS ---
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
          radius: 6,
          color: '#c6ff00',
          fillColor: '#0a0a0a',
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

    // OpenStreetMap tiles — no API key, no keyed provider.
    // The dark look comes from a CSS filter on .leaflet-tile (see styles.css),
    // so the theme stays dark without depending on CartoDB's keyed basemaps.
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: 'abc',
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    });

    // Fallback: if the tile server is slow or blocked, drop the raster layer
    // and keep the zone polygons + markers on a clean dark surface.
    let tileErrors = 0;
    let tilesDropped = false;
    osmLayer.on('tileerror', () => {
      tileErrors += 1;
      if (!tilesDropped && tileErrors >= 5) {
        tilesDropped = true;
        if (map.hasLayer(osmLayer)) map.removeLayer(osmLayer);
        if (elMap) elMap.classList.add('map-tiles-failed');
      }
    });
    osmLayer.addTo(map);

    if (typeof GEO_BOUNDARIES !== 'undefined') {
      // Poligoane stricte 1px: Bucuresti = --accent (#c6ff00), Ilfov = --fg (#e8e6e1)
      L.polygon(GEO_BOUNDARIES.ilfov, {
        color: '#e8e6e1',
        fillColor: '#e8e6e1',
        fillOpacity: 0.05,
        weight: 1
      }).addTo(map).bindTooltip('JUDEȚUL ILFOV (+60 / +100 LEI)', { sticky: true });

      L.polygon(GEO_BOUNDARIES.bucharest, {
        color: '#c6ff00',
        fillColor: '#c6ff00',
        fillOpacity: 0.08,
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

    // Invalidate size in multiple passes to guarantee render
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 1000);
  }

  // --- ADDRESS AUTOCOMPLETE -------------------------------------------------
  // Photon (structured OSM results, no key) with Nominatim as fallback.
  // Google-style behaviour: suggestions as you type, arrows + Enter, Escape.
  const elSuggestions = document.getElementById('addressSuggestions');
  let suggestSeq = 0;
  let suggestAbort = null;
  let suggestTimer = null;
  let activeSuggestion = -1;
  let currentSuggestions = [];

  function closeSuggestions() {
    if (!elSuggestions) return;
    elSuggestions.hidden = true;
    elSuggestions.innerHTML = '';
    currentSuggestions = [];
    activeSuggestion = -1;
    if (elInputSearchAddress) elInputSearchAddress.setAttribute('aria-expanded', 'false');
  }

  function renderSuggestions(items) {
    if (!elSuggestions) return;
    elSuggestions.innerHTML = '';

    // Drop exact duplicates (the geocoders return the same street several times)
    const seen = new Set();
    const unique = items.filter((item) => {
      const key = `${item.label}|${item.hint}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    currentSuggestions = unique;
    activeSuggestion = -1;

    if (!unique.length) {
      closeSuggestions();
      return;
    }

    unique.forEach((item, i) => {
      const li = document.createElement('li');
      li.className = 'suggestion';
      li.id = `suggestion-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');

      const title = document.createElement('span');
      title.className = 'suggestion-title';
      title.textContent = item.label;

      const hint = document.createElement('span');
      hint.className = 'suggestion-hint';
      hint.textContent = item.hint;

      li.append(title, hint);
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        pickSuggestion(i);
      });
      elSuggestions.appendChild(li);
    });

    elSuggestions.hidden = false;
    if (elInputSearchAddress) elInputSearchAddress.setAttribute('aria-expanded', 'true');
  }

  function highlightSuggestion(index) {
    if (!elSuggestions) return;
    const count = currentSuggestions.length;
    if (!count) return;
    const next = (index + count) % count;
    [...elSuggestions.children].forEach((li, i) => {
      li.classList.toggle('is-active', i === next);
      li.setAttribute('aria-selected', String(i === next));
    });
    activeSuggestion = next;
    if (elInputSearchAddress) elInputSearchAddress.setAttribute('aria-activedescendant', `suggestion-${next}`);
  }

  function pickSuggestion(index) {
    const item = currentSuggestions[index];
    if (!item) return;
    if (elInputSearchAddress) elInputSearchAddress.value = item.label;
    closeSuggestions();
    handleLocationSelected(item.lat, item.lon, item.label.toUpperCase());
  }

  async function fetchSuggestions(query) {
    const seq = ++suggestSeq;
    if (suggestAbort) suggestAbort.abort();

    // 1) Photon — GeoJSON, structured fields, no API key
    try {
      suggestAbort = new AbortController();
      const res = await fetch(
        `https://photon.komoot.io/api/?limit=6&lang=ro&q=${encodeURIComponent(query)}`,
        { signal: suggestAbort.signal, headers: { Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error(`photon ${res.status}`);
      const data = await res.json();
      if (seq !== suggestSeq) return;

      const items = (data.features || [])
        .map((f) => {
          const p = f.properties || {};
          const coords = (f.geometry && f.geometry.coordinates) || [];
          return {
            lat: coords[1],
            lon: coords[0],
            label: p.name || p.city || p.state || p.country || '',
            hint: [p.city || p.state, p.country].filter(Boolean).join(', ')
          };
        })
        .filter((i) => i.label && typeof i.lat === 'number');

      if (items.length) {
        renderSuggestions(items);
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }

    // 2) Fallback: Nominatim
    try {
      suggestAbort = new AbortController();
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=ro&limit=6&accept-language=ro&q=${encodeURIComponent(query)}`,
        { signal: suggestAbort.signal }
      );
      if (!res.ok) throw new Error(`nominatim ${res.status}`);
      const data = await res.json();
      if (seq !== suggestSeq) return;

      renderSuggestions((data || []).map((d) => {
        const parts = (d.display_name || '').split(',');
        return {
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
          label: parts[0] || '',
          hint: parts.slice(1, 3).join(',').trim()
        };
      }));
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      if (seq === suggestSeq) closeSuggestions();
    }
  }

  // Explicit search (button / Enter) — best-effort, never blocks the zone select
  async function searchAddress() {
    const query = elInputSearchAddress ? elInputSearchAddress.value.trim() : '';
    if (!query) return;

    if (elBtnSearchAddress) {
      elBtnSearchAddress.textContent = '...';
      elBtnSearchAddress.disabled = true;
    }
    closeSuggestions();

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=ro&limit=1&accept-language=ro&q=${encodeURIComponent(query + ' Romania')}`
      );
      if (!response.ok) throw new Error(`http ${response.status}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const place = data[0];
        const shortName = place.display_name.split(',').slice(0, 2).join(',');
        handleLocationSelected(parseFloat(place.lat), parseFloat(place.lon), shortName.toUpperCase());
      } else {
        showToast('ADRESA NU A FOST GĂSITĂ. ALEGE ZONA DIN LISTĂ.');
      }
    } catch (err) {
      showToast('CĂUTAREA A EȘUAT. ALEGE ZONA DIN LISTĂ.');
    } finally {
      if (elBtnSearchAddress) {
        elBtnSearchAddress.textContent = 'CAUTĂ';
        elBtnSearchAddress.disabled = false;
      }
    }
  }

  if (elBtnSearchAddress) elBtnSearchAddress.addEventListener('click', searchAddress);

  if (elInputSearchAddress) {
    elInputSearchAddress.addEventListener('input', () => {
      const q = elInputSearchAddress.value.trim();
      clearTimeout(suggestTimer);
      if (q.length < 3) {
        closeSuggestions();
        return;
      }
      suggestTimer = setTimeout(() => fetchSuggestions(q), 250);
    });

    elInputSearchAddress.addEventListener('keydown', (e) => {
      if (!elSuggestions || elSuggestions.hidden) {
        if (e.key === 'Enter') {
          e.preventDefault();
          searchAddress();
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightSuggestion(activeSuggestion + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightSuggestion(activeSuggestion - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestion >= 0) pickSuggestion(activeSuggestion);
        else searchAddress();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeSuggestions();
      }
    });

    elInputSearchAddress.addEventListener('blur', () => {
      // mousedown on an option already preventDefault's, so a plain delay is enough
      setTimeout(closeSuggestions, 120);
    });
  }

  document.addEventListener('click', (e) => {
    if (!elSuggestions || elSuggestions.hidden) return;
    if (e.target && e.target.closest && e.target.closest('.search-field')) return;
    closeSuggestions();
  });

  // --- DYNAMIC RATIO DETECTION & ASYMMETRIC GRID SPANS ---
  function initGalleryRatio() {
    const figures = document.querySelectorAll('.gallery figure');
    figures.forEach(fig => {
      const img = fig.querySelector('img');
      if (!img) return;

      function checkRatio() {
        if (img.naturalWidth && img.naturalHeight) {
          if (img.naturalWidth > img.naturalHeight) {
            fig.classList.remove('portrait');
            fig.classList.add('landscape');
          } else {
            fig.classList.remove('landscape');
            fig.classList.add('portrait');
          }
        }
      }

      if (img.complete) {
        checkRatio();
      } else {
        img.addEventListener('load', checkRatio, { once: true });
      }
    });
  }

  // --- ADVANCED LIGHTBOX SYSTEM ---
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

  let lastFocused = null;
  const LIGHTBOX_FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openLightbox(index, trigger) {
    currentLightboxIndex = parseInt(index, 10) || 0;
    updateLightboxView();
    if (elModal) {
      lastFocused = trigger || document.activeElement;
      elModal.classList.remove('hidden');
      document.body.classList.add('scroll-locked');
      // Move focus into the dialog so keyboard and screen-reader users land there
      if (elBtnClose) elBtnClose.focus();
    }
  }

  function closeLightbox() {
    if (elModal) {
      elModal.classList.add('hidden');
      document.body.classList.remove('scroll-locked');
      // Return focus to the thumbnail that opened the dialog
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
      lastFocused = null;
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

  document.querySelectorAll('.gallery figure').forEach(item => {
    const open = () => openLightbox(item.getAttribute('data-index'), item);
    item.addEventListener('click', open);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  if (elBtnClose) elBtnClose.addEventListener('click', closeLightbox);
  if (elBtnNext) elBtnNext.addEventListener('click', nextLightbox);
  if (elBtnPrev) elBtnPrev.addEventListener('click', prevLightbox);

  // Keyboard navigation + focus trap
  document.addEventListener('keydown', (e) => {
    if (!elModal || elModal.classList.contains('hidden')) return;

    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'ArrowRight') { nextLightbox(); return; }
    if (e.key === 'ArrowLeft') { prevLightbox(); return; }

    if (e.key === 'Tab') {
      const nodes = elModal.querySelectorAll(LIGHTBOX_FOCUSABLE);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
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
        if (diff < 0) nextLightbox();
        else prevLightbox();
      }
    }, { passive: true });
  }

  // INITIAL RUN
  updateSliderFill(elGuestsSlider);
  calculate();
  initMap();
  initGalleryRatio();
});
