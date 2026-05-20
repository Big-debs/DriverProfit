// ── Constants ──
const PLATFORM_BTN_IDS = ['btnBolt', 'btnUber', 'btnInDrive', 'btnZero'];
const PLATFORM_PRESETS = { btnBolt: 25, btnUber: 20, btnInDrive: 10, btnZero: 0 };
const PLATFORM_NAMES   = { btnBolt: 'Bolt', btnUber: 'Uber', btnInDrive: 'InDrive', btnZero: 'None' };
const DEFAULT_EFFICIENCY = 11;
const STORAGE_KEY = 'driverprofit_ledger';

const FUEL_TYPE_BTN_MAP = {
    petrol:   'ftPetrol',
    diesel:   'ftDiesel',
    cng:      'ftCNG',
    electric: 'ftElectric',
};

const FUEL_TYPES = {
    petrol: {
        priceLabel:       'Fuel Price (₦/L)',
        priceDefault:     850,
        effDefault:       11,
        effLabel:         'km/L',
        unitLabel:        'L',
        effTitle:         'Fuel Efficiency',
        effSub:           'Fine-tune km per litre',
        fuelPreviewLabel: 'FUEL COST',
        acSub:            '% drop in km/L with AC on',
    },
    diesel: {
        priceLabel:       'Diesel Price (₦/L)',
        priceDefault:     1100,
        effDefault:       11,
        effLabel:         'km/L',
        unitLabel:        'L',
        effTitle:         'Fuel Efficiency',
        effSub:           'Fine-tune km per litre',
        fuelPreviewLabel: 'FUEL COST',
        acSub:            '% drop in km/L with AC on',
    },
    cng: {
        priceLabel:       'CNG Price (₦/kg)',
        priceDefault:     280,
        effDefault:       10,
        effLabel:         'km/kg',
        unitLabel:        'kg',
        effTitle:         'Gas Efficiency',
        effSub:           'Fine-tune km per kg',
        fuelPreviewLabel: 'GAS COST',
        acSub:            '% drop in km/kg with AC on',
    },
    electric: {
        priceLabel:       'Energy Price (₦/kWh)',
        priceDefault:     200,
        effDefault:       6.0,
        effLabel:         'km/kWh',
        unitLabel:        'kWh',
        effTitle:         'Range Efficiency',
        effSub:           'Fine-tune km per kWh',
        fuelPreviewLabel: 'ENERGY COST',
        acSub:            '% range drop with AC on',
    },
};

const VEHICLE_PRESETS = {
    petrol: [
        { value: 11,  label: 'Corolla — 11 km/L'    },
        { value: 9,   label: 'Camry 2.4L — 9 km/L'  },
        { value: 10,  label: 'Accord 2.0L — 10 km/L'},
        { value: 13,  label: 'Elantra — 13 km/L'    },
        { value: 15,  label: 'Rio — 15 km/L'        },
        { value: 18,  label: 'S-Presso — 18 km/L'   },
        { value: 8,   label: 'Sienna — 8 km/L'      },
        { value: 9,   label: 'Lexus ES350 — 9 km/L' },
        { value: 22,  label: 'Keke — 22 km/L'       },
    ],
    diesel: [
        { value: 13,  label: 'Avensis D4D — 13 km/L' },
        { value: 11,  label: 'Hilux — 11 km/L'       },
        { value: 10,  label: 'Prado — 10 km/L'       },
        { value: 9,   label: 'Land Cruiser — 9 km/L' },
        { value: 12,  label: 'Sprinter — 12 km/L'    },
        { value: 8,   label: 'Hiace Bus — 8 km/L'    },
    ],
    cng: [
        { value: 10,  label: 'Corolla CNG — 10 km/kg' },
        { value: 9,   label: 'Camry CNG — 9 km/kg'    },
        { value: 9,   label: 'Accord CNG — 9 km/kg'   },
        { value: 8,   label: 'Sienna CNG — 8 km/kg'   },
        { value: 18,  label: 'Keke CNG — 18 km/kg'    },
        { value: 7,   label: 'SUV/Big Car — 7 km/kg'  },
    ],
    electric: [
        { value: 7.0, label: 'Qoray Caspian — 7 km/kWh' },
        { value: 6.5, label: 'BYD Dolphin — 6.5 km/kWh' },
        { value: 5.5, label: 'BYD Atto 3 — 5.5 km/kWh'  },
        { value: 6.0, label: 'Tesla Model 3 — 6 km/kWh'  },
        { value: 5.0, label: 'IONIQ 5 — 5 km/kWh'        },
        { value: 5.5, label: 'IONIQ 6 — 5.5 km/kWh'      },
        { value: 4.0, label: 'INNOSON G5t — 4 km/kWh'    },
    ],
};

