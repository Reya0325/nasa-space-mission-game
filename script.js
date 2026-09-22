// ==========================================
// 🛰️ SYSTEM SETUP & CENTRAL STATE MATRIX
// ==========================================
const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

let game = {
    screen: 'menu', // menu, story, modeSelect, hangar, flight, victory, gameOver
    storyIndex: 0,
    projectType: '',
    budget: 0,
    maxBudget: 1,
    mass: 0,
    maxMass: 1,
    hasFrame: false,
    hasUtility: false,
    selectedFrame: 'None',
    selectedUtility: 'None',
    health: 1,
    maxHealth: 1
};

// ==========================================
// ☄️ ENTITIES & ARCADE PHYSICS VECTORS
// ==========================================
let rocket = { x: 300, y: 440, width: 28, height: 60, speedModifier: 5 };
let asteroids = [];
let stars = [];
let keys = {};
let flightTimer = 0;
const FLIGHT_DURATION = 20; // Seconds to survive

// Generate Starfield Layering
for (let i = 0; i < 60; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5
    });
}

// ==========================================
// 📖 HONKAI STAR RAIL STYLE DIALOGUE MATRIX
// ==========================================
const storyText = [
    "SYSTEM NODE: Year 2146. A massive Class-X solar anomaly has scrambled orbital networks.",
    "COMMAND HQ: Sector 7 has gone dark. Ground control is completely blind to incoming solar flares.",
    "DIRECTOR: We must assemble and launch an emergency shielding relay probe immediately.",
    "DIRECTOR: Watch your engineering trade-offs carefully. A probe that is too heavy won't make orbit, and one that is too flimsy will burn up."
];

// ==========================================
// 🔊 SAFE AUDIO SYNTHESIZER ENGINE (CHROME COMPATIBLE)
// ==========================================
const AudioEngine = {
    ctx: null,
    init() {
        if (!this.ctx) {
            // Only creates audio context after a user interaction happens
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playThrust() {
        try {
            this.init();
            if (!this.ctx) return;
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        } catch(e) { console.log("Audio block prevented"); }
    },
    playExplosion() {
        try {
            this.init();
            if (!this.ctx) return;
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(160, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.4);
        } catch(e) { console.log("Audio block prevented"); }
    },
    playSuccess() {
        try {
            this.init();
            if (!this.ctx) return;
            let notes = [261.63, 329.63, 392.00, 523.25]; 
            notes.forEach((freq, index) => {
                let osc = this.ctx.createOscillator();
                let gain = this.ctx.createGain();
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.1);
                gain.gain.setValueAtTime(0.15, this.ctx.currentTime + index * 0.1);
                gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + index * 0.1 + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + index * 0.1);
                osc.stop(this.ctx.currentTime + index * 0.1 + 0.2);
            });
        } catch(e) { console.log("Audio block prevented"); }
    }
};

// ==========================================
// 🖱️ INPUT EVENT HANDLE CORES
// ==========================================
canvas.addEventListener("click", handleCanvasClick);
window.addEventListener("keydown", e => { keys[e.key] = true; });
window.addEventListener("keyup", e => { keys[e.key] = false; });

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (game.screen === 'menu') {
        if (clickX >= 180 && clickX <= 420 && clickY >= 280 && clickY <= 340) {
            AudioEngine.playThrust();
            game.screen = 'story';
            game.storyIndex = 0;
        }
    } 
    else if (game.screen === 'story') {
        AudioEngine.playThrust();
        game.storyIndex++;
        if (game.storyIndex >= storyText.length) {
            game.screen = 'modeSelect';
        }
    } 
    else if (game.screen === 'modeSelect') {
        if (clickX >= 120 && clickX <= 480) {
            if (clickY >= 180 && clickY <= 235) setupHangar('Weather Satellite', 250, 600);
            if (clickY >= 260 && clickY <= 315) setupHangar('Deep-Space Telescope', 800, 1400);
            if (clickY >= 340 && clickY <= 395) setupHangar('Mars Exploration Rover', 450, 1000);
        }
    } 
    else if (game.screen === 'victory' || game.screen === 'gameOver') {
        if (clickX >= 180 && clickX <= 420 && clickY >= 420 && clickY <= 475) {
            resetToMainMenu();
        }
    }
}

