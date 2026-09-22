// Global State Tracker
let mission = {
    budget: 500000000,
    massCapacity: 1500,
    currentMass: 0,
    powerGenerated: 0,
    powerConsumed: 0,
    powerSource: null,
    instruments: []
};

function logMessage(text) {
    const logBox = document.getElementById("log-output");
    logBox.innerHTML += `<br>> ${text}`;
}

function setPowerSource(name, cost, mass, generation) {
    if (mission.powerSource) {
        logMessage(`Error: Power source already selected (${mission.powerSource}).`);
        return;
    }
    if (mission.budget - cost < 0 || mission.currentMass + mass > mission.massCapacity) {
        logMessage("Error: Resource limits exceeded for this power system!");
        return;
    }

    mission.powerSource = name;
    mission.budget -= cost;
    mission.currentMass += mass;
    mission.powerGenerated += generation;
    
    logMessage(`Equipped ${name} system.`);
    updateUI();
}

function addInstrument(name, cost, mass, powerDemand) {
    if (mission.budget - cost < 0) {
        logMessage(`Error: Not enough budget to purchase ${name}.`);
        return;
    }
    if (mission.currentMass + mass > mission.massCapacity) {
        logMessage(`Error: ${name} is too heavy for payload limits.`);
        return;
    }

    mission.instruments.push(name);
    mission.budget -= cost;
    mission.currentMass += mass;
    mission.powerConsumed += powerDemand;

    logMessage(`Added payload instrument: ${name}.`);
    updateUI();
}

function updateUI() {
    document.getElementById("budget-display").innerText = `$${mission.budget.toLocaleString()}`;
    document.getElementById("mass-display").innerText = `${mission.currentMass} / ${mission.massCapacity} kg`;
    document.getElementById("power-display").innerText = `${mission.powerConsumed}W / ${mission.powerGenerated}W`;
}

function simulateLaunch() {
    logMessage("--- Initiating Launch Checklist ---");
    
    if (!mission.powerSource) {
        logMessage("❌ LAUNCH ABORTED: Spacecraft has no power generation mechanism!");
        return;
    }
    if (mission.instruments.length === 0) {
        logMessage("❌ LAUNCH ABORTED: No scientific payloads deployed. Purpose missing.");
        return;
    }
    if (mission.powerConsumed > mission.powerGenerated) {
        logMessage("⚠️ WARNING: Power deficit detected. Systems entering safe mode.");
    }

    logMessage("🚀 SUCCESS: Insertion orbit achieved. Transmitting telemetry back to Earth!");
}
