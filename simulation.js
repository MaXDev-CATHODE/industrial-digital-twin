/* ========================================
   INDUSTRIAL DIGITAL TWIN - SIMULATION ENGINE
   Real-time process simulation logic
   ======================================== */

// ========================================
// STATE MANAGEMENT
// ========================================

const state = {
    tanks: {
        A: { level: 100, maxLevel: 100, type: 'pigment' },
        B: { level: 100, maxLevel: 100, type: 'base' },
        C: { level: 0, maxLevel: 100, type: 'mixed' }
    },
    valves: {
        A: { open: false },
        B: { open: false }
    },
    agitator: {
        running: false
    },
    process: {
        running: false,
        startTime: null,
        temperature: 22.5,
        flowRate: 0
    },
    alarms: []
};

// Simulation parameters
const FLOW_RATE = 0.5;          // Units per tick
const TEMP_VARIATION = 0.3;     // Temperature fluctuation
const TICK_INTERVAL = 100;      // ms

// Chart data history
const chartHistory = {
    labels: [],
    tankA: [],
    tankB: [],
    tankC: [],
    temperature: [],
    flowRate: [],
    maxPoints: 50
};

// ========================================
// DOM ELEMENTS
// ========================================

const elements = {
    liquidA: document.getElementById('liquidA'),
    liquidB: document.getElementById('liquidB'),
    liquidC: document.getElementById('liquidC'),
    levelA: document.getElementById('levelA'),
    levelB: document.getElementById('levelB'),
    levelC: document.getElementById('levelC'),
    valveA: document.getElementById('valveA'),
    valveB: document.getElementById('valveB'),
    statusV1: document.getElementById('statusV1'),
    statusV2: document.getElementById('statusV2'),
    agitator: document.getElementById('agitator'),
    agitatorBtn: document.getElementById('agitatorBtn'),
    agitatorIcon: document.getElementById('agitatorIcon'),
    statusAgitator: document.getElementById('statusAgitator'),
    temperature: document.getElementById('temperature'),
    runtime: document.getElementById('runtime'),
    alarmStatus: document.getElementById('alarmStatus'),
    alarmList: document.getElementById('alarmList'),
    pipeA: document.getElementById('pipeA'),
    pipeB: document.getElementById('pipeB'),
    pipeMain: document.getElementById('pipeMain')
};

// ========================================
// CHARTS INITIALIZATION
// ========================================

let levelsChart, tempChart;

function initCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
            x: {
                display: false
            },
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: '#94a3b8' }
            }
        },
        plugins: {
            legend: {
                labels: { color: '#94a3b8', boxWidth: 12 }
            }
        }
    };

    // Levels Chart
    const levelsCtx = document.getElementById('levelsChart').getContext('2d');
    levelsChart = new Chart(levelsCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Tank A',
                    data: [],
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: 'Tank B',
                    data: [],
                    borderColor: '#e5e7eb',
                    backgroundColor: 'rgba(229, 231, 235, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: 'Mixer',
                    data: [],
                    borderColor: '#fbbf24',
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                }
            ]
        },
        options: chartOptions
    });

    // Temperature Chart
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    yAxisID: 'y'
                },
                {
                    label: 'Flow Rate',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 15,
                    max: 35,
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#06b6d4' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 10,
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#10b981' }
                }
            }
        }
    });
}

// ========================================
// VALVE CONTROL
// ========================================

function toggleValve(valve) {
    state.valves[valve].open = !state.valves[valve].open;
    updateValveVisuals(valve);
    checkInterlocks();
}

function updateValveVisuals(valve) {
    const isOpen = state.valves[valve].open;
    const valveEl = elements[`valve${valve}`];
    const statusEl = elements[`statusV${valve === 'A' ? '1' : '2'}`];

    if (isOpen) {
        valveEl.classList.add('open');
        statusEl.textContent = 'OPEN';
        statusEl.classList.remove('closed');
        statusEl.classList.add('open');
    } else {
        valveEl.classList.remove('open');
        statusEl.textContent = 'CLOSED';
        statusEl.classList.remove('open');
        statusEl.classList.add('closed');
    }
}

// ========================================
// AGITATOR CONTROL
// ========================================

function toggleAgitator() {
    // Safety check: don't run if mixer is empty
    if (state.tanks.C.level < 10 && !state.agitator.running) {
        addAlarm('Cannot start agitator: Mixer level too low (<10%)', 'warning');
        return;
    }

    state.agitator.running = !state.agitator.running;
    updateAgitatorVisuals();
}

