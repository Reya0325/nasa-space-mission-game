// Game variables
let state = {
    budget: 500,
    mass: 0,
    maxMass: 1200,
    power: null,
    hasPayload: false,
    stage: 'hangar' // hangar, launch, orbit, failed
};

const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

// Rocket physics positions
let rocket = { x: 300, y: 420, vy: 0, vx: 0, width: 20, height: 50 };
let planet = { x: 300, y: 250, radius: 60 };
let orbitRadius = 140;
let angle = 0;

function selectPower(type, cost, mass) {
    if (state.stage !== 'hangar') return;
    state.power = type;
    state.budget = 500 - cost;
    state.mass = mass;
    updateSpecs();
}

function addTool(type, cost, mass) {
    if (state.stage !== 'hangar') return;
    if (state.budget - cost < 0 || state.mass + mass > state.maxMass) {
        document.getElementById("game-status").innerText = "Overweight or insufficient funds!";
        return;
    }
    state.budget -= cost;
    state.mass += mass;
    state.hasPayload = true;
    updateSpecs();
}

function updateSpecs() {
    document.getElementById("budget-txt").innerText = `$${state.budget}M`;
    document.getElementById("mass-txt").innerText = `${state.mass} / ${state.maxMass} kg`;
}

function startVisualLaunch() {
    if (!state.power || !state.hasPayload) {
        document.getElementById("game-status").innerText = "Abort: Missing power or instruments!";
        return;
    }
    state.stage = 'launch';
    document.getElementById("game-status").innerText = "Status: Main engine start! Ascending...";
    rocket.vy = -2; // Start traveling upward
}

// 60FPS Game Loop Engine
function loop() {
    // Clear viewport background
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render static backgrounds stars
    ctx.fillStyle = "#ffffff";
    for(let i=0; i<30; i++) {
        let starX = (Math.sin(i * 99) * 0.5 + 0.5) * canvas.width;
        let starY = (Math.cos(i * 45) * 0.5 + 0.5) * canvas.height;
        ctx.fillRect(starX, starY, 2, 2);
    }

    // Always draw destination planet core
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#0284c7"; // Planetary cyan blue
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#38bdf8";
    ctx.stroke();

    // Draw Target Stable Orbit Pathway Line
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    if (state.stage === 'hangar') {
        // Draw rocket waiting on launchpad base
        ctx.fillStyle = "#334155";
        ctx.fillRect(250, 470, 100, 10);
        drawRocket(rocket.x, rocket.y);
    } 
    else if (state.stage === 'launch') {
        // Apply acceleration velocity values
        rocket.y += rocket.vy;
        
        // Draw exhaust fire animation particles
        ctx.fillStyle = Math.random() > 0.5 ? "#f97316" : "#ef4444";
        ctx.fillRect(rocket.x - 5, rocket.y + rocket.height, 10, 15);

        drawRocket(rocket.x, rocket.y);

        // Turn into insertion orbit pathway once high enough
        if (rocket.y <= planet.y + orbitRadius) {
            state.stage = 'orbit';
            document.getElementById("game-status").innerText = "Status: Stable Orbit Achieved! Science operating.";
        }
    } 
    else if (state.stage === 'orbit') {
        // Compute circular angular orbital tracking positions
        angle += 0.02;
        rocket.x = planet.x + Math.cos(angle) * orbitRadius;
        rocket.y = planet.y + Math.sin(angle) * orbitRadius;

        // Draw probe rotation deployment wings
        ctx.fillStyle = "#e2e8f0";
        drawRocket(rocket.x, rocket.y);
    }

    requestAnimationFrame(loop);
}

function drawRocket(x, y) {
    ctx.fillStyle = "#e2e8f0"; // Metallic body
    ctx.fillRect(x - rocket.width/2, y, rocket.width, rocket.height);
    // Nosecone cap tip triangle
    ctx.beginPath();
    ctx.moveTo(x - rocket.width/2, y);
    ctx.lineTo(x, y - 15);
    ctx.lineTo(x + rocket.width/2, y);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
}

// Boot up game animation loop processing instantly
loop();
