/**
 * DECLUTTER // UI & INTERACTION ENGINEERING SHOWCASE
 * Frontend Controller, Synthetic Web Audio Engine & Reactive State Machine
 * Designed & Engineered by Sanskar Katiyar
 */

// --- Global State ---
let currentAuditSuggestions = [];
let challengeDay = parseInt(localStorage.getItem('declutter_challenge_day') || '0', 10);
let isBulbLit = false;
let isSfxEnabled = localStorage.getItem('declutter_sfx_enabled') !== 'false'; // default true

const CHALLENGE_TASKS = [
    { day: 1, title: "DESK PURGE", desc: "Strip your workstation to bare surfaces. Reintroduce only keyboard, mouse, and active work tools." },
    { day: 2, title: "WARDROBE CLEARANCE", desc: "Audit all clothing. Purge or box anything unworn within the last 6 months." },
    { day: 3, title: "DIGITAL SCRUB", desc: "Clear desktop icons, clean Downloads folder, and unsubscribe from junk mailing lists." },
    { day: 4, title: "KITCHEN PANTRY SORT", desc: "Discard expired foodstuffs and consolidate scattered ingredients into designated zones." },
    { day: 5, title: "BATHROOM STORAGE", desc: "Dispose of empty bottles, expired toiletries, and clutter on counter surfaces." },
    { day: 6, title: "LIVING ROOM DECRAP", desc: "Eliminate stray cables, floor debris, unused magazines, and excess decorative clutter." },
    { day: 7, title: "MINIMALIST LOCK-IN", desc: "Review purged items and commit to the One-In-One-Out protocol for all future acquisitions." }
];

// --- 1. Synthetic Web Audio Engine (Zero-Asset Haptic Audio) ---
const AudioEngine = {
    ctx: null,

    init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playClick() {
        if (!isSfxEnabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.045);
        } catch (e) {
            // Audio context fallback
        }
    },

    playPunch() {
        if (!isSfxEnabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            // Mechanical punch impact sound (low punch + crisp transient)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(260, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.13);
        } catch (e) {}
    },

    playCord() {
        if (!isSfxEnabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            // Dual metallic click for pull cord
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'square';
            osc1.frequency.setValueAtTime(1200, this.ctx.currentTime);
            gain1.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start();
            osc1.stop(this.ctx.currentTime + 0.05);

            setTimeout(() => {
                if (!this.ctx) return;
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(1800, this.ctx.currentTime);
                gain2.gain.setValueAtTime(0.06, this.ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
                osc2.connect(gain2);
                gain2.connect(this.ctx.destination);
                osc2.start();
                osc2.stop(this.ctx.currentTime + 0.08);
            }, 60);
        } catch (e) {}
    },

    playSuccess() {
        if (!isSfxEnabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            const notes = [440, 554.37, 659.25, 880];
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    if (!this.ctx) return;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.2);
                }, idx * 60);
            });
        } catch (e) {}
    }
};

// --- 2. Navigation & Smooth Scrolling ---
function initNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId.startsWith('#')) return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                AudioEngine.playClick();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('main > section, header');
        const navLinks = document.querySelectorAll('.nav-links a');
        const scrollPos = window.scrollY + 140;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (id && scrollPos >= top && scrollPos < top + height) {
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

// --- 3. Theme Engine (Raw Paper vs. Carbon Night) ---
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-label');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    const htmlEl = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme, false);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme') || 'light';
            const next = current === 'light' ? 'dark' : 'light';
            AudioEngine.playClick();
            applyTheme(next, true);
        });
    }

    function applyTheme(theme, playSound) {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeLabel) {
            themeLabel.textContent = theme === 'dark' ? 'CARBON NIGHT' : 'RAW PAPER';
        }
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        const inspectorTheme = document.getElementById('inspectorThemeDisplay');
        if (inspectorTheme) {
            inspectorTheme.textContent = theme === 'dark' ? 'CARBON NIGHT (DARK)' : 'RAW PAPER (LIGHT)';
        }
    }
}