function updateAgitatorVisuals() {
    const running = state.agitator.running;

    if (running) {
        elements.agitator.classList.add('running');
        elements.agitatorBtn.classList.add('active');
        elements.agitatorIcon.textContent = '⏸';
        elements.statusAgitator.textContent = 'RUNNING';
        elements.statusAgitator.classList.remove('closed');
        elements.statusAgitator.classList.add('open');
    } else {
        elements.agitator.classList.remove('running');
        elements.agitatorBtn.classList.remove('active');
        elements.agitatorIcon.textContent = '▶';
        elements.statusAgitator.textContent = 'OFF';
        elements.statusAgitator.classList.remove('open');
        elements.statusAgitator.classList.add('closed');
    }
}

// ========================================
// PROCESS CONTROL
// ========================================

function startProcess() {
    if (state.process.running) return;

    state.process.running = true;
    state.process.startTime = Date.now();
    state.valves.A.open = true;
    state.valves.B.open = true;

    updateValveVisuals('A');
    updateValveVisuals('B');

    addAlarm('Batch process started', 'info');
}

function stopProcess() {
    state.valves.A.open = false;
    state.valves.B.open = false;
    state.agitator.running = false;
    state.process.running = false;

    updateValveVisuals('A');
    updateValveVisuals('B');
    updateAgitatorVisuals();

    addAlarm('EMERGENCY STOP activated!', 'critical');
}

function resetProcess() {
    // Reset all state
    state.tanks.A.level = 100;
    state.tanks.B.level = 100;
    state.tanks.C.level = 0;
    state.valves.A.open = false;
    state.valves.B.open = false;
    state.agitator.running = false;
    state.process.running = false;
    state.process.startTime = null;
    state.process.temperature = 22.5;
    state.alarms = [];

    updateValveVisuals('A');
    updateValveVisuals('B');
    updateAgitatorVisuals();
    updateTankVisuals();
    updateAlarmDisplay();

    // Clear chart history
    chartHistory.labels = [];
    chartHistory.tankA = [];
    chartHistory.tankB = [];
    chartHistory.tankC = [];
    chartHistory.temperature = [];
    chartHistory.flowRate = [];
}

// ========================================
// SIMULATION ENGINE
// ========================================

function simulationTick() {
    let flowOccurred = false;

    // Flow from Tank A
    if (state.valves.A.open && state.tanks.A.level > 0) {
        const flow = Math.min(FLOW_RATE, state.tanks.A.level);
        state.tanks.A.level -= flow;
        state.tanks.C.level += flow;
        flowOccurred = true;
    }

    // Flow from Tank B
    if (state.valves.B.open && state.tanks.B.level > 0) {
        const flow = Math.min(FLOW_RATE, state.tanks.B.level);
        state.tanks.B.level -= flow;
        state.tanks.C.level += flow;
        flowOccurred = true;
    }

    // Cap mixer level
    state.tanks.C.level = Math.min(state.tanks.C.level, state.tanks.C.maxLevel);

    // Update flow rate display
    state.process.flowRate = flowOccurred ? FLOW_RATE * 10 : 0;

    // Temperature simulation
    if (state.agitator.running) {
        state.process.temperature += (Math.random() - 0.4) * TEMP_VARIATION;
    } else {
        // Slowly cool down
        state.process.temperature += (22.5 - state.process.temperature) * 0.01;
    }
    state.process.temperature = Math.max(18, Math.min(35, state.process.temperature));

    // Check interlocks
    checkInterlocks();

    // Update visuals
    updateTankVisuals();
    updatePipeVisuals(flowOccurred);
    updateTemperatureDisplay();
    updateCharts();
}

// ========================================
// INTERLOCKS (SAFETY LOGIC)
// ========================================

function checkInterlocks() {
    // Overflow protection
    if (state.tanks.C.level >= 95) {
        if (state.valves.A.open || state.valves.B.open) {
            state.valves.A.open = false;
            state.valves.B.open = false;
            updateValveVisuals('A');
            updateValveVisuals('B');
            addAlarm('INTERLOCK: Overflow protection - Valves closed', 'warning');
        }
    }

    // Dry run protection
    if (state.tanks.C.level < 5 && state.agitator.running) {
        state.agitator.running = false;
        updateAgitatorVisuals();
        addAlarm('INTERLOCK: Dry run protection - Agitator stopped', 'warning');
    }

    // Empty tank warning
    if (state.tanks.A.level <= 5 && state.valves.A.open) {
        addAlarm('Tank A level critical (<5%)', 'warning');
    }
    if (state.tanks.B.level <= 5 && state.valves.B.open) {
        addAlarm('Tank B level critical (<5%)', 'warning');
    }
}

