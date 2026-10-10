/**
 * DECLUTTER // TACTICAL MINIMALISM ENGINE
 * Frontend Controller & State Machine
 */

// Global State
let currentAuditSuggestions = [];
let challengeDay = parseInt(localStorage.getItem('declutter_challenge_day') || '0', 10);
let isBulbLit = false;

const CHALLENGE_TASKS = [
    { day: 1, title: "DESK PURGE", desc: "Strip your workstation to bare surfaces. Reintroduce only keyboard, mouse, and active work tools." },
    { day: 2, title: "WARDROBE CLEARANCE", desc: "Audit all clothing. Purge or box anything unworn within the last 6 months." },
    { day: 3, title: "DIGITAL SCRUB", desc: "Clear desktop icons, clean Downloads folder, and unsubscribe from junk mailing lists." },
    { day: 4, title: "KITCHEN PANTRY SORT", desc: "Discard expired foodstuffs and consolidate scattered ingredients into designated zones." },
    { day: 5, title: "BATHROOM STORAGE", desc: "Dispose of empty bottles, expired toiletries, and clutter on counter surfaces." },
    { day: 6, title: "LIVING ROOM DECRAP", desc: "Eliminate stray cables, floor debris, unused magazines, and excess decorative clutter." },
    { day: 7, title: "MINIMALIST LOCK-IN", desc: "Review purged items and commit to the One-In-One-Out protocol for all future acquisitions." }
];

// --- 1. Utility & Navigation ---

function scrollToAssistant() {
    const assistant = document.getElementById('assistant');
    if (assistant) {
        assistant.scrollIntoView({ behavior: 'smooth' });
    }
}

function initNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId.startsWith('#')) return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('main > section');
        const navLinks = document.querySelectorAll('.nav-links a');
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// --- 2. Theme Engine (Raw Paper vs. Carbon Night) ---

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-label');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    const htmlEl = document.documentElement;

    // Ensure default theme is light (Raw Paper) so tactile paper texture is always active
    const savedTheme = 'light';
    localStorage.setItem('theme', 'light');
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme') || 'light';
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next);
        });
    }

    function applyTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeLabel) {
            themeLabel.textContent = theme === 'dark' ? 'CARBON NIGHT' : 'RAW PAPER';
        }
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// --- 3. Scanner Console: Tabs, Presets, & Dropzone ---

function switchScannerTab(tabName) {
    const textBtn = document.getElementById('tab-text-btn');
    const imageBtn = document.getElementById('tab-image-btn');
    const textPane = document.getElementById('tab-text-pane');
    const imagePane = document.getElementById('tab-image-pane');

    if (tabName === 'text') {
        textBtn.classList.add('active');
        textBtn.setAttribute('aria-selected', 'true');
        imageBtn.classList.remove('active');
        imageBtn.setAttribute('aria-selected', 'false');

        textPane.classList.add('active');
        imagePane.classList.remove('active');
    } else {
        imageBtn.classList.add('active');
        imageBtn.setAttribute('aria-selected', 'true');
        textBtn.classList.remove('active');
        textBtn.setAttribute('aria-selected', 'false');

        imagePane.classList.add('active');
        textPane.classList.remove('active');
    }
}

function applyPreset(presetText) {
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.value = presetText;
        updateCharCount();
        switchScannerTab('text');
        textInput.focus();
    }
}

function initTextareaEvents() {
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', updateCharCount);
    }
}

function updateCharCount() {
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('char-count');
    if (textInput && charCount) {
        charCount.textContent = `${textInput.value.length} CHARACTERS`;
    }
}

function initDropzone() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('imageInput');

    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            fileInput.files = files;
            handleFileSelect(fileInput);
        }
    });
}

function handleFileSelect(input) {
    const badge = document.getElementById('fileSelectedBadge');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        fileNameDisplay.textContent = `${file.name.toUpperCase()} [${sizeMb} MB]`;
        badge.classList.add('visible');
    } else {
        clearSelectedFile();
    }
}

function clearSelectedFile(event) {
    if (event) event.stopPropagation();
    const fileInput = document.getElementById('imageInput');
    const badge = document.getElementById('fileSelectedBadge');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    if (fileInput) fileInput.value = '';
    if (fileNameDisplay) fileNameDisplay.textContent = 'NO FILE SELECTED';
    if (badge) badge.classList.remove('visible');
}

