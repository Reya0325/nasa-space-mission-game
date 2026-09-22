const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

// System State Manager
let game = {
    screen: 'menu', // menu, story, modeSelect, hangar, flight, victory, gameOver
    storyIndex: 0,
    projectType: '',
    budget: 0,
    mass: 0,
    maxMass: 0,
    hasFrame: false,
    hasUtility: false,
    health: 1
};

// Physics and Entities Data
let rocket = { x: 300, y: 450, vx: 0, width: 24, height: 55, speedModifier: 5 };
let asteroids = [];
let stars = [];
let keys = {};
let flightTimer = 0;

// Initialize Background Stars
for(let i=0; i<40; i++) {
    stars.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, size: Math.random()*2+1 });
}

// Dialog Script (Star Rail/Visual Novel style)
const storyText = [
    "SYSTEM: Warning. High-energy solar wind storm approaching orbital sector 7.",
    "DIRECTOR: Our outer relay satellites are down. Earth is blind to incoming cosmic flares.",
    "DIRECTOR: We need to design and launch an emergency probe immediately.",
    "DIRECTOR: Budget grids are unstable. Every choice you make in the hangar determines if our crew survives the orbital insertion trajectory."
];

// Click Listeners for Buttons/Canvas Menu Interaction
canvas.addEventListener("click", handleCanvasClick);
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (game.screen === 'menu') {
        // Play Button Area Box
        if (clickX >= 200 && clickX <= 400 && clickY >= 260 && clickY <= 310) {
            game.screen = 'story';
            game.storyIndex = 0;
        }
    } else if (game.screen === 'story') {
        game.storyIndex++;
        if (game.storyIndex >= storyText.length) {
            game.screen = 'modeSelect';
        }
    } else if (game.screen === 'modeSelect') {
        // Mode Buttons Clicking Bounds
        if (clickX >= 150 && clickX <= 450) {
            if (clickY >= 180 && clickY <= 230) setupHangar('Satellite', 250, 700);
            if (clickY >= 250 && clickY <= 300) setupHangar('Deep-Space Telescope', 800, 1500);
            if (clickY >= 320 && clickY <= 370) setupHangar('Mars Rover Probe', 450, 1000);
        }
    } else if (game.screen === 'victory' || game.screen === 'gameOver') {
        // Click to reset
        if (clickY >= 400 && clickY <= 450) {
            game.screen = 'menu';
            document.getElementById("hangar-ui").classList.add("hidden");
            document.getElementById("menu-ui").classList.remove("hidden");
        }
    }
}

function setupHangar(type, budgetLimit, massLimit) {
    game.screen = 'hangar';
    game.projectType = type;
    game.budget = budgetLimit;
    game.mass = 0;
    game.maxMass = massLimit;
    game.hasFrame = false;
    game.hasUtility = false;
    game.health = 1;
    rocket.speedModifier = 6; // base speed

    document.getElementById("menu-ui").classList.add("hidden");
    document.getElementById("hangar-ui").classList.remove("hidden");
    
    document.getElementById("project-title").innerText = type;
    document.getElementById("budget-txt").innerText = `$${game.budget}M`;
    document.getElementById("mass-txt").innerText = `0 / ${massLimit} kg`;
}

function applyComponent(name, cost, componentMass, category) {
    if (game.budget - cost < 0 || game.mass + componentMass > game.maxMass) {
        alert("Engineering Constraint Violation: Budget or Mass exceeded!");
        return;
    }
    game.budget -= cost;
    game.mass += componentMass;

    if (category === 'frame') {
        game.hasFrame = true;
        if (name.includes("Reinforced")) {
            game.health = 2; // Extra hit point
            rocket.speedModifier = 3.5; // Heavier frame handles slower
        }
    }
    if (category === 'utility') game.hasUtility = true;

    document.getElementById("budget-txt").innerText = `$${game.budget}M`;
    document.getElementById("mass-txt").innerText = `${game.mass} / ${game.maxMass} kg`;
}

function triggerLaunchSequence() {
    if (!game.hasFrame || !game.hasUtility) {
        alert("Pre-flight checklist failed! You must select at least 1 Frame and 1 Subsystem Module.");
        return;
    }
    game.screen = 'flight';
    flightTimer = 0;
    asteroids = [];
    rocket.x = 300;
    document.getElementById("hangar-ui").classList.add("hidden");
    document.getElementById("controls-legend").classList.remove("hidden");
}

