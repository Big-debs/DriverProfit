// ── Analytics ──
const ANALYTICS_QUEUE_KEY = 'dp_analytics_queue';
const ANALYTICS_MAX_QUEUE = 50;

function trackEvent(name, data) {
    if (navigator.onLine && typeof window.va === 'function') {
        window.va('event', { name, data });
    } else {
        try {
            const queue = JSON.parse(localStorage.getItem(ANALYTICS_QUEUE_KEY) || '[]');
            queue.push({ name, data });
            if (queue.length > ANALYTICS_MAX_QUEUE) queue.splice(0, queue.length - ANALYTICS_MAX_QUEUE);
            localStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(queue));
        } catch {}
    }
}

function flushAnalyticsQueue() {
    if (!navigator.onLine || typeof window.va !== 'function') return;
    try {
        const queue = JSON.parse(localStorage.getItem(ANALYTICS_QUEUE_KEY) || '[]');
        if (!queue.length) return;
        queue.forEach(({ name, data }) => window.va('event', { name, data }));
        localStorage.removeItem(ANALYTICS_QUEUE_KEY);
    } catch {}
}

// Flush when coming back online, and after page load (gives the deferred Vercel script time to init)
window.addEventListener('online', flushAnalyticsQueue);
window.addEventListener('load', () => setTimeout(flushAnalyticsQueue, 1500));

// ── Constants ──
const PLATFORM_BTN_IDS = ['btnBolt', 'btnUber', 'btnInDrive', 'btnZero'];
const PLATFORM_PRESETS = { btnBolt: 20, btnUber: 25, btnInDrive: 7.5, btnZero: 0 };
const PLATFORM_NAMES   = { btnBolt: 'Bolt', btnUber: 'Uber', btnInDrive: 'InDrive', btnZero: 'None' };
const DEFAULT_EFFICIENCY = 11;
const STORAGE_KEY = 'driverprofit_ledger';
const STORAGE_VERSION = 2;

const OPERATOR_MODE_BTN_IDS = {
    car: 'modeCar',
    bike: 'modeBike',
    keke: 'modeKeke',
};

const OPERATOR_MODES = {
    car: {
        label: 'E-hailing Car',
        logTitle: 'Log Trip',
        grossLabel: 'Gross Earnings (â‚¦)',
        grossPlaceholder: 'e.g. 12000',
        distanceLabel: 'Distance (km)',
        hoursLabel: 'Duration (hrs)',
        addLabel: 'Add Trip to Ledger',
        platformLabel: 'Platform Commission',
        vehicleLabel: 'Vehicle',
        fixedLabels: ['Car Loan / Hire Purchase', 'Data Subscription', 'Parking / Toll', 'Car Wash'],
        unitPrimary: 'Profit/km',
        unitSecondary: 'Profit/hr',
    },
    bike: {
        label: 'Dispatch Bike',
        logTitle: 'Log Delivery',
        grossLabel: 'Delivery Fee / Payout (â‚¦)',
        grossPlaceholder: 'e.g. 3500',
        distanceLabel: 'Delivery Distance (km)',
        hoursLabel: 'Time Spent (hrs)',
        addLabel: 'Add Delivery to Ledger',
        platformLabel: 'Company / Platform Commission',
        vehicleLabel: 'Bike Preset',
        fixedLabels: ['Rider Remittance', 'Data Subscription', 'Parking / Security', 'Power / Charging'],
        unitPrimary: 'Profit/km',
        unitSecondary: 'Profit/hr',
    },
    keke: {
        label: 'Keke / Tricycle',
        logTitle: 'Log Route / Charter',
        grossLabel: 'Fare Collected (â‚¦)',
        grossPlaceholder: 'e.g. 8000',
        distanceLabel: 'Route Distance (km)',
        hoursLabel: 'Hours Worked',
        addLabel: 'Add Route to Ledger',
        platformLabel: 'Union / Platform Commission',
        vehicleLabel: 'Keke Preset',
        fixedLabels: ['Owner Delivery / Remittance', 'Union Ticket', 'Park Ticket', 'Loading / Wash'],
        unitPrimary: 'Profit/km',
        unitSecondary: 'Profit/hr',
    },
};

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
let platformFeePercentage = 20;
let currentPlatform       = 'Bolt';
let isSheetOpen           = false;
let ledgerTrips           = [];
let ledgerByDate          = {};
let activeDateKey         = getTodayKey();
let acOn                  = false;
let acPenaltyPct          = 15;
let fuelType              = 'petrol';
let operatorMode          = 'car';
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
const elTripDrops        = document.getElementById('tripDrops');
const elTripFailedDrops  = document.getElementById('tripFailedDrops');
const elTripPassengers   = document.getElementById('tripPassengers');
const elTripTurns        = document.getElementById('tripTurns');
const elMaintRateInput   = document.getElementById('maintRateInput');

