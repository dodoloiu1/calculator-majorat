/**
 * Calculator Servicii Foto Majorat - Photos by Dodo
 * https://www.instagram.com/photosby_dodo/
 *
 * FORMULA:
 * PREȚ = 200 + 80 × (ORE - 1) + 5 × max(0, PERSOANE - 30) + TRANSPORT
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const elGuestsSlider = document.getElementById('inputGuestsSlider');
  const elGuestsDisplay = document.getElementById('txtGuestsDisplay');
  const elBtnMinus5 = document.getElementById('btnMinus5');
  const elBtnPlus5 = document.getElementById('btnPlus5');
  const elPersonRuleHint = document.getElementById('txtPersonRuleHint');

  const elSelectStart = document.getElementById('selectStartHour');
  const elSelectEnd = document.getElementById('selectEndHour');
  const elHoursSlider = document.getElementById('inputHoursSlider');
  const elHoursSliderVal = document.getElementById('txtHoursSliderVal');
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

  const elBtnWhatsApp = document.getElementById('btnWhatsApp');
  const elBtnCopyText = document.getElementById('btnCopyText');
  const elToast = document.getElementById('toast');

  // State
  let state = {
    guests: 30,      // default 30
    hours: 6,        // default 6h (20:00 -> 02:00)
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

  // Exact formula calculation
  function calculate() {
    const ORE = Math.max(1, state.hours);
    const PERSOANE = state.guests;
    const TRANSPORT = Math.max(0, parseInt(state.transport, 10) || 0);

    const baseCost = 200; // prima ora
    const extraHours = Math.max(0, ORE - 1);
    const extraHoursCost = extraHours * 80;

    const extraGuests = Math.max(0, PERSOANE - 30);
    const extraGuestsCost = extraGuests * 5;

    // PREȚ = 200 + 80 × (ORE - 1) + 5 × max(0, PERSOANE - 30) + TRANSPORT
    const total = baseCost + extraHoursCost + extraGuestsCost + TRANSPORT;

    // Update UI Elements
    elGrandTotal.textContent = total.toLocaleString('ro-RO');

    // Update formula breakdown
    elLblHoursExtra.textContent = `• ${extraHours} ore suplimentare × 80 lei:`;
    elValHoursExtra.textContent = `${extraHoursCost} lei`;

    if (extraGuests > 0) {
      elLblGuestsExtra.textContent = `• ${extraGuests} persoane peste 30 × 5 lei:`;
      elValGuestsExtra.textContent = `+${extraGuestsCost} lei`;
      elPersonRuleHint.textContent = `+${extraGuestsCost} lei pentru cele ${extraGuests} persoane peste 30`;
    } else {
      elLblGuestsExtra.textContent = `• 0 persoane peste 30 (sub 30 pers inclus):`;
      elValGuestsExtra.textContent = `0 lei`;
      elPersonRuleHint.textContent = `30 persoane incluse în preț (fără cost suplimentar)`;
    }

    if (TRANSPORT > 0) {
      elRowTransport.classList.remove('hidden');
      elValTransport.textContent = `${TRANSPORT} lei`;
    } else {
      elRowTransport.classList.add('hidden');
    }

    // WhatsApp prefilled message
    updateWhatsApp(ORE, PERSOANE, total, TRANSPORT);
  }

  function updateWhatsApp(hours, guests, total, transport) {
    let text = `Salut Dodo! 👋 Am calculat oferta pentru foto majorat:\n` +
      `• Număr invitați: ${guests} persoane\n` +
      `• Durată: ${hours} ore (${state.startHour}:00 - 0${state.endHour}:00)\n` +
      (transport > 0 ? `• Deplasare / Transport: ${transport} lei\n` : '') +
      `• PREȚ TOTAL: ${total} lei\n\n` +
      `Aș vrea să verific dacă este liberă data mea!`;

    elBtnWhatsApp.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
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

    calculate();
  }

  elGuestsSlider.addEventListener('input', (e) => {
    setGuests(e.target.value);
  });

  elBtnMinus5.addEventListener('click', () => {
    setGuests(state.guests - 5);
  });

  elBtnPlus5.addEventListener('click', () => {
    setGuests(state.guests + 5);
  });

  // Hours change via dropdown
  function onDropdownChange() {
    state.startHour = parseInt(elSelectStart.value, 10);
    state.endHour = parseInt(elSelectEnd.value, 10);
    const dur = computeDuration(state.startHour, state.endHour);

    state.hours = dur;
    elHoursSlider.value = Math.min(12, Math.max(2, dur));
    elHoursSliderVal.textContent = `${dur} ore`;
    elHoursTotalBadge.textContent = `${dur} ore (ORE = ${dur})`;

    calculate();
  }

  elSelectStart.addEventListener('change', onDropdownChange);
  elSelectEnd.addEventListener('change', onDropdownChange);

  // Hours change via slider
  elHoursSlider.addEventListener('input', (e) => {
    const h = parseInt(e.target.value, 10);
    state.hours = h;
    elHoursSliderVal.textContent = `${h} ore`;
    elHoursTotalBadge.textContent = `${h} ore (ORE = ${h})`;

    // Automatically set end hour based on start hour
    let newEnd = (state.startHour + h) % 24;
    // Check if newEnd exists in selectEndHour
    let optionFound = false;
    for (let opt of elSelectEnd.options) {
      if (parseInt(opt.value, 10) === newEnd) {
        elSelectEnd.value = newEnd;
        state.endHour = newEnd;
        optionFound = true;
        break;
      }
    }

    calculate();
  });

  // Transport change
  elInputTransport.addEventListener('input', (e) => {
    state.transport = parseInt(e.target.value, 10) || 0;
    calculate();
  });

  // Copy offer text
  elBtnCopyText.addEventListener('click', () => {
    const ORE = state.hours;
    const total = elGrandTotal.textContent;
    const text = `📸 CALCUL FOTO MAJORAT - PHOTOS BY DODO\n` +
      `• Durată: ${ORE} ore\n` +
      `• Persoane: ${state.guests}\n` +
      (state.transport > 0 ? `• Transport: ${state.transport} lei\n` : '') +
      `• PREȚ TOTAL: ${total} LEI\n` +
      `Formula: 200 + 80 × (${ORE}-1) + 5 × max(0, ${state.guests}-30)\n` +
      `Instagram: https://www.instagram.com/photosby_dodo/`;

    navigator.clipboard.writeText(text).then(() => {
      elToast.style.opacity = '1';
      setTimeout(() => {
        elToast.style.opacity = '0';
      }, 2500);
    });
  });

  // Initial calculation
  calculate();
});