// Engine displacement → typical Nigerian real-world efficiency (~15-20% below official specs).
// null = combo doesn't exist in Nigerian market.
const ENGINE_SIZE_MAP = {
    '0.8': { petrol: 16, diesel: null, cng: 11 },
    '1.0': { petrol: 15, diesel: null, cng: 11 },
    '1.2': { petrol: 14, diesel: null, cng: 10 },
    '1.4': { petrol: 12, diesel: null, cng:  9 },
    '1.5': { petrol: 11, diesel: 13,   cng:  9 },
    '1.6': { petrol: 11, diesel: 13,   cng:  9 },
    '1.8': { petrol: 10, diesel: 12,   cng:  8 },
    '2.0': { petrol:  9, diesel: 12,   cng:  8 },
    '2.4': { petrol:  8, diesel: 11,   cng:  7 },
    '2.5': { petrol:  8, diesel: 10,   cng:  7 },
    '3.0': { petrol:  7, diesel:  9,   cng:  6 },
    '4.0': { petrol:  6, diesel:  8,   cng:  5 },
};

// ── State ──
let platformFeePercentage = 25;
let currentPlatform       = 'Bolt';
let isSheetOpen           = false;
let ledgerTrips           = [];
let acOn                  = false;
let acPenaltyPct          = 15;
let fuelType              = 'petrol';
let fixedCosts            = { loan: 0, data: 0, parking: 0, wash: 0 };

// ── DOM refs ──
const elPlatformSlider   = document.getElementById('platformSlider');
const elSliderValDisplay = document.getElementById('sliderValDisplay');
const elFuelPrice        = document.getElementById('fuelPrice');
const elEfficiencyPreset = document.getElementById('efficiency');
const elManualEfficiency = document.getElementById('manualEfficiency');
const elTripGross        = document.getElementById('tripGross');
const elTripDistance     = document.getElementById('tripDistance');
const elTripHours        = document.getElementById('tripHours');
const elMaintRateInput   = document.getElementById('maintRateInput');

// ── Formatting ──
const fmt = n => {
    const abs = Math.abs(n).toLocaleString('en-NG', { maximumFractionDigits: 0 });
    return n < 0 ? `−₦${abs}` : `₦${abs}`;
};

// ── Persistence ──
function saveLedger() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            trips: ledgerTrips,
            fuelType,
            fixedCosts: {
                loan:    parseFloat(document.getElementById('fcLoan').value)    || 0,
                data:    parseFloat(document.getElementById('fcData').value)    || 0,
                parking: parseFloat(document.getElementById('fcParking').value) || 0,
                wash:    parseFloat(document.getElementById('fcWash').value)    || 0,
            },
        }));
    } catch {}
}

function loadLedger() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            if (Array.isArray(data)) {
                ledgerTrips = data;
            } else {
                ledgerTrips = data.trips || [];
                if (data.fuelType)   fuelType    = data.fuelType;
                if (data.fixedCosts) fixedCosts  = data.fixedCosts;
            }
        }
    } catch { ledgerTrips = []; }
}