// ── Formatting ──
const fmt = n => {
    const abs = Math.abs(n).toLocaleString('en-NG', { maximumFractionDigits: 0 });
    return n < 0 ? `−₦${abs}` : `₦${abs}`;
};

// ── Persistence ──
function getTodayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function todayLabel() {
    return new Date().toLocaleDateString('en-NG', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function createClientId() {
    if (globalThis.crypto?.randomUUID) return `local_${globalThis.crypto.randomUUID()}`;
    return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTrip(trip) {
    if (!trip.client_id) trip.client_id = createClientId();
    if (!trip.sync_status) trip.sync_status = 'pending';
    if (!trip.date) trip.date = activeDateKey;
    return {
        ...trip,
    };
}

function getCurrentFixedCosts() {
    return {
        loan:    parseFloat(document.getElementById('fcLoan').value)    || 0,
        data:    parseFloat(document.getElementById('fcData').value)    || 0,
        parking: parseFloat(document.getElementById('fcParking').value) || 0,
        wash:    parseFloat(document.getElementById('fcWash').value)    || 0,
    };
}

function applyFixedCostsToInputs(costs) {
    document.getElementById('fcLoan').value    = costs.loan    || '';
    document.getElementById('fcData').value    = costs.data    || '';
    document.getElementById('fcParking').value = costs.parking || '';
    document.getElementById('fcWash').value    = costs.wash    || '';
    document.getElementById('fcTotal').textContent =
        fmt((costs.loan || 0) + (costs.data || 0) + (costs.parking || 0) + (costs.wash || 0));
}

function saveLedger() {
    try {
        const currentFixedCosts = getCurrentFixedCosts();
        ledgerByDate[activeDateKey] = {
            trips: ledgerTrips.map(normalizeTrip),
            fixedCosts: currentFixedCosts,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: STORAGE_VERSION,
            currentDate: activeDateKey,
            ledgerByDate,
            fuelType,
            operatorMode,
            fixedCosts: currentFixedCosts,
        }));
    } catch {}
}

function loadLedger() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            if (Array.isArray(data)) {
                ledgerByDate = {
                    [activeDateKey]: {
                        trips: data.map(normalizeTrip),
                        fixedCosts,
                    },
                };
            } else {
                ledgerByDate = data.ledgerByDate || {
                    [activeDateKey]: {
                        trips: (data.trips || []).map(normalizeTrip),
                        fixedCosts: data.fixedCosts || fixedCosts,
                    },
                };
                if (data.fuelType)   fuelType    = data.fuelType;
                if (data.operatorMode) operatorMode = data.operatorMode;
                if (data.fixedCosts) fixedCosts  = data.fixedCosts;
            }
            const todayEntry = ledgerByDate[activeDateKey] || { trips: [], fixedCosts };
            ledgerTrips = (todayEntry.trips || []).map(normalizeTrip);
            fixedCosts = todayEntry.fixedCosts || fixedCosts;
        }
    } catch { ledgerTrips = []; }
}

function setOperatorMode(mode) {
    operatorMode = OPERATOR_MODES[mode] ? mode : 'car';
    applyOperatorMode();
    saveLedger();
    updateCurrentTripPreview();
}