// --- 4. API Request Pipeline ---

function setScanningState(isScanning, message = "ANALYZING SPATIAL BOUNDARIES...") {
    const scanIndicator = document.getElementById('scanIndicator');
    const submitTextBtn = document.getElementById('btn-submit-text');
    const submitImageBtn = document.getElementById('btn-submit-image');
    const statusPill = document.getElementById('console-status-pill');

    if (scanIndicator) {
        if (isScanning) {
            scanIndicator.classList.add('active');
            const subMsg = scanIndicator.querySelector('.tactical-progress-bar')?.previousElementSibling?.querySelector('span:last-child');
            if (subMsg) subMsg.textContent = message;
            scanIndicator.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            scanIndicator.classList.remove('active');
        }
    }

    if (submitTextBtn) submitTextBtn.disabled = isScanning;
    if (submitImageBtn) submitImageBtn.disabled = isScanning;

    if (statusPill) {
        if (isScanning) {
            statusPill.textContent = "STATUS: AUDITING";
            statusPill.className = "sticker-badge sticker-orange";
        } else {
            statusPill.textContent = "STATUS: ONLINE";
            statusPill.className = "sticker-badge sticker-volt";
        }
    }
}

async function submitTextInput() {
    const textInput = document.getElementById('textInput');
    let text = textInput ? textInput.value.trim() : '';

    if (!text) {
        alert('TACTICAL NOTICE: Please provide a description of your cluttered space.');
        textInput.focus();
        return;
    }

    setScanningState(true, "PROCESSING DESCRIPTIVE CLUTTER VECTORS...");

    try {
        const response = await fetch('/api/analyze-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        setScanningState(false);

        if (data.suggestions && Array.isArray(data.suggestions)) {
            displayAIResponse(data.suggestions);
        } else {
            throw new Error("Invalid response format from server");
        }
    } catch (error) {
        setScanningState(false);
        console.error('Error analyzing text:', error);
        renderErrorManifest("Failed to generate declutter suggestions. Please verify your connection or try again.");
    }
}

async function submitImageInput() {
    const imageInput = document.getElementById('imageInput');
    const file = imageInput?.files ? imageInput.files[0] : null;

    if (!file) {
        alert('TACTICAL NOTICE: Please drop or select an image file first.');
        return;
    }

    setScanningState(true, "EXECUTING COMPUTER VISION ROOM SCAN...");

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/analyze-image', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        setScanningState(false);

        if (data.suggestions && Array.isArray(data.suggestions)) {
            displayAIResponse(data.suggestions);
        } else {
            throw new Error(data.error || "Failed to parse image suggestions");
        }
    } catch (error) {
        setScanningState(false);
        console.error('Error analyzing image:', error);
        renderErrorManifest("Failed to analyze image. Ensure the image is under 5MB and format is JPG, PNG, or WEBP.");
    }
}

// --- 5. Declutter Action Manifest & Hanging Pull-Cord Bulb ---