// ── Animated profit counter ──
let _lastProfit = 0;
function animateProfit(target) {
    const el = document.getElementById('dailyNetProfit');
    const start = _lastProfit, delta = target - start;
    if (delta === 0) return;
    const dur = 380, t0 = performance.now();
    (function tick(now) {
        const p    = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.style.color = target < 0 ? 'var(--red)' : 'var(--green)';
        el.style.textShadow = target < 0
            ? '0 0 28px rgba(240,82,82,.3)'
            : target === 0 ? 'none' : '0 0 28px rgba(52,211,153,.25)';
        el.textContent = fmt(Math.round(start + delta * ease));
        if (p < 1) requestAnimationFrame(tick);
        else { _lastProfit = target; el.textContent = fmt(target); }
    })(t0);
    el.classList.remove('profit-pulse');
    void el.offsetWidth;
    el.classList.add('profit-pulse');
}

// ── Fuel type ──
function setFuelType(type) {
    fuelType = type;
    const cfg = FUEL_TYPES[type];

    Object.entries(FUEL_TYPE_BTN_MAP).forEach(([t, id]) =>
        document.getElementById(id).classList.toggle('active', t === type));

    document.getElementById('fuelPriceLabel').textContent  = cfg.priceLabel;
    document.getElementById('efficiencyTitle').textContent = cfg.effTitle;
    document.getElementById('efficiencySub').textContent   = cfg.effSub;
    document.getElementById('acPenaltySub').textContent    = cfg.acSub;

    elFuelPrice.value = cfg.priceDefault;

    elEfficiencyPreset.innerHTML = '';
    VEHICLE_PRESETS[type].forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.value;
        opt.textContent = p.label;
        elEfficiencyPreset.appendChild(opt);
    });
    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = 'Custom';
    elEfficiencyPreset.appendChild(customOpt);

    elManualEfficiency.value = cfg.effDefault.toFixed(1);

    document.getElementById('engineSizeBlock').style.display = type === 'electric' ? 'none' : '';
    document.getElementById('engineSize').value = '';

    if (!acOn) {
        document.getElementById('previewFuelLabel').textContent = cfg.fuelPreviewLabel;
        document.getElementById('previewFuelLabel').style.color = '';
    }

    saveLedger();
    updateCurrentTripPreview();
}

// ── Engine size helper ──
function handleEngineSizeSelect(displacement) {
    if (!displacement) return;
    const row = ENGINE_SIZE_MAP[displacement];
    if (!row) return;
    const eff = row[fuelType];
    if (eff == null) {
        document.getElementById('engineSize').value = '';
        return;
    }
    elManualEfficiency.value = eff.toFixed(1);
    handleManualEfficiencyInput(elManualEfficiency.value);
}

// ── Platform commission ──
function setPlatform(pct, btnId) {
    platformFeePercentage = pct;
    currentPlatform = PLATFORM_NAMES[btnId] || 'Custom';
    elPlatformSlider.value = pct;
    elSliderValDisplay.textContent = pct.toFixed(1) + '%';
    syncSliderTrack(pct);
    PLATFORM_BTN_IDS.forEach(id =>
        document.getElementById(id).classList.toggle('active', id === btnId));
    updateCurrentTripPreview();
}

function syncSliderTrack(val) {
    elPlatformSlider.style.setProperty('--pct', val + '%');
}

function handleSliderInput(value) {
    const v = parseFloat(value);
    platformFeePercentage = v;
    elSliderValDisplay.textContent = v.toFixed(1) + '%';
    syncSliderTrack(v);
    let matched = false;
    Object.entries(PLATFORM_PRESETS).forEach(([id, p]) => {
        const isMatch = p === v;
        document.getElementById(id).classList.toggle('active', isMatch);
        if (isMatch) { currentPlatform = PLATFORM_NAMES[id]; matched = true; }
    });
    if (!matched) currentPlatform = 'Custom';
    updateCurrentTripPreview();
}

