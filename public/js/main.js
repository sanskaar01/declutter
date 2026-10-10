// Utility functions
function scrollToAssistant() {
    document.getElementById('assistant').scrollIntoView({ behavior: 'smooth' });
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference or use default
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(themeIcon, savedTheme);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(themeIcon, newTheme);
    });
}

function updateThemeIcon(iconElement, theme) {
    if (theme === 'dark') {
        iconElement.classList.remove('fa-moon');
        iconElement.classList.add('fa-sun');
    } else {
        iconElement.classList.remove('fa-sun');
        iconElement.classList.add('fa-moon');
    }
}

// AI Assistant functions
async function submitTextInput() {
    const textInput = document.getElementById('textInput').value;
    if (!textInput.trim()) {
        alert('Please describe your clutter situation');
        return;
    }

    const aiResponse = document.getElementById('aiResponse');
    aiResponse.innerHTML = '<p>Generating suggestions...</p>';

    try {
        const response = await fetch('/api/analyze-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: textInput }),
        });

        const data = await response.json();
        displayAIResponse(data.suggestions);
    } catch (error) {
        aiResponse.innerHTML = '<p>Error generating suggestions. Please try again.</p>';
        console.error('Error:', error);
    }
}

async function submitImageInput() {
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];
    
    if (!file) {
        alert('Please select an image');
        return;
    }

    const aiResponse = document.getElementById('aiResponse');
    aiResponse.innerHTML = '<p>Analyzing image...</p>';

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/analyze-image', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        displayAIResponse(data.suggestions);
    } catch (error) {
        aiResponse.innerHTML = '<p>Error analyzing image. Please try again.</p>';
        console.error('Error:', error);
    }
}

function displayAIResponse(suggestions) {
    const aiResponse = document.getElementById('aiResponse');
    aiResponse.innerHTML = `
        <h3>Your Personalized Decluttering Plan</h3>
        <div class="suggestions">
            ${suggestions.map(suggestion => `
                <div class="suggestion-item">
                    <p>${suggestion}</p>
                </div>
            `).join('')}
        </div>
        <button onclick="downloadPlan()" class="download-button">Download Plan</button>
    `;
}

async function downloadPlan() {
    try {
        const response = await fetch('/api/download-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                suggestions: Array.from(document.querySelectorAll('.suggestion-item p'))
                    .map(p => p.textContent)
            }),
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decluttering-plan.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading plan:', error);
        alert('Error downloading plan. Please try again.');
    }
}

// Challenge Mode functions
let challengeDay = 0;
const challengeTasks = [
    "Day 1: Declutter your desk",
    "Day 2: Organize your closet",
    "Day 3: Clean up digital files",
    "Day 4: Sort through kitchen cabinets",
    "Day 5: Organize bathroom storage",
    "Day 6: Clean up living room",
    "Day 7: Review and maintain"
];

function startChallenge() {
    challengeDay = 0;
    updateChallengeProgress();
}

function updateChallengeProgress() {
    const progressDiv = document.getElementById('challengeProgress');
    if (challengeDay >= challengeTasks.length) {
        progressDiv.innerHTML = `
            <h3>Congratulations! You've completed the challenge!</h3>
            <p>Keep up the good work and maintain your decluttered space.</p>
            <button onclick="startChallenge()">Start New Challenge</button>
        `;
        return;
    }

    progressDiv.innerHTML = `
        <h3>Day ${challengeDay + 1}</h3>
        <p>${challengeTasks[challengeDay]}</p>
        <button onclick="completeDay()">Complete Day</button>
    `;
}

function completeDay() {
    challengeDay++;
    updateChallengeProgress();
}

function updateFileName(input) {
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (input.files && input.files[0]) {
        const fileName = input.files[0].name;
        fileNameDisplay.textContent = fileName;
    } else {
        fileNameDisplay.textContent = '';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme toggle
    initThemeToggle();
    
    // Add smooth scrolling to navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add active class to navigation links based on scroll position
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + section.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
});