function quickThemeSwitch() {
    const htmlEl = document.documentElement;
    const current = htmlEl.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    AudioEngine.playClick();
    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);

    const themeLabel = document.getElementById('theme-label');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    if (themeLabel) themeLabel.textContent = next === 'dark' ? 'CARBON NIGHT' : 'RAW PAPER';
    if (themeIcon) themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    const inspectorTheme = document.getElementById('inspectorThemeDisplay');
    if (inspectorTheme) {
        inspectorTheme.textContent = next === 'dark' ? 'CARBON NIGHT (DARK)' : 'RAW PAPER (LIGHT)';
    }
}

// --- 4. Tactical Audio Toggle ---
function initSfxToggle() {
    const sfxBtn = document.getElementById('sfx-toggle');
    if (!sfxBtn) return;

    updateSfxBtnDisplay();

    sfxBtn.addEventListener('click', () => {
        isSfxEnabled = !isSfxEnabled;
        localStorage.setItem('declutter_sfx_enabled', isSfxEnabled.toString());
        updateSfxBtnDisplay();
        if (isSfxEnabled) AudioEngine.playClick();
    });

    function updateSfxBtnDisplay() {
        const icon = sfxBtn.querySelector('i');
        const text = sfxBtn.querySelector('.btn-text-hide');
        if (isSfxEnabled) {
            if (icon) icon.className = 'fas fa-volume-high';
            if (text) text.textContent = 'SFX ON';
            sfxBtn.title = 'Sound FX Enabled (Click to Mute)';
        } else {
            if (icon) icon.className = 'fas fa-volume-xmark';
            if (text) text.textContent = 'SFX OFF';
            sfxBtn.title = 'Sound FX Muted (Click to Unmute)';
        }
    }
}

function testAudioFx() {
    AudioEngine.playPunch();
    setTimeout(() => AudioEngine.playClick(), 120);
}

// --- 5. Live Design Token Inspector ---
function toggleTokenInspector() {
    AudioEngine.playClick();
    const drawer = document.getElementById('tokenInspectorDrawer');
    if (drawer) {
        drawer.classList.toggle('active');
        if (drawer.classList.contains('active')) {
            drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// --- 6. Scanner Console: Tabs, Presets, & Dropzone ---
function switchScannerTab(tabName) {
    AudioEngine.playClick();
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
    AudioEngine.playClick();
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
            AudioEngine.playClick();
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
        AudioEngine.playClick();
    } else {
        clearSelectedFile();
    }
}

function clearSelectedFile(event) {
    if (event) event.stopPropagation();
    AudioEngine.playClick();
    const fileInput = document.getElementById('imageInput');
    const badge = document.getElementById('fileSelectedBadge');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    if (fileInput) fileInput.value = '';
    if (fileNameDisplay) fileNameDisplay.textContent = 'NO FILE SELECTED';
    if (badge) badge.classList.remove('visible');
}

// --- 7. API Request Pipeline ---
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
    AudioEngine.playClick();
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
            AudioEngine.playSuccess();
            displayAIResponse(data.suggestions);
        } else {
            throw new Error("Invalid response format from server");
        }
    } catch (error) {
        setScanningState(false);
        console.error('Error analyzing text:', error);
        renderErrorManifest("Failed to generate declutter suggestions. Ensure server is running or try again.");
    }
}