// ── Vehicle / efficiency ──
function handlePresetSelect(value) {
    if (value !== 'custom') elManualEfficiency.value = parseFloat(value).toFixed(1);
    document.getElementById('engineSize').value = '';
    updateCurrentTripPreview();
}

function handleManualEfficiencyInput(value) {
    const v = parseFloat(value) || 0;
    let matched = false;
    Array.from(elEfficiencyPreset.options).forEach((opt, i) => {
        if (opt.value !== 'custom' && parseFloat(opt.value) === v) {
            elEfficiencyPreset.selectedIndex = i;
            matched = true;
        }
    });
    if (!matched) elEfficiencyPreset.value = 'custom';
    updateCurrentTripPreview();
}

function adjustEfficiency(step) {
    const v = Math.max(0.1, (parseFloat(elManualEfficiency.value) || DEFAULT_EFFICIENCY) + step);
    elManualEfficiency.value = v.toFixed(1);
    handleManualEfficiencyInput(elManualEfficiency.value);
}

// ── AC toggle ──
function toggleAC() {
    acOn = !acOn;
    const cfg = FUEL_TYPES[fuelType];
    document.getElementById('acToggle').classList.toggle('on', acOn);
    document.getElementById('acIcon').style.color = acOn ? 'var(--blue)' : 'rgba(96,165,250,.5)';
    document.getElementById('acPenaltyRow').classList.toggle('show', acOn);
    const statusText = document.getElementById('acStatusText');
    const fuelLabel  = document.getElementById('previewFuelLabel');
    if (acOn) {
        statusText.textContent = `On — −${acPenaltyPct}% ${cfg.effLabel}`;
        statusText.style.color = 'var(--blue)';
        fuelLabel.textContent  = cfg.fuelPreviewLabel + ' (AC ON)';
        fuelLabel.style.color  = 'var(--blue)';
    } else {
        statusText.textContent = 'Off — no impact';
        statusText.style.color = '';
        fuelLabel.textContent  = cfg.fuelPreviewLabel;
        fuelLabel.style.color  = '';
    }
    updateCurrentTripPreview();
}

function adjustAcPenalty(step) {
    acPenaltyPct = Math.max(1, Math.min(50, acPenaltyPct + step));
    document.getElementById('acPenaltyDisplay').textContent = acPenaltyPct + '%';
    if (acOn) {
        document.getElementById('acStatusText').textContent =
            `On — −${acPenaltyPct}% ${FUEL_TYPES[fuelType].effLabel}`;
    }
    updateCurrentTripPreview();
}

// ── Maintenance rate ──
function adjustMaintRate(step) {
    const v = Math.max(0, (parseFloat(elMaintRateInput.value) || 0) + step);
    elMaintRateInput.value = v;
    updateCurrentTripPreview();
}

// ── Fixed daily costs ──
function getFixedCostsTotal() {
    return (parseFloat(document.getElementById('fcLoan').value)    || 0)
         + (parseFloat(document.getElementById('fcData').value)    || 0)
         + (parseFloat(document.getElementById('fcParking').value) || 0)
         + (parseFloat(document.getElementById('fcWash').value)    || 0);
}

function updateFixedCosts() {
    const total = getFixedCostsTotal();
    document.getElementById('fcTotal').textContent = fmt(total);
    saveLedger();
    calcDailyTotals();
}

