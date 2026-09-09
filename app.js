/**
 * Calculator Preț Majorat - Photos by Dodo
 * https://www.instagram.com/photosby_dodo/
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- Configuration & Default Rates ---
  const DEFAULT_CONFIG = {
    rateEssential: 180,       // RON per hour (1 photo)
    ratePro: 320,             // RON per hour (photo + video)
    rateVIP: 450,             // RON per hour (vip all-in)
    guestBaseThreshold: 30,   // Included guests in base fee
    ratePerPersonExtra: 10,   // RON per extra guest above threshold
    exchangeRateEUR: 5.10,    // 1 EUR in RON
    addons: {
      reel: 250,
      session: 300,
      drone: 300,
      photobooth: 1400
    },
    fullEvent: {
      barEUR: 35,             // EUR per guest
      buffetEUR: 33,          // EUR per guest
      rentSmallEUR: 500,      // Venue rent if < 40 guests
      djEUR: 400,             // DJ & sound in EUR
      decorEUR: 300           // Photo panel in EUR
    }
  };

  // Load saved config or defaults
  let config = JSON.parse(localStorage.getItem('dodo_calculator_config')) || { ...DEFAULT_CONFIG };

  // --- State Variables ---
  let state = {
    mode: 'photo',            // 'photo' | 'full'
    currency: 'RON',          // 'RON' | 'EUR'
    guests: 35,               // min 15, max 150, step 5
    startHour: 20,            // 20:00
    endHour: 4,               // 04:00
    package: 'pro',           // 'essential' | 'pro' | 'vip'
    addons: {
      reel: false,
      session: false,
      drone: false,
      photobooth: false
    },
    fullEvent: {
      bar: true,
      buffet: true,
      dj: true,
      decor: false
    }
  };

  // --- DOM Elements ---
  const elGuestsCount = document.getElementById('txtGuestsCount');
  const elGuestsSlider = document.getElementById('sliderGuests');
  const elBtnMinus5 = document.getElementById('btnMinus5');
  const elBtnPlus5 = document.getElementById('btnPlus5');
  const elGuestBracketLabel = document.getElementById('guestBracketLabel');

  const elSelectStart = document.getElementById('selectStartTime');
  const elSelectEnd = document.getElementById('selectEndTime');
  const elTxtDurationHours = document.getElementById('txtDurationHours');
  const elTxtTimelineSummary = document.getElementById('txtTimelineSummary');

  const elTabModePhoto = document.getElementById('tabModePhoto');
  const elTabModeFull = document.getElementById('tabModeFull');
  const elSectionPhotoPackages = document.getElementById('sectionPhotoPackages');
  const elSectionAddons = document.getElementById('sectionAddons');
  const elSectionFullEvent = document.getElementById('sectionFullEvent');

  const elBtnCurrencyRON = document.getElementById('btnCurrencyRON');
  const elBtnCurrencyEUR = document.getElementById('btnCurrencyEUR');

  // Outputs
  const elTxtTotalPrice = document.getElementById('txtTotalPrice');
  const elTxtCurrencyCode = document.getElementById('txtCurrencyCode');
  const elTxtAltCurrency = document.getElementById('txtAltCurrency');
  const elTxtPricePerPerson = document.getElementById('txtPricePerPerson');

  const elSummaryDuration = document.getElementById('summaryDuration');
  const elSummaryGuests = document.getElementById('summaryGuests');
  const elSummaryBaseRate = document.getElementById('summaryBaseRate');
  const elSummaryGuestExtra = document.getElementById('summaryGuestExtra');
  const elSummaryAddons = document.getElementById('summaryAddons');
  const elSummaryFullEvent = document.getElementById('summaryFullEvent');
  const elRowFullEventTotal = document.getElementById('rowFullEventTotal');

  // Actions
  const elBtnWhatsApp = document.getElementById('btnWhatsApp');
  const elBtnCopyOffer = document.getElementById('btnCopyOffer');
  const elBtnPrintPDF = document.getElementById('btnPrintPDF');

  // Settings Modal
  const elBtnOpenSettings = document.getElementById('btnOpenSettings');
  const elBtnCloseSettings = document.getElementById('btnCloseSettings');
  const elModalSettings = document.getElementById('modalSettings');
  const elBtnSaveSettings = document.getElementById('btnSaveSettings');
  const elBtnResetSettings = document.getElementById('btnResetSettings');

  // Toast
  const elToast = document.getElementById('toastNotification');
  const elToastText = document.getElementById('toastText');

  // --- Helper Functions ---
  function computeDuration(start, end) {
    let s = parseInt(start, 10);
    let e = parseInt(end, 10);
    if (e <= s) {
      return (e + 24) - s;
    }
    return e - s;
  }

  function formatMoney(amount, currency) {
    if (currency === 'EUR') {
      return Math.round(amount).toLocaleString('ro-RO') + ' €';
    }
    return Math.round(amount).toLocaleString('ro-RO') + ' RON';
  }

  function showToast(message) {
    if (!elToast) return;
    elToastText.textContent = message;
    elToast.classList.remove('translate-y-20', 'opacity-0');
    elToast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
      elToast.classList.remove('translate-y-0', 'opacity-100');
      elToast.classList.add('translate-y-20', 'opacity-0');
    }, 2800);
  }

  // --- Main Calculation Engine ---
  function calculateTotal() {
    const duration = computeDuration(state.startHour, state.endHour);

    // 1. Photo Base Rate
    let hourlyRate = config.ratePro;
    if (state.package === 'essential') hourlyRate = config.rateEssential;
    if (state.package === 'vip') hourlyRate = config.rateVIP;

    const basePhotoCostRON = hourlyRate * duration;

    // 2. Extra Guests Volume Supplement
    let extraGuests = Math.max(0, state.guests - config.guestBaseThreshold);
    let extraGuestsCostRON = extraGuests * config.ratePerPersonExtra;

    // 3. Addons Total
    let addonsTotalRON = 0;
    if (state.addons.reel) addonsTotalRON += config.addons.reel;
    if (state.addons.session) addonsTotalRON += config.addons.session;
    if (state.addons.drone) addonsTotalRON += config.addons.drone;
    if (state.addons.photobooth) addonsTotalRON += config.addons.photobooth;

    // Total Photo-Video Services
    let totalPhotoServicesRON = basePhotoCostRON + extraGuestsCostRON + addonsTotalRON;

    // 4. Full Event Venue/Catering (if selected)
    let fullEventTotalRON = 0;
    let fullEventTotalEUR = 0;
    if (state.mode === 'full') {
      let eventEUR = 0;
      if (state.fullEvent.bar) eventEUR += config.fullEvent.barEUR * state.guests;
      if (state.fullEvent.buffet) eventEUR += config.fullEvent.buffetEUR * state.guests;
      
      // Rent discount if >= 40 guests
      let rentEUR = state.guests >= 40 ? 0 : config.fullEvent.rentSmallEUR;
      eventEUR += rentEUR;

      if (state.fullEvent.dj) eventEUR += config.fullEvent.djEUR;
      if (state.fullEvent.decor) eventEUR += config.fullEvent.decorEUR;

      fullEventTotalEUR = eventEUR;
      fullEventTotalRON = eventEUR * config.exchangeRateEUR;
    }

    // Grand Total in RON
    const grandTotalRON = totalPhotoServicesRON + fullEventTotalRON;
    const grandTotalEUR = grandTotalRON / config.exchangeRateEUR;

    // Cost per guest
    const pricePerPersonRON = state.guests > 0 ? (grandTotalRON / state.guests) : 0;
    const pricePerPersonEUR = state.guests > 0 ? (grandTotalEUR / state.guests) : 0;

    // --- Update UI ---
    renderUI({
      duration,
      basePhotoCostRON,
      extraGuestsCostRON,
      addonsTotalRON,
      fullEventTotalRON,
      fullEventTotalEUR,
      grandTotalRON,
      grandTotalEUR,
      pricePerPersonRON,
      pricePerPersonEUR
    });
  }

  function renderUI(data) {
    const isRON = state.currency === 'RON';

    // Total Price
    if (isRON) {
      elTxtTotalPrice.textContent = Math.round(data.grandTotalRON).toLocaleString('ro-RO');
      elTxtCurrencyCode.textContent = 'RON';
      elTxtAltCurrency.textContent = `≈ ${Math.round(data.grandTotalEUR).toLocaleString('ro-RO')} EUR (curs BNR)`;
      elTxtPricePerPerson.textContent = `~${Math.round(data.pricePerPersonRON)} RON / pers`;
    } else {
      elTxtTotalPrice.textContent = Math.round(data.grandTotalEUR).toLocaleString('ro-RO');
      elTxtCurrencyCode.textContent = 'EUR';
      elTxtAltCurrency.textContent = `≈ ${Math.round(data.grandTotalRON).toLocaleString('ro-RO')} RON`;
      elTxtPricePerPerson.textContent = `~${Math.round(data.pricePerPersonEUR)} EUR / pers`;
    }

    // Breakdown details
    elSummaryDuration.textContent = `${data.duration} ore`;
    elSummaryGuests.textContent = `${state.guests} persoane`;

    const baseVal = isRON ? data.basePhotoCostRON : (data.basePhotoCostRON / config.exchangeRateEUR);
    elSummaryBaseRate.textContent = formatMoney(baseVal, state.currency);

    const extraVal = isRON ? data.extraGuestsCostRON : (data.extraGuestsCostRON / config.exchangeRateEUR);
    elSummaryGuestExtra.textContent = data.extraGuestsCostRON > 0 ? `+${formatMoney(extraVal, state.currency)}` : 'Inclus (0 RON)';

    const addonsVal = isRON ? data.addonsTotalRON : (data.addonsTotalRON / config.exchangeRateEUR);
    elSummaryAddons.textContent = formatMoney(addonsVal, state.currency);

    if (state.mode === 'full') {
      elRowFullEventTotal.classList.remove('hidden');
      const eventVal = isRON ? data.fullEventTotalRON : data.fullEventTotalEUR;
      elSummaryFullEvent.textContent = formatMoney(eventVal, state.currency);
    } else {
      elRowFullEventTotal.classList.add('hidden');
    }

    // Rent discount label in full event card
    const elRentPrice = document.getElementById('priceFullRent');
    if (elRentPrice) {
      if (state.guests >= 40) {
        elRentPrice.innerHTML = '<span class="text-emerald-400 font-extrabold">0 € (GRATUIT)</span>';
      } else {
        elRentPrice.textContent = '500 €';
      }
    }

    // Update WhatsApp link
    updateWhatsAppLink(data);
  }

  function updateWhatsAppLink(data) {
    let packageName = 'Pro Foto + Video Highlights';
    if (state.package === 'essential') packageName = 'Essential Foto';
    if (state.package === 'vip') packageName = 'VIP All-In Party Experience';

    let addonsList = [];
    if (state.addons.reel) addonsList.push('Reel 24h');
    if (state.addons.session) addonsList.push('Ședință foto de zi');
    if (state.addons.drone) addonsList.push('Cadre aeriene dronă');
    if (state.addons.photobooth) addonsList.push('Cabină foto instant');

    let text = `Salut Dodo! 👋 Am făcut o estimare pentru majoratul meu pe site-ul tău:\n\n` +
      `📅 Interval: ${state.startHour}:00 - 0${state.endHour}:00 (${data.duration} ore)\n` +
      `👥 Număr invitați: ${state.guests} persoane\n` +
      `📸 Pachet ales: ${packageName}\n` +
      (addonsList.length > 0 ? `✨ Opționale: ${addonsList.join(', ')}\n` : '') +
      (state.mode === 'full' ? `🎉 Mod: Eveniment Complet (Sală, Bufet, Bar, DJ inclus)\n` : '') +
      `💰 Estimare Totală: ${Math.round(data.grandTotalRON).toLocaleString('ro-RO')} RON (~${Math.round(data.grandTotalEUR)} EUR)\n\n` +
      `Aș dori să știu dacă ai disponibilă data pentru eveniment! Mulțumesc!`;

    elBtnWhatsApp.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  // --- Event Listeners for Guests Stepper (Step 5) ---
  function setGuests(val) {
    let g = parseInt(val, 10);
    // Snap to nearest multiple of 5
    g = Math.round(g / 5) * 5;
    if (g < 15) g = 15;
    if (g > 150) g = 150;

    state.guests = g;
    elGuestsCount.textContent = g;
    elGuestsSlider.value = g;

    // Update preset chip highlights
    document.querySelectorAll('.preset-chip').forEach(btn => {
      if (parseInt(btn.dataset.value, 10) === g) {
        btn.classList.remove('bg-white/5');
        btn.classList.add('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-400/40');
      } else {
        btn.classList.add('bg-white/5');
        btn.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-400/40');
      }
    });

    // Update bracket label
    if (g < 30) {
      elGuestBracketLabel.textContent = 'Petrecere Intimă • sub 30 pers';
    } else if (g <= 50) {
      elGuestBracketLabel.textContent = 'Petrecere Medie • 30-50 pers';
    } else if (g <= 80) {
      elGuestBracketLabel.textContent = 'Party Mare • 50-80 pers';
    } else {
      elGuestBracketLabel.textContent = 'Mega Majorat • peste 80 pers';
    }

    calculateTotal();
  }

  elBtnMinus5.addEventListener('click', () => {
    setGuests(state.guests - 5);
  });

  elBtnPlus5.addEventListener('click', () => {
    setGuests(state.guests + 5);
  });

  elGuestsSlider.addEventListener('input', (e) => {
    setGuests(e.target.value);
  });

  document.querySelectorAll('.preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      setGuests(btn.dataset.value);
    });
  });

  // --- Event Listeners for Hours & Duration ---
  function updateHours() {
    state.startHour = parseInt(elSelectStart.value, 10);
    state.endHour = parseInt(elSelectEnd.value, 10);
    const dur = computeDuration(state.startHour, state.endHour);

    elTxtDurationHours.textContent = `${dur} ore`;
    elTxtTimelineSummary.textContent = `De la ${state.startHour}:00 la 0${state.endHour}:00 (${dur} ore)`;

    calculateTotal();
  }

  elSelectStart.addEventListener('change', updateHours);
  elSelectEnd.addEventListener('change', updateHours);

  // --- Package Selection ---
  document.querySelectorAll('input[name="photoPackage"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.package = e.target.value;

      // Update active border on options
      document.querySelectorAll('.package-option').forEach(card => {
        card.classList.remove('border-cyan-400', 'border-2', 'bg-cyan-950/20', 'shadow-glow');
        card.classList.add('border-white/10', 'bg-black/20');
      });

      const selectedLabel = e.target.closest('.package-option');
      if (selectedLabel) {
        selectedLabel.classList.add('border-cyan-400', 'border-2', 'bg-cyan-950/20', 'shadow-glow');
        selectedLabel.classList.remove('border-white/10', 'bg-black/20');
      }

      calculateTotal();
    });
  });

  // --- Addons Selection ---
  const elAddonReel = document.getElementById('addonReel');
  const elAddonSession = document.getElementById('addonSession');
  const elAddonDrone = document.getElementById('addonDrone');
  const elAddonPhotobooth = document.getElementById('addonPhotobooth');

  if (elAddonReel) elAddonReel.addEventListener('change', (e) => { state.addons.reel = e.target.checked; calculateTotal(); });
  if (elAddonSession) elAddonSession.addEventListener('change', (e) => { state.addons.session = e.target.checked; calculateTotal(); });
  if (elAddonDrone) elAddonDrone.addEventListener('change', (e) => { state.addons.drone = e.target.checked; calculateTotal(); });
  if (elAddonPhotobooth) elAddonPhotobooth.addEventListener('change', (e) => { state.addons.photobooth = e.target.checked; calculateTotal(); });

  // --- Full Event Checkboxes ---
  const elFullBar = document.getElementById('fullBar');
  const elFullBuffet = document.getElementById('fullBuffet');
  const elFullDJ = document.getElementById('fullDJ');
  const elFullDecor = document.getElementById('fullDecor');

  if (elFullBar) elFullBar.addEventListener('change', (e) => { state.fullEvent.bar = e.target.checked; calculateTotal(); });
  if (elFullBuffet) elFullBuffet.addEventListener('change', (e) => { state.fullEvent.buffet = e.target.checked; calculateTotal(); });
  if (elFullDJ) elFullDJ.addEventListener('change', (e) => { state.fullEvent.dj = e.target.checked; calculateTotal(); });
  if (elFullDecor) elFullDecor.addEventListener('change', (e) => { state.fullEvent.decor = e.target.checked; calculateTotal(); });

  // --- Mode Switching (Photo Only vs Full Event) ---
  elTabModePhoto.addEventListener('click', () => {
    state.mode = 'photo';
    elTabModePhoto.classList.add('bg-gradient-to-r', 'from-cyan-500', 'to-teal-500', 'text-black', 'shadow-glow');
    elTabModePhoto.classList.remove('text-slate-400');
    elTabModeFull.classList.remove('bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white', 'shadow-glowPurple');
    elTabModeFull.classList.add('text-slate-400');

    elSectionFullEvent.classList.add('hidden');
    calculateTotal();
  });

  elTabModeFull.addEventListener('click', () => {
    state.mode = 'full';
    elTabModeFull.classList.add('bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white', 'shadow-glowPurple');
    elTabModeFull.classList.remove('text-slate-400');
    elTabModePhoto.classList.remove('bg-gradient-to-r', 'from-cyan-500', 'to-teal-500', 'text-black', 'shadow-glow');
    elTabModePhoto.classList.add('text-slate-400');

    elSectionFullEvent.classList.remove('hidden');
    calculateTotal();
  });

  // --- Currency Toggle ---
  elBtnCurrencyRON.addEventListener('click', () => {
    state.currency = 'RON';
    elBtnCurrencyRON.classList.add('bg-cyan-500/20', 'text-cyan-300', 'font-semibold');
    elBtnCurrencyRON.classList.remove('text-slate-400');
    elBtnCurrencyEUR.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'font-semibold');
    elBtnCurrencyEUR.classList.add('text-slate-400');
    calculateTotal();
  });

  elBtnCurrencyEUR.addEventListener('click', () => {
    state.currency = 'EUR';
    elBtnCurrencyEUR.classList.add('bg-cyan-500/20', 'text-cyan-300', 'font-semibold');
    elBtnCurrencyEUR.classList.remove('text-slate-400');
    elBtnCurrencyRON.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'font-semibold');
    elBtnCurrencyRON.classList.add('text-slate-400');
    calculateTotal();
  });

  // --- Copy Offer Action ---
  elBtnCopyOffer.addEventListener('click', () => {
    const dur = computeDuration(state.startHour, state.endHour);
    const totalRON = elTxtTotalPrice.textContent;
    const curr = elTxtCurrencyCode.textContent;

    let summaryText = `📸 ESTIMARE MAJORAT - PHOTOS BY DODO (@photosby_dodo)\n` +
      `-----------------------------------------\n` +
      `• Invitați: ${state.guests} persoane\n` +
      `• Interval: ${state.startHour}:00 - 0${state.endHour}:00 (${dur} ore)\n` +
      `• Pachet Foto: ${state.package.toUpperCase()}\n` +
      `• Total estimat: ${totalRON} ${curr}\n` +
      `-----------------------------------------\n` +
      `Instagram: https://www.instagram.com/photosby_dodo/`;

    navigator.clipboard.writeText(summaryText).then(() => {
      showToast('Ofertă copiată în clipboard!');
    }).catch(() => {
      showToast('Eroare la copiere.');
    });
  });

  // --- Print / PDF Action ---
  elBtnPrintPDF.addEventListener('click', () => {
    window.print();
  });

  // --- Settings Modal Logic ---
  const elSettingEssential = document.getElementById('settingRateEssential');
  const elSettingPro = document.getElementById('settingRatePro');
  const elSettingVIP = document.getElementById('settingRateVIP');
  const elSettingExtra = document.getElementById('settingRatePerPersonExtra');
  const elSettingEUR = document.getElementById('settingExchangeRate');

  function openSettings() {
    elSettingEssential.value = config.rateEssential;
    elSettingPro.value = config.ratePro;
    elSettingVIP.value = config.rateVIP;
    elSettingExtra.value = config.ratePerPersonExtra;
    elSettingEUR.value = config.exchangeRateEUR;
    elModalSettings.classList.remove('hidden');
  }

  function closeSettings() {
    elModalSettings.classList.add('hidden');
  }

  elBtnOpenSettings.addEventListener('click', openSettings);
  elBtnCloseSettings.addEventListener('click', closeSettings);

  elBtnSaveSettings.addEventListener('click', () => {
    config.rateEssential = parseFloat(elSettingEssential.value) || DEFAULT_CONFIG.rateEssential;
    config.ratePro = parseFloat(elSettingPro.value) || DEFAULT_CONFIG.ratePro;
    config.rateVIP = parseFloat(elSettingVIP.value) || DEFAULT_CONFIG.rateVIP;
    config.ratePerPersonExtra = parseFloat(elSettingExtra.value) || DEFAULT_CONFIG.ratePerPersonExtra;
    config.exchangeRateEUR = parseFloat(elSettingEUR.value) || DEFAULT_CONFIG.exchangeRateEUR;

    localStorage.setItem('dodo_calculator_config', JSON.stringify(config));
    closeSettings();
    showToast('Tarife actualizate cu succes!');
    calculateTotal();
  });

  elBtnResetSettings.addEventListener('click', () => {
    config = { ...DEFAULT_CONFIG };
    localStorage.removeItem('dodo_calculator_config');
    openSettings();
    showToast('Tarife resetate la valorile implicite!');
    calculateTotal();
  });

  // Initial Calculation
  calculateTotal();
});