function applyOperatorMode() {
    const cfg = OPERATOR_MODES[operatorMode] || OPERATOR_MODES.car;
    Object.entries(OPERATOR_MODE_BTN_IDS).forEach(([mode, id]) => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.toggle('active', mode === operatorMode);
    });
    const labelPairs = [
        ['logTitleText', cfg.logTitle],
        ['grossLabel', cfg.grossLabel],
        ['distanceLabel', cfg.distanceLabel],
        ['hoursLabel', cfg.hoursLabel],
        ['addTripLabel', cfg.addLabel],
        ['platformLabel', cfg.platformLabel],
        ['vehicleLabel', cfg.vehicleLabel],
        ['fcLoanLabel', cfg.fixedLabels[0]],
        ['fcDataLabel', cfg.fixedLabels[1]],
        ['fcParkingLabel', cfg.fixedLabels[2]],
        ['fcWashLabel', cfg.fixedLabels[3]],
    ];
    labelPairs.forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });
    elTripGross.placeholder = cfg.grossPlaceholder;

    const modeExtra = document.getElementById('modeExtraFields');
    const bikeExtra = document.getElementById('bikeExtraFields');
    const kekeExtra = document.getElementById('kekeExtraFields');
    if (modeExtra) modeExtra.style.display = operatorMode === 'car' ? 'none' : '';
    if (bikeExtra) bikeExtra.style.display = operatorMode === 'bike' ? '' : 'none';
    if (kekeExtra) kekeExtra.style.display = operatorMode === 'keke' ? '' : 'none';

    const metricStrip = document.getElementById('modeMetricStrip');
    const labelA = document.getElementById('modeMetricLabelA');
    const labelB = document.getElementById('modeMetricLabelB');
    if (metricStrip) metricStrip.style.display = operatorMode === 'car' ? 'none' : '';
    if (operatorMode === 'bike') {
        if (labelA) labelA.textContent = 'Profit/drop';
        if (labelB) labelB.textContent = 'Cost/drop';
    } else if (operatorMode === 'keke') {
        if (labelA) labelA.textContent = 'Profit/passenger';
        if (labelB) labelB.textContent = 'Profit/turn';
    }
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
    const drops     = Math.max(0, parseFloat(elTripDrops?.value)          || 0);
    const failedDrops = Math.max(0, parseFloat(elTripFailedDrops?.value)  || 0);
    const passengers = Math.max(0, parseFloat(elTripPassengers?.value)    || 0);
    const turns     = Math.max(0, parseFloat(elTripTurns?.value)          || 0);
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
    const successfulDrops = Math.max(0, drops - failedDrops);
    const costTotal = platDeduct + fuelCost + maintCost;
    const profitPerDrop = drops > 0 ? net / drops : 0;
    const costPerDrop = drops > 0 ? costTotal / drops : 0;
    const profitPerPassenger = passengers > 0 ? net / passengers : 0;
    const profitPerTurn = turns > 0 ? net / turns : 0;

    return {
        gross, distance, hours, drops, failedDrops, successfulDrops, passengers, turns,
        liters: units, platDeduct, fuelCost, maintCost, net, revPkm, costPkm, profPkm,
        margin, profitPerDrop, costPerDrop, profitPerPassenger, profitPerTurn,
    };
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

    const metricA = document.getElementById('modeMetricValueA');
    const metricB = document.getElementById('modeMetricValueB');
    if (operatorMode === 'bike') {
        if (metricA) metricA.textContent = fmt(s.profitPerDrop);
        if (metricB) metricB.textContent = fmt(s.costPerDrop);
    } else if (operatorMode === 'keke') {
        if (metricA) metricA.textContent = fmt(s.profitPerPassenger);
        if (metricB) metricB.textContent = fmt(s.profitPerTurn);
    }

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
        client_id: createClientId(),
        sync_status: 'pending',
        date: activeDateKey,
        mode: operatorMode,
        acWasOn: acOn,
        fuelType,
        platform: currentPlatform,
        platformPct: platformFeePercentage,
        ...s,
    });
    elTripGross.value = elTripDistance.value = elTripHours.value = '';
    if (elTripDrops) elTripDrops.value = '';
    if (elTripFailedDrops) elTripFailedDrops.value = '';
    if (elTripPassengers) elTripPassengers.value = '';
    if (elTripTurns) elTripTurns.value = '';
    updateCurrentTripPreview();
    renderLedger();
    calcDailyTotals();
    saveLedger();
    renderHistory();
    renderInsights();
    const btn = document.getElementById('addTripBtn');
    btn.classList.add('btn-flash');
    setTimeout(() => btn.classList.remove('btn-flash'), 380);
    trackEvent('Add Trip', { platform: currentPlatform });
}

function deleteTrip(id) {
    ledgerTrips = ledgerTrips.filter(t => t.id !== id);
    renderLedger();
    calcDailyTotals();
    saveLedger();
    renderHistory();
    renderInsights();
}