// ── Trip calculation ──
function calcTrip() {
    const gross     = Math.max(0, parseFloat(elTripGross.value)          || 0);
    const distance  = Math.max(0, parseFloat(elTripDistance.value)       || 0);
    const hours     = Math.max(0, parseFloat(elTripHours.value)          || 0);
    const fuelPrice = Math.max(0, parseFloat(elFuelPrice.value)          || 0);
    const baseEff   = Math.max(0.1, parseFloat(elManualEfficiency.value) || DEFAULT_EFFICIENCY);
    const maintRate = Math.max(0, parseFloat(elMaintRateInput.value)     || 0);

    const effRate    = acOn ? baseEff * (1 - acPenaltyPct / 100) : baseEff;
    const platDeduct = gross * (platformFeePercentage / 100);
    const units      = effRate > 0 ? distance / effRate : 0;
    const fuelCost   = units * fuelPrice;
    const maintCost  = distance * maintRate;
    const net        = gross - platDeduct - fuelCost - maintCost;
    const revPkm     = distance > 0 ? gross / distance : 0;
    const costPkm    = distance > 0 ? (platDeduct + fuelCost + maintCost) / distance : 0;
    const profPkm    = distance > 0 ? net / distance : 0;
    const margin     = gross > 0 ? (net / gross) * 100 : 0;

    return { gross, distance, hours, liters: units, platDeduct, fuelCost, maintCost, net, revPkm, costPkm, profPkm, margin };
}

function marginColor(margin) {
    return margin < 15 ? 'var(--red)' : margin < 30 ? 'var(--amber)' : 'var(--green)';
}

function updateCurrentTripPreview() {
    const s = calcTrip();

    document.getElementById('previewPlatform').textContent  = fmt(s.platDeduct);
    document.getElementById('previewFuel').textContent      = fmt(s.fuelCost);
    document.getElementById('previewMaint').textContent     = fmt(s.maintCost);

    const netEl = document.getElementById('previewNet');
    netEl.textContent = fmt(s.net);
    netEl.style.color = s.net < 0 ? 'var(--red)' : 'var(--green)';

    document.getElementById('previewRevPerKm').textContent  = fmt(s.revPkm);
    document.getElementById('previewCostPerKm').textContent = fmt(s.costPkm);

    const profEl = document.getElementById('previewProfitPerKm');
    profEl.textContent = fmt(s.profPkm);
    profEl.style.color = marginColor(s.margin);

    const marginEl = document.getElementById('previewMargin');
    marginEl.textContent = s.margin.toFixed(0) + '%';
    marginEl.style.color = marginColor(s.margin);

    const mRate = parseFloat(elMaintRateInput.value) || 0;
    const dist  = parseFloat(elTripDistance.value)   || 0;
    const hint  = document.getElementById('maintEstimate');
    if (mRate > 0 && dist > 0) {
        hint.textContent = `₦${mRate}/km × ${dist} km = ₦${Math.round(s.maintCost).toLocaleString()}`;
        hint.style.color = 'var(--purple)';
    } else if (mRate > 0) {
        hint.textContent = `₦${mRate}/km — set trip distance to preview`;
        hint.style.color = '';
    } else {
        hint.textContent = 'Set a rate above to track wear costs';
        hint.style.color = '';
    }
}

// ── Ledger ──
function addTrip() {
    const s = calcTrip();
    if (s.gross <= 0 && s.distance <= 0) return;
    ledgerTrips.push({
        id: Date.now(),
        acWasOn: acOn,
        fuelType,
        platform: currentPlatform,
        platformPct: platformFeePercentage,
        ...s,
    });
    elTripGross.value = elTripDistance.value = elTripHours.value = '';
    updateCurrentTripPreview();
    renderLedger();
    calcDailyTotals();
    saveLedger();
    const btn = document.getElementById('addTripBtn');
    btn.classList.add('btn-flash');
    setTimeout(() => btn.classList.remove('btn-flash'), 380);
}

function deleteTrip(id) {
    ledgerTrips = ledgerTrips.filter(t => t.id !== id);
    renderLedger();
    calcDailyTotals();
    saveLedger();
}

function clearLedger() {
    ledgerTrips = [];
    renderLedger();
    calcDailyTotals();
    saveLedger();
}