// Centralized Render Processing Engine Loop
function engineLoop() {
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render Stars Background animation
    ctx.fillStyle = "#ffffff";
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        if (game.screen === 'flight') {
            star.y += 2; // Starfield scrolling movement effect during launch
            if (star.y > canvas.height) star.y = 0;
        }
    });

    if (game.screen === 'menu') {
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🪐 ECHOES OF THE COSMOS", 300, 160);
        
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("NASA Space Apps Mission Interface", 300, 190);

        // Core Play Interactive Button Box
        ctx.fillStyle = "#10b981";
        ctx.fillRect(200, 260, 200, 50);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("INITIALIZE STORY", 300, 292);

    } else if (game.screen === 'story') {
        // Narrative Dialog Overlay Window box
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 3;
        ctx.fillRect(40, 360, 520, 140);
        ctx.strokeRect(40, 360, 520, 140);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "16px monospace";
        ctx.textAlign = "left";
        wrapText(storyText[game.storyIndex], 60, 400, 480, 22);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("▼ CLICK SCREEN TO ADVANCE", 400, 480);

    } else if (game.screen === 'modeSelect') {
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CHOOSE YOUR MISSION BLUEPRINT", 300, 100);

        // Build Tracks Buttons List
        let modes = [
            { label: "1. Weather Satellite (Budget: $250M)", y: 180 },
            { label: "2. Deep-Space Telescope (Budget: $800M)", y: 250 },
            { label: "3. Interplanetary Rover (Budget: $450M)", y: 320 }
        ];
        modes.forEach(m => {
            ctx.fillStyle = "#1e293b";
            ctx.strokeStyle = "#38bdf8";
            ctx.fillRect(150, m.y, 300, 50);
            ctx.strokeRect(150, m.y, 300, 50);
            ctx.fillStyle = "#ffffff";
            ctx.font = "14px sans-serif";
            ctx.fillText(m.label, 300, m.y + 30);
        });

    } else if (game.screen === 'hangar') {
        ctx.fillStyle = "#64748b";
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`System Configuration Room: Project ${game.projectType}`, 300, 100);
        // Display Preview of Probe on schematic board grid line
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(285, 260, 30, 70);
        ctx.fillStyle = "#64748b";
        ctx.font = "12px monospace";
        ctx.fillText("[Blueprint Matrix View]", 300, 360);

    } else if (game.screen === 'flight') {
        flightTimer += 1/60;

        // Player lateral input listeners controls execution loop
        if (keys["ArrowLeft"] || keys["a"]) rocket.x -= rocket.speedModifier;
        if (keys["ArrowRight"] || keys["d"]) rocket.x += rocket.speedModifier;

        // Constraint ship mapping space coordinates bounds wrapper
        if (rocket.x < 20) rocket.x = 20;
        if (rocket.x > canvas.width - 20) rocket.x = canvas.width - 20;

        // Spawn falling debris metrics tracking systems
        if (Math.random() < 0.05) {
            asteroids.push({ x: Math.random()*canvas.width, y: -20, r: Math.random()*15+8, speed: Math.random()*4+3 });
        }

        // Processing active objects translation update physics
        asteroids.forEach((ast, idx) => {
            ast.y += ast.speed;
            
            // Render Asteroid
            ctx.beginPath();
            ctx.arc(ast.x, ast.y, ast.r, 0, Math.PI*2);
            ctx.fillStyle = "#64748b";
            ctx.fill();

            // Collision system tracking calculations matrix intersection
            let dist = Math.hypot(rocket.x - ast.x, rocket.y + 25 - ast.y);
            if (dist < ast.r + 15) {
                asteroids.splice(idx, 1);
                game.health--;
                if (game.health <= 0) {
                    game.screen = 'gameOver';
                    document.getElementById("controls-legend").classList.add("hidden");
                }
            }
        });

        // Draw Player Rocket Probe
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(rocket.x - rocket.width/2, rocket.y, rocket.width, rocket.height);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(rocket.x - rocket.width/2, rocket.y + rocket.height, rocket.width, 8); // Engine glow active

        // UI Telemetry Overlay elements
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`ORBIT REACH INDICES: ${Math.min(100, Math.floor((flightTimer/20)*100))}%`, 20, 40);
        ctx.fillText(`STRUCTURAL INTEGRITY: ${game.health}`, 20, 60);

        if (flightTimer >= 20) { // Successfully survive 20 seconds
