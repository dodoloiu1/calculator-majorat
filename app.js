/**
 * Calculator Servicii Foto Majorat - Photos by Dodo
 * https://www.instagram.com/photosby_dodo/
 *
 * FORMULA:
 * PREȚ = 200 + 80 × (ORE - 1) + 5 × max(0, PERSOANE - 30) + TRANSPORT + OPȚIUNI
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

  const elInputTransport = document.getElementById('inputTransport');

  // Addons
  const elChkExpress = document.getElementById('chkExpressDelivery');
  const elChkPreSession = document.getElementById('chkPreSession');

  // Outputs
  const elGrandTotal = document.getElementById('txtGrandTotal');
  const elLblHoursExtra = document.getElementById('lblHoursExtraFormula');
  const elValHoursExtra = document.getElementById('valHoursExtraFormula');
  const elLblGuestsExtra = document.getElementById('lblGuestsExtraFormula');
  const elValGuestsExtra = document.getElementById('valGuestsExtraFormula');
  const elRowTransport = document.getElementById('rowTransportSummary');
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
    transport: 0,
    addons: {
      express: false, // 200 lei
      preSession: false // 150 lei
    }
  };

  // Helper to compute duration across midnight safely
  function computeDuration(start, end) {
    let s = parseInt(start, 10);
    let e = parseInt(end, 10);
    if (s === e) {
      return 0; // Invalid / 0 hours
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

    return `📸 ESTIMARE FOTO MAJORAT - PHOTOS BY DODO\n` +
      `-----------------------------------------\n` +
      (state.date ? `• Data evenimentului: ${state.date}\n` : '') +
      `• Număr persoane: ${state.guests} invitați\n` +
      `• Interval fotografiere: ${startFormatted} - ${endFormatted} (${ORE} ore)\n` +
      `• Sosire: cu 30 min înainte de ${startFormatted} pentru echipament\n` +
      (state.transport > 0 ? `• Cost transport: ${state.transport} lei\n` : '') +
      (activeAddons.length > 0 ? `• Opțiuni suplimentare: ${activeAddons.join(', ')}\n` : '') +
      `• PREȚ TOTAL: ${total} LEI\n` +
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
    const TRANSPORT = Math.max(0, parseInt(state.transport, 10) || 0);

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

    if (TRANSPORT > 0) {
      elRowTransport.classList.remove('hidden');
      elValTransport.textContent = `${TRANSPORT} lei`;
    } else {
      elRowTransport.classList.add('hidden');
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

  elInputTransport.addEventListener('input', (e) => {
    state.transport = parseInt(e.target.value, 10) || 0;
    calculate();
  });

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

  // Initial setup
  updateSliderFill(elGuestsSlider);
  calculate();
});