function renderLedger() {
    const list  = document.getElementById('tripsList');
    const empty = document.getElementById('noTripsMessage');
    list.querySelectorAll('.trip-row').forEach(n => n.remove());
    if (!ledgerTrips.length) { empty.style.display = ''; return; }
    empty.style.display = 'none';

    ledgerTrips.forEach((trip, idx) => {
        const netColor     = trip.net < 0 ? 'var(--red)' : 'var(--green)';
        const mColor       = marginColor(trip.margin);
        const tripFuelType = trip.fuelType || 'petrol';
        const unitLabel    = FUEL_TYPES[tripFuelType]?.unitLabel || 'L';

        const acBadge   = trip.acWasOn
            ? `<span class="badge badge-ac">AC</span>` : '';
        const fuelBadge = tripFuelType !== 'petrol'
            ? `<span class="badge badge-gray">${tripFuelType.toUpperCase()}</span>` : '';

        let platBadge = '';
        if (trip.platform) {
            const platKey = trip.platform.toLowerCase();
            const pctStr  = trip.platformPct != null ? ' ' + trip.platformPct.toFixed(0) + '%' : '';
            platBadge = `<span class="badge badge-${platKey}">${trip.platform}${pctStr}</span>`;
        }

        const maintLine = trip.maintCost > 0
            ? `<span class="trip-sep">|</span><span>Wear: <b style="color:var(--purple)">₦${Math.round(trip.maintCost).toLocaleString()}</b></span>`
            : '';

        const row = document.createElement('div');
        row.className = 'trip-row';
        row.innerHTML = `
            <div class="trip-top">
                <div class="trip-info">
                    <div class="trip-tags">
                        <span class="trip-name">Trip #${idx + 1}</span>
                        ${platBadge}
                        <span class="badge badge-gray">${trip.distance} km · ${trip.hours}h</span>
                        ${acBadge}${fuelBadge}
                    </div>
                    <div class="trip-costs">
                        <span>Gross: <b style="color:var(--text-primary)">₦${trip.gross.toLocaleString()}</b></span>
                        <span class="trip-sep">|</span>
                        <span>Fee: <b style="color:var(--red)">₦${Math.round(trip.platDeduct).toLocaleString()}</b></span>
                        <span class="trip-sep">|</span>
                        <span>Fuel: <b style="color:var(--amber)">₦${Math.round(trip.fuelCost).toLocaleString()}</b> (${trip.liters.toFixed(1)} ${unitLabel})</span>
                        ${maintLine}
                    </div>
                </div>
                <div class="trip-net-col">
                    <div style="text-align:right">
                        <span class="trip-net-lbl">Net</span>
                        <span class="trip-net-val" style="color:${netColor}">${fmt(trip.net)}</span>
                    </div>
                    <button class="trip-del" onclick="deleteTrip(${trip.id})">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="trip-eco">
                <div>Rev/km<b style="color:var(--text-primary)">₦${Math.round(trip.revPkm)}</b></div>
                <div>Cost/km<b style="color:var(--red)">₦${Math.round(trip.costPkm)}</b></div>
                <div>Profit/km<b style="color:var(--green)">₦${Math.round(trip.profPkm)}</b></div>
                <div>Margin<b style="color:${mColor}">${trip.margin.toFixed(0)}%</b></div>
            </div>`;
        list.appendChild(row);
    });
}