function displayAIResponse(suggestions) {
    currentAuditSuggestions = suggestions;
    const aiResponse = document.getElementById('aiResponse');
    if (!aiResponse) return;

    isBulbLit = false;
    const manifestSerial = `DEC-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    const itemsHtml = suggestions.map((suggestion, index) => {
        const stepNum = String(index + 1).padStart(2, '0');
        return `
            <div class="manifest-step-card" id="manifest-step-${index}" onclick="toggleStepComplete(event, ${index})">
                <button type="button" class="step-checkbox-btn" aria-label="Mark completed">
                    <i class="fas fa-check" style="display: none;"></i>
                </button>
                <div class="step-content-box">
                    <span class="step-badge-num">[TASK ${stepNum}]</span>
                    <span class="step-body-text">${escapeHtml(suggestion)}</span>
                </div>
            </div>
        `;
    }).join('');

    aiResponse.innerHTML = `
        <!-- Hanging Vintage Pull-Cord Bulb Trigger -->
        <div class="pull-cord-widget" id="pullCordWidget" title="Pull cord to reveal PDF download">
            <div class="cord-line"></div>
            <div class="bulb-fixture" onclick="triggerPullCord()">
                <div class="bulb-socket"></div>
                <div class="bulb-glass" id="bulbGlass">
                    <i class="fas fa-lightbulb"></i>
                </div>
            </div>
            <div class="cord-pull-string" onclick="triggerPullCord()">
                <div class="pull-chain-beads"></div>
                <div class="pull-handle"></div>
                <span class="pull-tag-pill">PULL / CLICK ME</span>
            </div>
        </div>

        <!-- Revealed PDF Export Panel (Triggered by Pull-Cord) -->
        <div class="pdf-revealed-panel" id="pdfRevealedPanel">
            <div>
                <span class="revealed-prompt-text"><i class="fas fa-bolt"></i> PLAN ILLUMINATED &bull; READY FOR EXPORT</span>
                <p style="font-size: 0.85rem; color: #0A0A0A; font-weight: 700; margin-top: 2px;">
                    Download your personalized decluttering plan as an official tactile PDF dossier.
                </p>
            </div>
            <button class="brutal-btn brutal-btn-primary" onclick="downloadPlan()">
                <i class="fas fa-file-pdf"></i> EXPORT DECLUTTER PLAN (PDF)
            </button>
        </div>

        <!-- Manifest Card Header -->
        <div class="manifest-receipt-header">
            <div class="manifest-identity">
                <span class="mono-label" style="color: var(--color-orange);">TACTICAL ACTION DOSSIER</span>
                <h3 class="manifest-id">MANIFEST #${manifestSerial}</h3>
                <div class="manifest-meta">ISSUED: ${today} // ${suggestions.length} ACTION ITEMS</div>
            </div>
            <div class="manifest-stamps">
                <span class="sticker-badge sticker-volt">
                    <i class="fas fa-circle-check"></i> AUDIT READY
                </span>
            </div>
        </div>

        <!-- Distinct Step Cards -->
        <div class="manifest-items-list" id="manifestItemsList">
            ${itemsHtml}
        </div>

        <!-- Manifest Footer Bar -->
        <div class="manifest-footer">
            <div class="manifest-progress-tally" id="manifestTally">
                COMPLETED: <span id="completedCount" style="color: var(--color-volt);">0</span> OF ${suggestions.length} ACTIONS
            </div>
            <div>
                <button class="brutal-btn" onclick="clearManifest()">
                    <i class="fas fa-trash-can"></i> CLEAR DOSSIER
                </button>
            </div>
        </div>
    `;

    aiResponse.classList.add('visible');
    aiResponse.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function triggerPullCord() {
    const pullWidget = document.getElementById('pullCordWidget');
    const pdfPanel = document.getElementById('pdfRevealedPanel');
    if (!pullWidget) return;

    // Trigger cord snap animation
    pullWidget.classList.add('pulling');
    setTimeout(() => {
        pullWidget.classList.remove('pulling');
    }, 250);

    isBulbLit = !isBulbLit;
    if (isBulbLit) {
        pullWidget.classList.add('lit');
        if (pdfPanel) {
            pdfPanel.classList.add('visible');
            pdfPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } else {
        pullWidget.classList.remove('lit');
        if (pdfPanel) {
            pdfPanel.classList.remove('visible');
        }
    }
}

function toggleStepComplete(event, index) {
    const card = document.getElementById(`manifest-step-${index}`);
    if (!card) return;

    const checkIcon = card.querySelector('.step-checkbox-btn i');
    const isCompleted = card.classList.toggle('completed');

    if (checkIcon) {
        checkIcon.style.display = isCompleted ? 'block' : 'none';
    }

    updateManifestTally();
}


function updateManifestTally() {
    const completedItems = document.querySelectorAll('.manifest-step-card.completed').length;
    const completedCountEl = document.getElementById('completedCount');
    if (completedCountEl) {
        completedCountEl.textContent = completedItems;
    }
}

function renderErrorManifest(message) {
    const aiResponse = document.getElementById('aiResponse');
    if (!aiResponse) return;

    aiResponse.innerHTML = `
        <div class="manifest-receipt-header" style="background-color: rgba(255, 42, 85, 0.1);">
            <div class="manifest-identity">
                <span class="mono-label" style="color: var(--color-danger);">SYSTEM NOTICE</span>
                <h3 class="manifest-id" style="color: var(--color-danger);">AUDIT NOTICE</h3>
            </div>
            <span class="sticker-badge sticker-orange">ACTION REQUIRED</span>
        </div>
        <div style="padding: 2rem; color: var(--text-primary);">
            <p style="font-weight: 700; margin-bottom: 1.2rem;">${escapeHtml(message)}</p>
            <button class="brutal-btn brutal-btn-hazard" onclick="clearManifest()">
                DISMISS NOTICE
            </button>
        </div>
    `;
    aiResponse.classList.add('visible');
}

function clearManifest() {
    const aiResponse = document.getElementById('aiResponse');
    if (aiResponse) {
        aiResponse.classList.remove('visible');
        aiResponse.innerHTML = '';
    }
}

async function downloadPlan() {
    const textEls = document.querySelectorAll('.manifest-step-card .step-body-text');
    let suggestionsToSend = Array.from(textEls).map(el => el.textContent.trim());

    if (suggestionsToSend.length === 0 && currentAuditSuggestions.length > 0) {
        suggestionsToSend = currentAuditSuggestions;
    }

    if (suggestionsToSend.length === 0) {
        alert('No decluttering items available to export.');
        return;
    }

    try {
        const response = await fetch('/api/download-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ suggestions: suggestionsToSend })
        });

        if (!response.ok) {
            throw new Error(`PDF generation returned status ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `declutter-plan-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading plan:', error);
        alert('Error generating PDF dossier. Please try again.');
    }
}

// --- 6. 7-Day Punch-Card & Peter Griffin Easter Egg ---

function initPunchCard() {
    renderPunchCardView();
}

function renderPunchCardView() {
    const punchCardBody = document.getElementById('punchCardBody');
    if (!punchCardBody) return;

    if (challengeDay >= CHALLENGE_TASKS.length) {
        // Render Peter Griffin "ALL DONE SPACE SORTED" Easter Egg Card
        renderPeterGriffinEasterEgg();
    } else {
        // Render Standard Punch Card Grid & Action Bar
        renderStandardPunchGrid();
    }
}

function renderStandardPunchGrid() {
    const punchCardBody = document.getElementById('punchCardBody');
    if (!punchCardBody) return;

    const slotsHtml = CHALLENGE_TASKS.map((task, index) => {
        const isStamped = index < challengeDay;
        const isActive = index === challengeDay;

        let slotClass = "punch-slot";
        if (isStamped) slotClass += " stamped-slot";
        if (isActive) slotClass += " active-slot";

        return `
            <div class="${slotClass}" id="slot-day-${task.day}">
                <div>
                    <div class="slot-day-num">DAY 0${task.day}</div>
                    <div class="slot-task-title">${task.title}</div>
                </div>
                <div class="stamp-circle">
                    ${isStamped ? 'PURGED' : (isActive ? 'NEXT' : 'SLOT')}
                </div>
            </div>
        `;
    }).join('');

    const currentTask = CHALLENGE_TASKS[challengeDay] || CHALLENGE_TASKS[0];

    punchCardBody.innerHTML = `
        <div class="punch-grid" id="punchGrid">
            ${slotsHtml}
        </div>
        <div class="punch-card-actions" id="punchCardActions">
            <div class="active-day-brief" id="activeDayBrief">
                <span class="mono-label" style="color: var(--color-orange);">ACTIVE OBJECTIVE:</span>
                <div class="active-day-title" id="activeDayTitle">DAY ${currentTask.day}: ${currentTask.title}</div>
                <p class="active-day-desc" id="activeDayDesc">${currentTask.desc}</p>
            </div>
            <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
                <button class="brutal-btn brutal-btn-primary" id="btn-punch-day" onclick="stampActiveDay()">
                    <i class="fas fa-stamp"></i> PUNCH COMPLETED DAY
                </button>
                <button class="brutal-btn" onclick="resetChallenge()" title="Reset Challenge">
                    <i class="fas fa-rotate-left"></i> RESET
                </button>
            </div>
        </div>
    `;
}

function renderPeterGriffinEasterEgg() {
    const punchCardBody = document.getElementById('punchCardBody');
    if (!punchCardBody) return;

    punchCardBody.innerHTML = `
        <div class="peter-celebration-container">
            <!-- Peter Griffin Speech Bubble -->
            <div class="peter-speech-bubble">
                <div class="peter-quote-title">&ldquo;ALL DONE. SPACE SORTED.&rdquo;</div>
                <p class="peter-quote-body">
                    Freakin' sweet! You actually decluttered the entire place. Clean surfaces, zero junk. Now don't go fillin' it back up with novelty beer mugs, alright?
                </p>
            </div>

            <!-- Crisp Vector Peter Griffin Avatar Frame -->
            <div class="peter-avatar-frame">
                <svg class="peter-avatar-svg" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                    <!-- Background Soft Tone -->
                    <rect width="160" height="160" fill="#FFE6D5"/>

                    <!-- Green Pants / Trousers -->
                    <rect x="30" y="130" width="100" height="30" fill="#207238"/>
                    <!-- Black Belt -->
                    <rect x="30" y="125" width="100" height="8" fill="#1A1A1A"/>
                    <rect x="70" y="124" width="20" height="10" fill="#FFCC00" stroke="#000" stroke-width="1.5"/>

                    <!-- White Shirt Body -->
                    <path d="M35 125 C35 95 50 82 80 82 C110 82 125 95 125 125 Z" fill="#FFFFFF" stroke="#000" stroke-width="2"/>

                    <!-- Peter's Brown Hair -->
                    <path d="M45 52 C42 28 65 16 80 16 C95 16 118 28 115 52 C112 36 102 24 80 24 C58 24 48 36 45 52 Z" fill="#6B3A19" stroke="#000" stroke-width="2"/>
                    <path d="M44 48 C42 62 48 70 52 72 C48 64 48 55 50 48 Z" fill="#6B3A19"/>
                    <path d="M116 48 C118 62 112 70 108 72 C112 64 112 55 110 48 Z" fill="#6B3A19"/>

                    <!-- Head / Neck Skin Shape -->
                    <path d="M50 56 C50 36 62 26 80 26 C98 26 110 36 110 56 C110 74 104 84 102 96 C100 106 95 112 80 112 C65 112 60 106 58 96 C56 84 50 74 50 56 Z" fill="#FAD1B2" stroke="#000" stroke-width="2.5"/>

                    <!-- Ears -->
                    <circle cx="48" cy="58" r="7" fill="#FAD1B2" stroke="#000" stroke-width="2"/>
                    <circle cx="112" cy="58" r="7" fill="#FAD1B2" stroke="#000" stroke-width="2"/>

                    <!-- White Shirt Collar Flaps -->
                    <polygon points="68,82 80,95 72,96" fill="#FFFFFF" stroke="#000" stroke-width="2"/>
                    <polygon points="92,82 80,95 88,96" fill="#FFFFFF" stroke="#000" stroke-width="2"/>

                    <!-- Smile & Chin Cleft Balls -->
                    <path d="M68 80 Q80 88 92 80" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
                    <!-- Distinct Chin Bulbs -->
                    <path d="M73 95 C73 103 80 103 80 96 C80 103 87 103 87 95" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>

                    <!-- Big Round Glasses (Black Rims) -->
                    <!-- Left Lens -->
                    <circle cx="68" cy="54" r="13" fill="#FFFFFF" stroke="#000" stroke-width="3"/>
                    <!-- Right Lens -->
                    <circle cx="92" cy="54" r="13" fill="#FFFFFF" stroke="#000" stroke-width="3"/>
                    <!-- Glasses Bridge -->
                    <line x1="81" y1="54" x2="79" y2="54" stroke="#000" stroke-width="3"/>

                    <!-- Pupils -->
                    <circle cx="68" cy="54" r="2.5" fill="#000"/>
                    <circle cx="92" cy="54" r="2.5" fill="#000"/>

                    <!-- Oval Nose -->
                    <ellipse cx="80" cy="62" rx="4.5" ry="6" fill="#F5BC94" stroke="#000" stroke-width="2"/>
                </svg>
            </div>

            <!-- Reset Action Button -->
            <button class="brutal-btn brutal-btn-hazard" onclick="resetChallenge()">
                <i class="fas fa-rotate-left"></i> RESET PROTOCOL (START OVER)
            </button>
        </div>
    `;
}

function stampActiveDay() {
    if (challengeDay >= CHALLENGE_TASKS.length) return;

    challengeDay++;
    localStorage.setItem('declutter_challenge_day', challengeDay.toString());
    renderPunchCardView();
}

function resetChallenge() {
    if (confirm('Reset your 7-Day Minimalist Punch-Card to Day 1?')) {
        challengeDay = 0;
        localStorage.setItem('declutter_challenge_day', '0');
        renderPunchCardView();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- 7. Application Bootstrapping ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initTextareaEvents();
    initDropzone();
    initPunchCard();
});