// ========================================
// VISUAL UPDATES
// ========================================

function updateTankVisuals() {
    // Tank A
    elements.liquidA.style.height = `${state.tanks.A.level}%`;
    elements.levelA.textContent = `${Math.round(state.tanks.A.level)}%`;

    // Tank B
    elements.liquidB.style.height = `${state.tanks.B.level}%`;
    elements.levelB.textContent = `${Math.round(state.tanks.B.level)}%`;

    // Tank C (Mixer)
    elements.liquidC.style.height = `${state.tanks.C.level}%`;
    elements.levelC.textContent = `${Math.round(state.tanks.C.level)}%`;
}

function updatePipeVisuals(flowing) {
    const pipes = [elements.pipeA, elements.pipeB, elements.pipeMain];

    if (flowing) {
        pipes.forEach(pipe => {
            if (pipe) pipe.classList.add('flowing');
        });
    } else {
        pipes.forEach(pipe => {
            if (pipe) pipe.classList.remove('flowing');
        });
    }
}

function updateTemperatureDisplay() {
    elements.temperature.textContent = `${state.process.temperature.toFixed(1)}°C`;
}

function updateRuntime() {
    if (!state.process.startTime) {
        elements.runtime.textContent = '00:00:00';
        return;
    }

    const elapsed = Date.now() - state.process.startTime;
    const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');

    elements.runtime.textContent = `${hours}:${minutes}:${seconds}`;
}

// ========================================
// CHARTS UPDATE
// ========================================

function updateCharts() {
    const now = new Date().toLocaleTimeString();

    // Add new data points
    chartHistory.labels.push(now);
    chartHistory.tankA.push(state.tanks.A.level);
    chartHistory.tankB.push(state.tanks.B.level);
    chartHistory.tankC.push(state.tanks.C.level);
    chartHistory.temperature.push(state.process.temperature);
    chartHistory.flowRate.push(state.process.flowRate);

    // Keep only last N points
    if (chartHistory.labels.length > chartHistory.maxPoints) {
        chartHistory.labels.shift();
        chartHistory.tankA.shift();
        chartHistory.tankB.shift();
        chartHistory.tankC.shift();
        chartHistory.temperature.shift();
        chartHistory.flowRate.shift();
    }

    // Update levels chart
    levelsChart.data.labels = chartHistory.labels;
    levelsChart.data.datasets[0].data = chartHistory.tankA;
    levelsChart.data.datasets[1].data = chartHistory.tankB;
    levelsChart.data.datasets[2].data = chartHistory.tankC;
    levelsChart.update('none');

    // Update temperature chart
    tempChart.data.labels = chartHistory.labels;
    tempChart.data.datasets[0].data = chartHistory.temperature;
    tempChart.data.datasets[1].data = chartHistory.flowRate;
    tempChart.update('none');
}

// ========================================
// ALARM SYSTEM
// ========================================

function addAlarm(message, type = 'info') {
    const alarm = {
        message,
        type,
        time: new Date().toLocaleTimeString()
    };

    // Prevent duplicate alarms
    const isDuplicate = state.alarms.some(a =>
        a.message === message &&
        (Date.now() - new Date().setHours(...a.time.split(':')) < 5000)
    );

    if (!isDuplicate) {
        state.alarms.unshift(alarm);
        if (state.alarms.length > 5) state.alarms.pop();
        updateAlarmDisplay();
    }
}

function updateAlarmDisplay() {
    if (state.alarms.length === 0) {
        elements.alarmStatus.innerHTML = '<span class="alarm-icon">✓</span><span>No Active Alarms</span>';
        elements.alarmStatus.className = 'alarm-status';
    } else {
        const latestAlarm = state.alarms[0];
        let icon = '⚠';
        let statusClass = 'warning';

        if (latestAlarm.type === 'critical') {
            icon = '🚨';
            statusClass = 'critical';
        } else if (latestAlarm.type === 'info') {
            icon = 'ℹ';
            statusClass = '';
        }

        elements.alarmStatus.innerHTML = `<span class="alarm-icon">${icon}</span><span>${latestAlarm.message}</span>`;
        elements.alarmStatus.className = `alarm-status ${statusClass}`;
    }
}

// ========================================
// INITIALIZATION
// ========================================

function init() {
    initCharts();
    updateTankVisuals();

    // Start simulation loop
    setInterval(simulationTick, TICK_INTERVAL);

    // Start runtime counter
    setInterval(updateRuntime, 1000);

    console.log('🏭 Industrial Digital Twin initialized');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