// ── Daily totals ──
function calcDailyTotals() {
    let totalGross = 0, totalDist = 0, totalHours = 0;
    let totalPlatform = 0, totalFuel = 0, totalLiters = 0, totalMaint = 0, totalNet = 0;

    ledgerTrips.forEach(t => {
        totalGross    += t.gross;
        totalDist     += t.distance;
        totalHours    += t.hours;
        totalPlatform += t.platDeduct;
        totalFuel     += t.fuelCost;
        totalLiters   += t.liters;
        totalMaint    += t.maintCost;
        totalNet      += t.net;
    });

    const fixedTotal = getFixedCostsTotal();
    const trueNet    = totalNet - fixedTotal;

    // ── Break-even banner ──
    const banner = document.getElementById('breakEvenBanner');
    if (fixedTotal > 0 || ledgerTrips.length > 0) {
        banner.style.display = '';
        const beTxt = document.getElementById('breakEvenText');
        if (ledgerTrips.length === 0 && fixedTotal > 0) {
            beTxt.textContent = `${fmt(fixedTotal)} in fixed costs — start logging trips`;
            banner.className = 'breakeven-banner banner-need';
        } else if (trueNet < 0) {
            beTxt.textContent = `Need ${fmt(-trueNet)} more to break even`;
            banner.className = 'breakeven-banner banner-need';
        } else {
            beTxt.textContent = `${fmt(trueNet)} above all costs today`;
            banner.className = 'breakeven-banner banner-above';
        }
    } else {
        banner.style.display = 'none';
    }

    // ── Header ──
    animateProfit(trueNet);
    document.getElementById('summaryTrips').textContent    = ledgerTrips.length;
    document.getElementById('summaryDistance').textContent = totalDist.toFixed(0) + ' km';
    document.getElementById('summaryHours').textContent    = totalHours.toFixed(1) + 'h';
    const hourlyWage = totalHours > 0 ? trueNet / totalHours : 0;
    document.getElementById('summaryHourly').textContent   = fmt(Math.round(hourlyWage));

    // ── Bottom sheet ──
    const avgPlatPct  = totalGross > 0 ? (totalPlatform / totalGross) * 100 : platformFeePercentage;
    const revPerKm    = totalDist > 0 ? totalGross / totalDist : 0;
    const costPerKm   = totalDist > 0 ? (totalPlatform + totalFuel + totalMaint + fixedTotal) / totalDist : 0;
    const profPerKm   = totalDist > 0 ? trueNet / totalDist : 0;
    const shiftMargin = totalGross > 0 ? (trueNet / totalGross) * 100 : 0;
    const maintRate   = parseFloat(elMaintRateInput.value) || 0;
    const unitLabel   = FUEL_TYPES[fuelType].unitLabel;

    document.getElementById('bdGross').textContent         = fmt(totalGross);
    document.getElementById('bdPlatform').textContent      = '− ' + fmt(totalPlatform);
    document.getElementById('bdPlatformPct').textContent   = 'Avg ' + avgPlatPct.toFixed(1) + '%';
    document.getElementById('bdFuel').textContent          = '− ' + fmt(totalFuel);
    document.getElementById('bdLiters').textContent        = totalLiters.toFixed(1) + ' ' + unitLabel;
    document.getElementById('bdMaint').textContent         = '− ' + fmt(totalMaint);
    document.getElementById('bdMaintPerKm').textContent    = maintRate > 0 ? `₦${maintRate}/km` : '₦0/km';

    // Fixed costs row in sheet
    const fixedRow = document.getElementById('bdFixedRow');
    if (fixedTotal > 0) {
        fixedRow.style.display = '';
        document.getElementById('bdFixed').textContent = '− ' + fmt(fixedTotal);
        document.getElementById('bdFixedDetail').textContent = fmt(fixedTotal) + '/day';
        const fixedFrac = totalGross > 0 ? Math.min((fixedTotal / totalGross) * 100, 100) : 0;
        document.getElementById('barFixed').style.width = fixedFrac + '%';
    } else {
        fixedRow.style.display = 'none';
    }

    // Net + hourly (true net including fixed costs)
    const netEl = document.getElementById('bdNet');
    netEl.textContent  = fmt(trueNet);
    netEl.style.color  = trueNet < 0 ? 'var(--red)' : '#6ee7b7';
    document.getElementById('bdHourly').textContent  = fmt(Math.round(hourlyWage)) + '/hr';
    document.getElementById('bdRevPerKm').textContent    = fmt(revPerKm);
    document.getElementById('bdCostPerKm').textContent   = fmt(costPerKm);
    document.getElementById('bdProfitPerKm').textContent = fmt(profPerKm);
    document.getElementById('bdMargin').textContent      = shiftMargin.toFixed(1) + '%';

    const platFrac  = totalGross > 0 ? Math.min((totalPlatform / totalGross) * 100, 100) : 0;
    const fuelFrac  = totalGross > 0 ? Math.min((totalFuel     / totalGross) * 100, 100) : 0;
    const maintFrac = totalGross > 0 ? Math.min((totalMaint    / totalGross) * 100, 100) : 0;
    document.getElementById('barPlatform').style.width = platFrac  + '%';
    document.getElementById('barFuel').style.width     = fuelFrac  + '%';
    document.getElementById('barMaint').style.width    = maintFrac + '%';
}