// ==========================================
// 🔧 SHIP ASSEMBLY LOGIC & PREVIEWS
// ==========================================
function setupHangar(type, budgetLimit, massLimit) {
    AudioEngine.playThrust();
    game.screen = 'hangar';
    game.projectType = type;
    game.budget = budgetLimit;
    game.maxBudget = budgetLimit;
    game.mass = 0;
    game.maxMass = massLimit;
    game.hasFrame = false;
    game.hasUtility = false;
    game.selectedFrame = 'None';
    game.selectedUtility = 'None';
    game.health = 1;
    game.maxHealth = 1;
    rocket.speedModifier = 6; 

    document.getElementById("menu-ui").classList.add("hidden");
    document.getElementById("hangar-ui").classList.remove("hidden");
    
    document.getElementById("project-title").innerText = type;
    updateDOMTelemetry();
}

function applyComponent(name, cost, componentMass, category) {
    if (game.screen !== 'hangar') return;
    
    if (category === 'frame' && game.hasFrame) {
        alert("You must launch or clear configuration to replace frames!"); return;
    }
    if (category === 'utility' && game.hasUtility) {
        alert("You must launch or clear configuration to replace components!"); return;
    }

    if (game.budget - cost < 0 || game.mass + componentMass > game.maxMass) {
        alert("CRITICAL VIOLATION: Budget limits or structural mass capacities breached!");
        return;
    }
    
    AudioEngine.playThrust();
    game.budget -= cost;
    game.mass += componentMass;

    if (category === 'frame') {
        game.hasFrame = true;
        game.selectedFrame = name;
        if (name.includes("Reinforced")) {
            game.health = 2; 
            game.maxHealth = 2;
            rocket.speedModifier = 3.8; 
        } else {
            game.health = 1;
            game.maxHealth = 1;
            rocket.speedModifier = 6.5; 
        }
    }
    if (category === 'utility') {
        game.hasUtility = true;
        game.selectedUtility = name;
    }

    updateDOMTelemetry();
}

function updateDOMTelemetry() {
    document.getElementById("budget-txt").innerText = `$${game.budget}M`;
    document.getElementById("mass-txt").innerText = `${game.mass} / ${game.maxMass} kg`;
}

function triggerLaunchSequence() {
    if (!game.hasFrame || !game.hasUtility) {
        alert("LAUNCH PREVENTED: Rocket requires both a Frame configuration and an active Utility module!");
        return;
    }
    AudioEngine.playThrust();
    game.screen = 'flight';
    flightTimer = 0;
    asteroids = [];
    rocket.x = 300;
    document.getElementById("hangar-ui").classList.add("hidden");
    document.getElementById("controls-legend").classList.remove("hidden");
}

function resetToMainMenu() {
    AudioEngine.playThrust();
    game.screen = 'menu';
    game.storyIndex = 0;
    document.getElementById("hangar-ui").classList.add("hidden");
    document.getElementById("controls-legend").classList.add("hidden");
    document.getElementById("menu-ui").classList.remove("hidden");
}

// ==========================================
// 🎨 ENGINE ANIMATION RENDERING CYCLES
// ==========================================
function engineLoop() {
    // Space Background Sweep
    ctx.fillStyle = "#05070f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Deep Space Layered Grid Effect
    ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 50) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }

    // Process Twinkling Dynamic Stars
    ctx.fillStyle = "#ffffff";
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        if (game.screen === 'flight') {
            star.y += star.speed * 2.5; 
            if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
        }
    });