async function submitImageInput() {
    AudioEngine.playClick();
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
            AudioEngine.playSuccess();
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

// --- 8. Declutter Action Manifest & Hanging Pull-Cord Bulb ---
function displayAIResponse(suggestions) {
    currentAuditSuggestions = suggestions;
    const aiResponse = document.getElementById('aiResponse');
    if (!aiResponse) return;

    isBulbLit = false;
    aiResponse.classList.remove('lit');
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
            <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
                <button class="brutal-btn brutal-btn-primary" onclick="downloadPlan()">
                    <i class="fas fa-file-pdf"></i> EXPORT PLAN (PDF)
                </button>
                <button class="brutal-btn" onclick="copyManifestText()">
                    <i class="fas fa-copy"></i> COPY TEXT
                </button>
            </div>
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
            <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
                <button class="brutal-btn" onclick="copyManifestText()">
                    <i class="fas fa-copy"></i> COPY
                </button>
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
    AudioEngine.playCord();
    const pullWidget = document.getElementById('pullCordWidget');
    const pdfPanel = document.getElementById('pdfRevealedPanel');
    const aiResponse = document.getElementById('aiResponse');
    if (!pullWidget) return;

    // Trigger cord snap animation
    pullWidget.classList.add('pulling');
    setTimeout(() => {
        pullWidget.classList.remove('pulling');
    }, 250);

    isBulbLit = !isBulbLit;
    if (isBulbLit) {
        pullWidget.classList.add('lit');
        if (aiResponse) aiResponse.classList.add('lit');
        if (pdfPanel) {
            pdfPanel.classList.add('visible');
            pdfPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } else {
        pullWidget.classList.remove('lit');
        if (aiResponse) aiResponse.classList.remove('lit');
        if (pdfPanel) {
            pdfPanel.classList.remove('visible');
        }
    }
}

function toggleStepComplete(event, index) {
    AudioEngine.playClick();
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

function copyManifestText() {
    AudioEngine.playClick();
    const textEls = document.querySelectorAll('.manifest-step-card .step-body-text');
    let items = Array.from(textEls).map((el, i) => `${i + 1}. ${el.textContent.trim()}`);
    if (items.length === 0 && currentAuditSuggestions.length > 0) {
        items = currentAuditSuggestions.map((s, i) => `${i + 1}. ${s}`);
    }

    if (items.length === 0) return;

    const fullText = `DECLUTTER TACTICAL MANIFEST\n=========================\n${items.join('\n')}\n\nGenerated via Declutter Engine.`;
    navigator.clipboard.writeText(fullText).then(() => {
        alert('TACTICAL NOTICE: Declutter manifest copied to clipboard!');
    }).catch(() => {
        alert('Manifest ready: \n' + fullText);
    });
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
    AudioEngine.playClick();
    const aiResponse = document.getElementById('aiResponse');
    if (aiResponse) {
        aiResponse.classList.remove('visible');
        aiResponse.classList.remove('lit');
        aiResponse.innerHTML = '';
    }
}

async function downloadPlan() {
    AudioEngine.playClick();
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
        AudioEngine.playSuccess();
    } catch (error) {
        console.error('Error downloading plan:', error);
        alert('Error generating PDF dossier. Please try again.');
    }
}

// --- 9. 7-Day Punch-Card & Peter Griffin Easter Egg ---
function initPunchCard() {
    renderPunchCardView();
}

function renderPunchCardView() {
    const punchCardBody = document.getElementById('punchCardBody');
    if (!punchCardBody) return;

    if (challengeDay >= CHALLENGE_TASKS.length) {
        renderPeterGriffinEasterEgg();
    } else {
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
    const pct = Math.round((challengeDay / CHALLENGE_TASKS.length) * 100);

    punchCardBody.innerHTML = `
        <div class="punch-grid" id="punchGrid">
            ${slotsHtml}
        </div>
        <div class="punch-card-actions" id="punchCardActions">
            <div class="active-day-brief" id="activeDayBrief">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span class="mono-label" style="color: var(--color-orange);">ACTIVE OBJECTIVE:</span>
                    <span class="sticker-badge sticker-volt" style="font-size: 0.7rem; padding: 0.1rem 0.4rem;">${challengeDay}/7 DAYS (${pct}%)</span>
                </div>
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
            <div class="peter-speech-bubble">
                <div class="peter-quote-title">&ldquo;ALL DONE. SPACE SORTED.&rdquo;</div>
                <p class="peter-quote-body">
                    Freakin' sweet! You actually decluttered the entire place. Clean surfaces, zero junk. Now don't go fillin' it back up with novelty beer mugs, alright?
                </p>
            </div>

            <div class="peter-avatar-frame">
                <svg class="peter-avatar-svg" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                    <rect width="160" height="160" fill="#FFE6D5"/>
                    <rect x="30" y="130" width="100" height="30" fill="#207238"/>
                    <rect x="30" y="125" width="100" height="8" fill="#1A1A1A"/>
                    <rect x="70" y="124" width="20" height="10" fill="#FFCC00" stroke="#000" stroke-width="1.5"/>
                    <path d="M35 125 C35 95 50 82 80 82 C110 82 125 95 125 125 Z" fill="#FFFFFF" stroke="#000" stroke-width="2"/>
                    <path d="M45 52 C42 28 65 16 80 16 C95 16 118 28 115 52 C112 36 102 24 80 24 C58 24 48 36 45 52 Z" fill="#6B3A19" stroke="#000" stroke-width="2"/>
                    <path d="M44 48 C42 62 48 70 52 72 C48 64 48 55 50 48 Z" fill="#6B3A19"/>
                    <path d="M116 48 C118 62 112 70 108 72 C112 64 112 55 110 48 Z" fill="#6B3A19"/>
                    <path d="M50 56 C50 36 62 26 80 26 C98 26 110 36 110 56 C110 74 104 84 102 96 C100 106 95 112 80 112 C65 112 60 106 58 96 C56 84 50 74 50 56 Z" fill="#FAD1B2" stroke="#000" stroke-width="2.5"/>
                    <circle cx="48" cy="58" r="7" fill="#FAD1B2" stroke="#000" stroke-width="2"/>
                    <circle cx="112" cy="58" r="7" fill="#FAD1B2" stroke="#000" stroke-width="2"/>
                    <polygon points="68,82 80,95 72,96" fill="#FFFFFF" stroke="#000" stroke-width="2"/>
                    <polygon points="92,82 80,95 88,96" fill="#FFFFFF" stroke="#000" stroke-width="2"/>
                    <path d="M68 80 Q80 88 92 80" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M73 95 C73 103 80 103 80 96 C80 103 87 103 87 95" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
                    <circle cx="68" cy="54" r="13" fill="#FFFFFF" stroke="#000" stroke-width="3"/>
                    <circle cx="92" cy="54" r="13" fill="#FFFFFF" stroke="#000" stroke-width="3"/>
                    <line x1="81" y1="54" x2="79" y2="54" stroke="#000" stroke-width="3"/>
                    <circle cx="68" cy="54" r="2.5" fill="#000"/>
                    <circle cx="92" cy="54" r="2.5" fill="#000"/>
                    <ellipse cx="80" cy="62" rx="4.5" ry="6" fill="#F5BC94" stroke="#000" stroke-width="2"/>
                </svg>
            </div>

            <button class="brutal-btn brutal-btn-hazard" onclick="resetChallenge()">
                <i class="fas fa-rotate-left"></i> RESET PROTOCOL (START OVER)
            </button>
        </div>
    `;
}

function stampActiveDay() {
    if (challengeDay >= CHALLENGE_TASKS.length) return;

    AudioEngine.playPunch();
    challengeDay++;
    localStorage.setItem('declutter_challenge_day', challengeDay.toString());
    
    if (challengeDay >= CHALLENGE_TASKS.length) {
        AudioEngine.playSuccess();
    }

    renderPunchCardView();
}

function resetChallenge() {
    AudioEngine.playClick();
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

// --- 10. Application Bootstrapping ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initSfxToggle();
    initTextareaEvents();
    initDropzone();
    initPunchCard();
});