function clearLedger() {
    if (ledgerTrips.length) {
        const ok = confirm('Clear all trips logged for today? Export a backup first if you need these records later.');
        if (!ok) return;
    }
    ledgerTrips = [];
    renderLedger();
    calcDailyTotals();
    saveLedger();
    renderHistory();
    renderInsights();
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
        const tripMode = OPERATOR_MODES[trip.mode || 'car']?.label || 'E-hailing Car';
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

        const modeCostLine = trip.mode === 'bike' && trip.drops > 0
            ? `<span class="trip-sep">|</span><span>Drops: <b style="color:var(--blue)">${trip.drops}</b></span>`
            : trip.mode === 'keke' && trip.passengers > 0
                ? `<span class="trip-sep">|</span><span>Passengers: <b style="color:var(--blue)">${trip.passengers}</b></span>`
                : '';
        const modeEcoCells = trip.mode === 'bike'
            ? `<div>Profit/drop<b style="color:var(--green)">${fmt(trip.profitPerDrop || 0)}</b></div>
               <div>Cost/drop<b style="color:var(--red)">${fmt(trip.costPerDrop || 0)}</b></div>`
            : trip.mode === 'keke'
                ? `<div>Profit/passenger<b style="color:var(--green)">${fmt(trip.profitPerPassenger || 0)}</b></div>
                   <div>Profit/turn<b style="color:var(--gold)">${fmt(trip.profitPerTurn || 0)}</b></div>`
                : '';

        const row = document.createElement('div');
        row.className = 'trip-row';
        row.innerHTML = `
            <div class="trip-top">
                <div class="trip-info">
                    <div class="trip-tags">
                        <span class="trip-name">Trip #${idx + 1}</span>
                        ${platBadge}
                        <span class="badge badge-gray">${tripMode}</span>
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
                        ${modeCostLine}
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
                ${modeEcoCells}
            </div>`;
        list.appendChild(row);
    });
}

// ── Daily totals ──
function sumTrips(trips, fixed = { loan: 0, data: 0, parking: 0, wash: 0 }) {
    const totals = trips.reduce((acc, trip) => {
        acc.gross += trip.gross || 0;
        acc.distance += trip.distance || 0;
        acc.hours += trip.hours || 0;
        acc.platform += trip.platDeduct || 0;
        acc.fuel += trip.fuelCost || 0;
        acc.maint += trip.maintCost || 0;
        acc.net += trip.net || 0;
        acc.drops += trip.drops || 0;
        acc.passengers += trip.passengers || 0;
        acc.turns += trip.turns || 0;
        return acc;
    }, { gross: 0, distance: 0, hours: 0, platform: 0, fuel: 0, maint: 0, net: 0, drops: 0, passengers: 0, turns: 0 });
    totals.fixed = (fixed.loan || 0) + (fixed.data || 0) + (fixed.parking || 0) + (fixed.wash || 0);
    totals.trueNet = totals.net - totals.fixed;
    totals.trips = trips.length;
    totals.profitPerKm = totals.distance > 0 ? totals.trueNet / totals.distance : 0;
    totals.profitPerHour = totals.hours > 0 ? totals.trueNet / totals.hours : 0;
    totals.profitPerDrop = totals.drops > 0 ? totals.trueNet / totals.drops : 0;
    totals.profitPerPassenger = totals.passengers > 0 ? totals.trueNet / totals.passengers : 0;
    totals.profitPerTurn = totals.turns > 0 ? totals.trueNet / totals.turns : 0;
    return totals;
}

