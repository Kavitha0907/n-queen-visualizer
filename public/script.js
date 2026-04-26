const UI = {
    boardSizeDisplay: document.getElementById('size-label'),
    boardSizeInput: document.getElementById('board-size'),
    speedInput: document.getElementById('speed'),
    btnStart: document.getElementById('btn-start'),
    btnPause: document.getElementById('btn-pause'),
    btnReset: document.getElementById('btn-reset'),
    board: document.getElementById('board'),
    statusText: document.getElementById('status-text'),
    solutionsText: document.getElementById('solutions-text'),
    solutionsGallery: document.getElementById('solutions-gallery'),
    solutionsContainer: document.getElementById('solutions-container')
};

let state = {
    n: 4,
    speed: 80, // 1 to 100
    steps: [],
    solutions: [],
    currentStepIndex: 0,
    isPlaying: false,
    solutionsFoundCount: 0
};

// Initialize
function init() {
    state.n = parseInt(UI.boardSizeInput.value);
    drawBoard(state.n);
    setupEventListeners();
}

function setupEventListeners() {
    UI.boardSizeInput.addEventListener('input', (e) => {
        if(state.isPlaying) pause();
        state.n = parseInt(e.target.value);
        UI.boardSizeDisplay.innerText = state.n;
        reset();
    });

    UI.speedInput.addEventListener('input', (e) => {
        state.speed = parseInt(e.target.value);
    });

    UI.btnStart.addEventListener('click', async () => {
        if(state.isPlaying) return;
        
        if(state.steps.length === 0 || state.currentStepIndex >= state.steps.length) {
            reset();
            await fetchAndSolve();
        } else {
            play();
        }
    });

    UI.btnPause.addEventListener('click', pause);
    UI.btnReset.addEventListener('click', reset);
}

function drawBoard(n) {
    UI.board.innerHTML = '';
    UI.board.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    UI.board.style.gridTemplateRows = `repeat(${n}, 1fr)`;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if ((i + j) % 2 === 0) {
                cell.classList.add('light');
            } else {
                cell.classList.add('dark');
            }
            cell.id = `cell-${i}-${j}`;
            UI.board.appendChild(cell);
        }
    }
}

async function fetchAndSolve() {
    UI.statusText.innerText = "Solving on backend...";
    try {
        const response = await fetch(`/api/solve?n=${state.n}`);
        if (!response.ok) throw new Error("Failed to fetch solution");
        const data = await response.json();
        
        state.steps = data.steps;
        state.solutions = data.solutions;
        state.currentStepIndex = 0;
        state.solutionsFoundCount = 0;
        
        play();
    } catch (err) {
        UI.statusText.innerText = "Error API fetching. Is backend running?";
        console.error(err);
    }
}

function play() {
    state.isPlaying = true;
    UI.statusText.innerText = "Visualizing Backtracking...";
    UI.btnStart.disabled = true;
    UI.btnPause.disabled = false;
    processNextStep();
}

function pause() {
    state.isPlaying = false;
    UI.statusText.innerText = "Paused";
    UI.btnStart.disabled = false;
    UI.btnPause.disabled = true;
}

function reset() {
    pause();
    state.steps = [];
    state.solutions = [];
    state.currentStepIndex = 0;
    state.solutionsFoundCount = 0;
    UI.solutionsText.innerText = `Solutions Found: 0`;
    UI.statusText.innerText = "Ready to solve";
    UI.solutionsGallery.classList.add('hidden');
    UI.solutionsContainer.innerHTML = '';
    drawBoard(state.n);
}

function getDelay() {
    // Speed is 1 to 100. mapping to 10ms - 1000ms delay.
    return 1010 - (state.speed * 10);
}

function processNextStep() {
    if (!state.isPlaying) return;

    if (state.currentStepIndex >= state.steps.length) {
        finishVisualization();
        return;
    }

    const step = state.steps[state.currentStepIndex];
    applyStep(step);
    
    // Check if solution found just after a PLACE that reaches the end
    if (step.action === 'PLACE' && step.col === state.n - 1) {
        flashBoard();
        state.solutionsFoundCount++;
        UI.solutionsText.innerText = `Solutions Found: ${state.solutionsFoundCount}`;
    }

    state.currentStepIndex++;
    
    setTimeout(() => {
        processNextStep();
    }, getDelay());
}

function applyStep(step) {
    const cellId = `cell-${step.row}-${step.col}`;
    const cell = document.getElementById(cellId);
    if (!cell) return;
    
    if (step.action === 'PLACE') {
        const queen = document.createElement('span');
        queen.classList.add('queen');
        queen.innerHTML = '♛';
        cell.appendChild(queen);
        cell.classList.add('highlight');
        setTimeout(() => cell.classList.remove('highlight'), getDelay() * 0.8);
    } else if (step.action === 'REMOVE') {
        const queen = cell.querySelector('.queen');
        if (queen) {
            queen.classList.add('removing');
            setTimeout(() => {
                if(cell.contains(queen)) cell.removeChild(queen);
            }, Math.min(300, getDelay())); // Wait for disappearance animation
        }
        cell.classList.add('highlight');
        setTimeout(() => cell.classList.remove('highlight'), getDelay() * 0.8);
    }
}

function flashBoard() {
    UI.board.style.borderColor = 'var(--accent-color)';
    UI.board.style.boxShadow = '0 10px 40px var(--accent-color)';
    setTimeout(() => {
        UI.board.style.borderColor = 'var(--board-border)';
        UI.board.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.8)';
    }, Math.max(300, getDelay()));
}

function finishVisualization() {
    state.isPlaying = false;
    UI.btnStart.disabled = false;
    UI.btnPause.disabled = true;
    UI.statusText.innerText = `Visualization Complete! Total Solutions: ${state.solutions.length}`;
    renderSolutionsGallery();
}

function renderSolutionsGallery() {
    if (state.solutions.length === 0) return;
    UI.solutionsContainer.innerHTML = '';
    UI.solutionsGallery.classList.remove('hidden');

    state.solutions.forEach((sol, index) => {
        const miniBoard = document.createElement('div');
        miniBoard.classList.add('mini-board');
        miniBoard.style.gridTemplateColumns = `repeat(${state.n}, 1fr)`;
        miniBoard.style.gridTemplateRows = `repeat(${state.n}, 1fr)`;

        for (let i = 0; i < state.n; i++) {
            for (let j = 0; j < state.n; j++) {
                const cell = document.createElement('div');
                cell.classList.add('mini-cell');
                if ((i + j) % 2 === 0) {
                    cell.classList.add('light');
                } else {
                    cell.classList.add('dark');
                }
                if (sol[i][j] === 'Q') {
                    const q = document.createElement('span');
                    q.classList.add('queen');
                    q.innerHTML = '♛';
                    cell.appendChild(q);
                }
                miniBoard.appendChild(cell);
            }
        }
        UI.solutionsContainer.appendChild(miniBoard);
    });
}

// Boot
init();