// ── WhatsApp share ──
function shareToWhatsApp() {
    if (!ledgerTrips.length) return;
    let totalGross = 0, totalDist = 0, totalHours = 0;
    let totalPlatform = 0, totalFuel = 0, totalMaint = 0, totalNet = 0;
    ledgerTrips.forEach(t => {
        totalGross    += t.gross;
        totalDist     += t.distance;
        totalHours    += t.hours;
        totalPlatform += t.platDeduct;
        totalFuel     += t.fuelCost;
        totalMaint    += t.maintCost;
        totalNet      += t.net;
    });
    const fixedTotal = getFixedCostsTotal();
    const trueNet    = totalNet - fixedTotal;
    const today = new Date().toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const n = v => '₦' + Math.round(Math.abs(v)).toLocaleString('en-NG');

    let msg = `*DriverProfit Daily Summary*\n${today}\n\n`;
    msg += `${ledgerTrips.length} trips · ${totalDist.toFixed(0)} km · ${totalHours.toFixed(1)}h\n\n`;
    msg += `Gross Earnings:      ${n(totalGross)}\n`;
    msg += `Platform Fees:     −${n(totalPlatform)}\n`;
    msg += `Fuel / Energy:     −${n(totalFuel)}\n`;
    msg += `Maintenance:       −${n(totalMaint)}\n`;
    if (fixedTotal > 0) msg += `Fixed Costs:       −${n(fixedTotal)}\n`;
    msg += `\n*Take-Home: ${trueNet < 0 ? '−' : ''}${n(trueNet)}*`;
    if (totalHours > 0) msg += `\nHourly rate: ${n(Math.abs(trueNet / totalHours))}/hr`;
    msg += `\n\n_Tracked with DriverProfit_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

// ── Theme ──
function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('dp_theme', isLight ? 'light' : 'dark');
    document.getElementById('metaThemeColor').setAttribute('content', isLight ? '#f0f4f1' : '#030d05');
    document.getElementById('iconSun').style.display  = isLight ? 'none' : '';
    document.getElementById('iconMoon').style.display = isLight ? ''     : 'none';
}

// ── Bottom sheet ──
function toggleSheet() {
    isSheetOpen = !isSheetOpen;
    document.getElementById('bottomSheet').classList.toggle('open', isSheetOpen);
    document.getElementById('backdrop').classList.toggle('show', isSheetOpen);
}

// ── Init ──
// Sync theme icon with persisted preference
(function () {
    const isLight = document.documentElement.classList.contains('light');
    if (isLight) {
        document.getElementById('iconSun').style.display  = 'none';
        document.getElementById('iconMoon').style.display = '';
        document.getElementById('metaThemeColor').setAttribute('content', '#f0f4f1');
    }
})();

loadLedger();

// Restore fixed cost inputs from saved state
if (fixedCosts.loan)    document.getElementById('fcLoan').value    = fixedCosts.loan;
if (fixedCosts.data)    document.getElementById('fcData').value    = fixedCosts.data;
if (fixedCosts.parking) document.getElementById('fcParking').value = fixedCosts.parking;
if (fixedCosts.wash)    document.getElementById('fcWash').value    = fixedCosts.wash;
const _fcInit = fixedCosts.loan + fixedCosts.data + fixedCosts.parking + fixedCosts.wash;
if (_fcInit > 0) document.getElementById('fcTotal').textContent = fmt(_fcInit);

setFuelType(fuelType);
updateCurrentTripPreview();
renderLedger();
calcDailyTotals();