function parseDateKey(key) {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function startOfWeek(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatHistoryDate(key) {
    return parseDateKey(key).toLocaleDateString('en-NG', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
}

function renderHistory() {
    saveLedger();
    const entries = Object.entries(ledgerByDate)
        .map(([date, entry]) => ({
            date,
            totals: sumTrips(entry.trips || [], entry.fixedCosts || {}),
        }))
        .filter(item => item.totals.trips > 0 || item.totals.fixed > 0)
        .sort((a, b) => b.date.localeCompare(a.date));

    const today = parseDateKey(activeDateKey);
    const weekStart = startOfWeek(today);
    const monthKey = activeDateKey.slice(0, 7);
    const weekTotals = entries
        .filter(item => parseDateKey(item.date) >= weekStart)
        .reduce((acc, item) => {
            acc.trueNet += item.totals.trueNet;
            acc.trips += item.totals.trips;
            acc.distance += item.totals.distance;
            return acc;
        }, { trueNet: 0, trips: 0, distance: 0 });
    const monthTotals = entries
        .filter(item => item.date.startsWith(monthKey))
        .reduce((acc, item) => {
            acc.trueNet += item.totals.trueNet;
            acc.trips += item.totals.trips;
            acc.distance += item.totals.distance;
            return acc;
        }, { trueNet: 0, trips: 0, distance: 0 });

    const weekNet = document.getElementById('historyWeekNet');
    const weekMeta = document.getElementById('historyWeekMeta');
    const monthNet = document.getElementById('historyMonthNet');
    const monthMeta = document.getElementById('historyMonthMeta');
    const dayCount = document.getElementById('historyDayCount');
    if (weekNet) weekNet.textContent = fmt(weekTotals.trueNet);
    if (weekMeta) weekMeta.textContent = `${weekTotals.trips} trips · ${weekTotals.distance.toFixed(0)} km`;
    if (monthNet) monthNet.textContent = fmt(monthTotals.trueNet);
    if (monthMeta) monthMeta.textContent = `${monthTotals.trips} trips · ${monthTotals.distance.toFixed(0)} km`;
    if (dayCount) dayCount.textContent = `${entries.length} day${entries.length === 1 ? '' : 's'}`;

    const list = document.getElementById('historyList');
    const empty = document.getElementById('noHistoryMessage');
    if (!list || !empty) return;
    list.querySelectorAll('.history-row').forEach(n => n.remove());
    if (!entries.length) {
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';
    entries.forEach(item => {
        const row = document.createElement('div');
        row.className = 'history-row';
        const netColor = item.totals.trueNet < 0 ? 'var(--red)' : 'var(--green)';
        const extraHistoryMetric = item.totals.drops > 0
            ? `<span>Profit/drop <b>${fmt(item.totals.profitPerDrop)}</b></span>`
            : item.totals.passengers > 0
                ? `<span>Profit/passenger <b>${fmt(item.totals.profitPerPassenger)}</b></span>`
                : '';
        row.innerHTML = `
            <div class="history-main">
                <div>
                    <p class="history-date">${formatHistoryDate(item.date)}</p>
                    <p class="history-meta">${item.totals.trips} trips · ${item.totals.distance.toFixed(0)} km · ${item.totals.hours.toFixed(1)}h</p>
                </div>
                <b style="color:${netColor}">${fmt(item.totals.trueNet)}</b>
            </div>
            <div class="history-units">
                <span>Profit/km <b>${fmt(item.totals.profitPerKm)}</b></span>
                <span>Profit/hr <b>${fmt(item.totals.profitPerHour)}</b></span>
                ${extraHistoryMetric}
            </div>`;
        list.appendChild(row);
    });
}

function getPeriodEntries(daysBack = 6) {
    saveLedger();
    const today = parseDateKey(activeDateKey);
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysBack);
    return Object.entries(ledgerByDate)
        .filter(([date]) => {
            const d = parseDateKey(date);
            return d >= start && d <= today;
        })
        .map(([date, entry]) => ({
            date,
            trips: entry.trips || [],
            fixedCosts: entry.fixedCosts || {},
            totals: sumTrips(entry.trips || [], entry.fixedCosts || {}),
        }))
        .filter(item => item.totals.trips > 0 || item.totals.fixed > 0)
        .sort((a, b) => a.date.localeCompare(b.date));
}

function platformBreakdown(trips) {
    const byPlatform = {};
    trips.forEach(trip => {
        const name = trip.platform || 'Unknown';
        if (!byPlatform[name]) byPlatform[name] = { trips: 0, gross: 0, net: 0, distance: 0 };
        byPlatform[name].trips += 1;
        byPlatform[name].gross += trip.gross || 0;
        byPlatform[name].net += trip.net || 0;
        byPlatform[name].distance += trip.distance || 0;
    });
    return Object.entries(byPlatform)
        .map(([name, data]) => ({
            name,
            ...data,
            profitPerKm: data.distance > 0 ? data.net / data.distance : 0,
        }))
        .filter(item => item.trips > 0);
}

function modeBreakdown(trips) {
    const byMode = {};
    trips.forEach(trip => {
        const key = trip.mode || 'car';
        if (!byMode[key]) byMode[key] = { trips: 0, net: 0, distance: 0 };
        byMode[key].trips += 1;
        byMode[key].net += trip.net || 0;
        byMode[key].distance += trip.distance || 0;
    });
    return Object.entries(byMode).map(([mode, data]) => ({
        mode,
        label: OPERATOR_MODES[mode]?.label || mode,
        ...data,
    }));
}

function makeInsight(type, title, body, meta) {
    return { type, title, body, meta };
}

function buildInsights(entries) {
    const trips = entries.flatMap(entry => entry.trips || []);
    const totals = entries.reduce((acc, entry) => {
        acc.gross += entry.totals.gross;
        acc.distance += entry.totals.distance;
        acc.hours += entry.totals.hours;
        acc.platform += entry.totals.platform;
        acc.fuel += entry.totals.fuel;
        acc.maint += entry.totals.maint;
        acc.fixed += entry.totals.fixed;
        acc.trueNet += entry.totals.trueNet;
        acc.trips += entry.totals.trips;
        return acc;
    }, { gross: 0, distance: 0, hours: 0, platform: 0, fuel: 0, maint: 0, fixed: 0, trueNet: 0, trips: 0 });
    totals.profitPerKm = totals.distance > 0 ? totals.trueNet / totals.distance : 0;
    totals.profitPerHour = totals.hours > 0 ? totals.trueNet / totals.hours : 0;

    if (!totals.trips && !totals.fixed) return [];

    const insights = [];
    const fuelPct = totals.gross > 0 ? (totals.fuel / totals.gross) * 100 : 0;
    const platformPct = totals.gross > 0 ? (totals.platform / totals.gross) * 100 : 0;
    const fixedPct = totals.gross > 0 ? (totals.fixed / totals.gross) * 100 : 0;

    insights.push(makeInsight(
        totals.trueNet >= 0 ? 'positive' : 'danger',
        totals.trueNet >= 0 ? 'You are above costs' : 'You are below break-even',
        totals.trueNet >= 0
            ? `You kept ${fmt(totals.trueNet)} after fuel, commission, maintenance, and fixed costs.`
            : `You need about ${fmt(Math.abs(totals.trueNet))} more to cover recorded costs.`,
        `${totals.trips} trips · ${totals.distance.toFixed(0)} km`
    ));

    if (fuelPct >= 30) {
        insights.push(makeInsight(
            'warning',
            'Fuel is taking a lot',
            `Fuel used ${fuelPct.toFixed(0)}% of gross. Watch pickup distance, AC use, and low-profit long trips.`,
            `${fmt(totals.fuel)} fuel`
        ));
    } else if (totals.gross > 0) {
        insights.push(makeInsight(
            'positive',
            'Fuel share looks controlled',
            `Fuel used ${fuelPct.toFixed(0)}% of gross in this period.`,
            `${fmt(totals.fuel)} fuel`
        ));
    }

    if (platformPct >= 25) {
        insights.push(makeInsight(
            'warning',
            'Commission is heavy',
            `Platform fees took ${platformPct.toFixed(0)}% of gross. Compare app trips against offline or lower-commission trips.`,
            `${fmt(totals.platform)} fees`
        ));
    }

    if (fixedPct >= 20) {
        insights.push(makeInsight(
            'warning',
            'Fixed costs are eating income',
            `Fixed costs used ${fixedPct.toFixed(0)}% of gross. Daily targets should cover this before judging profit.`,
            `${fmt(totals.fixed)} fixed`
        ));
    }

    if (totals.profitPerKm > 0 && totals.profitPerKm < 150) {
        insights.push(makeInsight(
            'warning',
            'Profit per km is thin',
            `You averaged ${fmt(totals.profitPerKm)}/km. Set a higher minimum fare per km for long trips.`,
            `${fmt(totals.profitPerHour)}/hr`
        ));
    } else if (totals.profitPerKm >= 250) {
        insights.push(makeInsight(
            'positive',
            'Strong profit per km',
            `You averaged ${fmt(totals.profitPerKm)}/km. Trips like these are worth prioritising.`,
            `${fmt(totals.profitPerHour)}/hr`
        ));
    }

    const platforms = platformBreakdown(trips).filter(item => item.distance > 0);
    if (platforms.length > 1) {
        platforms.sort((a, b) => b.profitPerKm - a.profitPerKm);
        const best = platforms[0];
        const worst = platforms[platforms.length - 1];
        insights.push(makeInsight(
            'neutral',
            `${best.name} led profit/km`,
            `${best.name} averaged ${fmt(best.profitPerKm)}/km versus ${worst.name} at ${fmt(worst.profitPerKm)}/km.`,
            `${best.trips} ${best.name} trips`
        ));
    }

    const modes = modeBreakdown(trips);
    if (modes.length > 1) {
        modes.sort((a, b) => b.net - a.net);
        insights.push(makeInsight(
            'neutral',
            `${modes[0].label} led take-home`,
            `${modes[0].label} produced ${fmt(modes[0].net)} across ${modes[0].trips} records in this period.`,
            'Mixed operator modes'
        ));
    }

    const bikeTotals = sumTrips(trips.filter(trip => trip.mode === 'bike'), {});
    if (bikeTotals.drops > 0) {
        insights.push(makeInsight(
            bikeTotals.profitPerDrop >= 300 ? 'positive' : 'warning',
            'Bike drop average',
            `Dispatch work averaged ${fmt(bikeTotals.profitPerDrop)} profit per drop.`,
            `${bikeTotals.drops} drops`
        ));
    }

    const kekeTotals = sumTrips(trips.filter(trip => trip.mode === 'keke'), {});
    if (kekeTotals.passengers > 0) {
        insights.push(makeInsight(
            kekeTotals.profitPerPassenger >= 150 ? 'positive' : 'warning',
            'Keke passenger average',
            `Keke work averaged ${fmt(kekeTotals.profitPerPassenger)} profit per passenger.`,
            `${kekeTotals.passengers} passengers`
        ));
    }

    return insights.slice(0, 6);
}

function renderInsights() {
    const entries = getPeriodEntries(6);
    const insights = buildInsights(entries);
    const list = document.getElementById('insightList');
    const empty = document.getElementById('noInsightsMessage');
    const label = document.getElementById('insightsPeriodLabel');
    if (label) label.textContent = 'Last 7 days';
    if (!list || !empty) return;
    list.querySelectorAll('.insight-card').forEach(n => n.remove());
    if (!insights.length) {
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';
    insights.forEach(insight => {
        const card = document.createElement('div');
        card.className = `insight-card insight-${insight.type}`;
        card.innerHTML = `
            <div class="insight-top">
                <span class="insight-dot"></span>
                <div>
                    <p class="insight-title">${insight.title}</p>
                    <p class="insight-body">${insight.body}</p>
                </div>
            </div>
            <p class="insight-meta">${insight.meta}</p>`;
        list.appendChild(card);
    });
}

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
    const accountPrompt = document.getElementById('accountPrompt');
    const todayDateLabel = document.getElementById('todayDateLabel');
    if (accountPrompt) accountPrompt.style.display = ledgerTrips.length ? '' : 'none';
    if (todayDateLabel) todayDateLabel.textContent = todayLabel();

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
async function shareToWhatsApp() {
    if (!ledgerTrips.length) return;

    const siteUrl = window.location.origin;

    // Build text summary for fallback / caption
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
    msg += `\n\n_Tracked with DriverProfit — ${siteUrl}_`;

    // Try screenshot + Web Share API (works on mobile)
    if (typeof html2canvas !== 'undefined') {
        try {
            const sheet     = document.getElementById('bottomSheet');
            const sheetBody = sheet.querySelector('.sheet-body');

            // Temporarily unclip to capture full scrollable content
            const prevSheetH  = sheet.style.height;
            const prevOverflow = sheetBody.style.overflow;
            const prevFlex    = sheetBody.style.flex;
            const prevHeight  = sheetBody.style.height;
            sheet.style.height    = 'auto';
            sheetBody.style.flex  = 'none';
            sheetBody.style.height   = 'auto';
            sheetBody.style.overflow = 'visible';

            const canvas = await html2canvas(sheetBody, {
                backgroundColor: '#14271a',
                scale: 2,
                logging: false,
                useCORS: true
            });

            // Restore styles
            sheet.style.height       = prevSheetH;
            sheetBody.style.flex     = prevFlex;
            sheetBody.style.height   = prevHeight;
            sheetBody.style.overflow = prevOverflow;

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], 'driverprofit-summary.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], text: `Tracked with DriverProfit\n${siteUrl}` });
                trackEvent('Share to WhatsApp', { method: 'image', trips: ledgerTrips.length });
                return;
            }
        } catch (e) {
            // Fall through to text share
        }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    trackEvent('Share to WhatsApp', { method: 'text', trips: ledgerTrips.length });
}

// ── Tab navigation ──
function setBackupStatus(message, tone = 'neutral') {
    const el = document.getElementById('backupStatus');
    if (!el) return;
    el.textContent = message;
    el.className = `data-status status-${tone}`;
}

function getAllTrips() {
    saveLedger();
    return Object.entries(ledgerByDate).flatMap(([date, entry]) =>
        (entry.trips || []).map(trip => normalizeTrip({ ...trip, date: trip.date || date })));
}

function downloadText(filename, text, type) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function csvValue(value) {
    const text = value == null ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
}

function exportTripsCsv() {
    const trips = getAllTrips();
    const fields = [
        'date', 'client_id', 'sync_status', 'mode', 'platform', 'platformPct', 'gross',
        'distance', 'hours', 'drops', 'failedDrops', 'successfulDrops', 'passengers', 'turns',
        'platDeduct', 'fuelCost', 'maintCost', 'net', 'revPkm', 'costPkm', 'profPkm',
        'profitPerDrop', 'costPerDrop', 'profitPerPassenger', 'profitPerTurn',
        'margin', 'fuelType', 'acWasOn',
    ];
    const rows = [fields.join(',')].concat(
        trips.map(trip => fields.map(field => csvValue(trip[field])).join(','))
    );
    downloadText(`driverprofit-trips-${activeDateKey}.csv`, rows.join('\n'), 'text/csv;charset=utf-8');
    setBackupStatus(`Exported ${trips.length} trip${trips.length === 1 ? '' : 's'} as CSV.`, 'good');
    trackEvent('Export Trips CSV', { trips: trips.length });
}

function exportJsonBackup() {
    saveLedger();
    const backup = {
        app: 'DriverProfit',
        exported_at: new Date().toISOString(),
        version: STORAGE_VERSION,
        currentDate: activeDateKey,
        ledgerByDate,
        fuelType,
        operatorMode,
        fixedCosts: getCurrentFixedCosts(),
    };
    downloadText(
        `driverprofit-backup-${activeDateKey}.json`,
        JSON.stringify(backup, null, 2),
        'application/json;charset=utf-8'
    );
    setBackupStatus('Backup downloaded. Keep it somewhere safe before changing phones.', 'good');
    trackEvent('Export JSON Backup', { dates: Object.keys(ledgerByDate).length });
}

function importJsonBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const backup = JSON.parse(reader.result);
            const incomingLedger = backup.ledgerByDate || (
                Array.isArray(backup.trips) ? { [activeDateKey]: { trips: backup.trips, fixedCosts: backup.fixedCosts || fixedCosts } } : null
            );
            if (!incomingLedger) throw new Error('No DriverProfit ledger found');
            const ok = confirm('Restore this backup? This will replace the records currently saved on this phone.');
            if (!ok) return;

            ledgerByDate = incomingLedger;
            fuelType = backup.fuelType || fuelType;
            operatorMode = backup.operatorMode || operatorMode;
            fixedCosts = backup.fixedCosts || fixedCosts;
            const todayEntry = ledgerByDate[activeDateKey] || { trips: [], fixedCosts };
            ledgerTrips = (todayEntry.trips || []).map(normalizeTrip);
            fixedCosts = todayEntry.fixedCosts || fixedCosts;
            applyFixedCostsToInputs(fixedCosts);
            saveLedger();
            setFuelType(fuelType);
            applyOperatorMode();
            renderLedger();
            calcDailyTotals();
            renderHistory();
            renderInsights();
            setBackupStatus('Backup restored on this phone.', 'good');
            trackEvent('Import JSON Backup', { dates: Object.keys(ledgerByDate).length });
        } catch (err) {
            setBackupStatus('Could not restore that file. Choose a DriverProfit JSON backup.', 'bad');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

function showTab(name) {
    const container = document.querySelector('.screen-container');
    const screen = document.getElementById('screen-' + name);
    container.scrollTo({ left: screen.offsetLeft, behavior: 'smooth' });
    setActiveTab(name);
}

function setActiveTab(name) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
    if (btn) btn.classList.add('active');
}

// Sync tab indicator when user swipes between screens
(function () {
    const container = document.querySelector('.screen-container');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                setActiveTab(entry.target.id.replace('screen-', ''));
            }
        });
    }, { root: container, threshold: 0.5 });
    document.querySelectorAll('.screen').forEach(s => observer.observe(s));
})();

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

applyFixedCostsToInputs(fixedCosts);
applyOperatorMode();

setFuelType(fuelType);
updateCurrentTripPreview();
renderLedger();
calcDailyTotals();
renderHistory();
renderInsights();
