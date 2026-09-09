/**
 * Calculator Servicii Foto Majorat - Photos by Dodo
 * https://www.instagram.com/photosby_dodo/
 *
 * FORMULA:
 * PREȚ = 200 + 80 × (ORE - 1) + 5 × max(0, PERSOANE - 30) + TRANSPORT
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const elGuestsSlider = document.getElementById('inputGuestsSlider');
  const elGuestsDisplay = document.getElementById('txtGuestsDisplay');
  const elBtnMinus5 = document.getElementById('btnMinus5');
  const elBtnPlus5 = document.getElementById('btnPlus5');
  const elPersonRuleHint = document.getElementById('txtPersonRuleHint');

  const elSelectStart = document.getElementById('selectStartHour');
  const elSelectEnd = document.getElementById('selectEndHour');
  const elHoursTotalBadge = document.getElementById('txtHoursTotalBadge');

  const elInputTransport = document.getElementById('inputTransport');

  // Outputs
  const elGrandTotal = document.getElementById('txtGrandTotal');
  const elLblHoursExtra = document.getElementById('lblHoursExtraFormula');
  const elValHoursExtra = document.getElementById('valHoursExtraFormula');
  const elLblGuestsExtra = document.getElementById('lblGuestsExtraFormula');
  const elValGuestsExtra = document.getElementById('valGuestsExtraFormula');
  const elRowTransport = document.getElementById('rowTransportSummary');
  const elValTransport = document.getElementById('valTransportFormula');

  const elBtnCopyText = document.getElementById('btnCopyText');
  const elToast = document.getElementById('toast');

  // --- State ---
  let state = {
    guests: 30,
    startHour: 20,
    endHour: 2,
    transport: 0
  };

  // Helper to compute duration across midnight
  function computeDuration(start, end) {
    let s = parseInt(start, 10);
    let e = parseInt(end, 10);
    if (e <= s) {
      return (e + 24) - s;
    }
    return e - s;
  }

  // Update dynamic colored track on range input
  function updateSliderFill(el) {
    if (!el) return;
    const min = parseFloat(el.min) || 15;
    const max = parseFloat(el.max) || 120;
    const val = parseFloat(el.value) || 30;
    const percentage = ((val - min) / (max - min)) * 100;
    el.style.background = `linear-gradient(to right, #1e3a8a 0%, #1e3a8a ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
  }

  // --- Core Calculation ---
  function calculate() {
    const ORE = computeDuration(state.startHour, state.endHour);
    const PERSOANE = state.guests;
    const TRANSPORT = Math.max(0, parseInt(state.transport, 10) || 0);

    const baseCost = 200; // prima oră
    const extraHours = Math.max(0, ORE - 1);
    const extraHoursCost = extraHours * 80;

    const extraGuests = Math.max(0, PERSOANE - 30);
    const extraGuestsCost = extraGuests * 5;

    // PREȚ = 200 + 80 × (ORE - 1) + 5 × max(0, PERSOANE - 30) + TRANSPORT
    const total = baseCost + extraHoursCost + extraGuestsCost + TRANSPORT;

    // Update Grand Total
    elGrandTotal.textContent = total.toLocaleString('ro-RO');

    // Update Hours Badge
    elHoursTotalBadge.textContent = `${ORE} ore de fotografiere (ORE = ${ORE})`;

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

  // Range Slider Events
  elGuestsSlider.addEventListener('input', (e) => {
    setGuests(e.target.value);
  });
  elGuestsSlider.addEventListener('change', (e) => {
    setGuests(e.target.value);
  });

  // Buttons Step -5 / +5
  elBtnMinus5.addEventListener('click', () => {
    setGuests(state.guests - 5);
  });
  elBtnPlus5.addEventListener('click', () => {
    setGuests(state.guests + 5);
  });

  // Dropdowns Events (Strict Select from list)
  function onDropdownChange() {
    state.startHour = parseInt(elSelectStart.value, 10);
    state.endHour = parseInt(elSelectEnd.value, 10);
    calculate();
  }

  elSelectStart.addEventListener('change', onDropdownChange);
  elSelectEnd.addEventListener('change', onDropdownChange);

  // Transport Event
  elInputTransport.addEventListener('input', (e) => {
    state.transport = parseInt(e.target.value, 10) || 0;
    calculate();
  });

  // Copy Calculation Action
  if (elBtnCopyText) {
    elBtnCopyText.addEventListener('click', () => {
      const ORE = computeDuration(state.startHour, state.endHour);
      const total = elGrandTotal.textContent;
      const startFormatted = `${state.startHour}:00`;
      const endFormatted = state.endHour < 10 ? `0${state.endHour}:00` : `${state.endHour}:00`;

      const text = `📸 ESTIMARE FOTO MAJORAT - PHOTOS BY DODO\n` +
        `-----------------------------------------\n` +
        `• Număr persoane: ${state.guests} invitați\n` +
        `• Interval fotografiere: ${startFormatted} - ${endFormatted} (${ORE} ore)\n` +
        `• Notă: Sosire cu 30 de minute înainte de ora ${startFormatted} pentru pregătirea echipamentului.\n` +
        (state.transport > 0 ? `• Cost transport: ${state.transport} lei\n` : '') +
        `• PREȚ TOTAL: ${total} LEI\n` +
        `-----------------------------------------\n` +
        `Formula: 200 + 80 × (${ORE} - 1) + 5 × max(0, ${state.guests} - 30)\n` +
        `Instagram: https://www.instagram.com/photosby_dodo/`;

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
