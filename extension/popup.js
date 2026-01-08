/**
 * popup.js
 * Handles UI interactions and orchestrates analysis.
 */

// UI Elements
const analyzeBtn = document.getElementById('analyze-btn');
const manualBtn = document.getElementById('analyze-manual-btn');
const manualText = document.getElementById('manual-text');
const resultsView = document.getElementById('results-view');
const mainActions = document.querySelector('.main-actions');
const flagsList = document.getElementById('flags-list');
const resetBtn = document.getElementById('reset-btn');
const gradeBadge = document.getElementById('grade-badge');
const gradeDesc = document.getElementById('grade-desc');

// --- Event Listeners ---

analyzeBtn.addEventListener('click', async () => {
    try {
        const text = await getTabContent();
        if (text) {
            runAnalysis(text);
        } else {
            showError("Could not retrieve text from this page.");
        }
    } catch (err) {
        console.error(err);
        showError("Error connecting to page. Refresh the page and try again.");
    }
});

manualBtn.addEventListener('click', () => {
    const text = manualText.value;
    if (text.trim().length > 0) {
        runAnalysis(text);
    } else {
        alert("Please paste some text first.");
    }
});

resetBtn.addEventListener('click', () => {
    showMain();
});

// --- Functions ---

async function getTabContent() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) return null;

    try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageText" });
        return response ? response.text : null;
    } catch (e) {
        try {
            const injectionResults = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText
            });
            return injectionResults[0].result;
        } catch (injectionError) {
            console.error("Injection failed", injectionError);
            throw injectionError;
        }
    }
}

function runAnalysis(text) {
    if (!window.RedFlagLogic) {
        console.error("Rules logic not loaded!");
        return;
    }

    const result = window.RedFlagLogic.analyzeText(text);
    displayResults(result);
}

function displayResults(result) {
    // Hide actions, show results
    mainActions.classList.add('hidden');
    resultsView.classList.remove('hidden');

    // Update Grade Badge
    if (gradeBadge) {
        gradeBadge.textContent = 'Class ' + (result.grade || '?');
        gradeBadge.className = `grade-badge grade-${result.grade}`;
    }

    if (gradeDesc) {
        gradeDesc.innerHTML = `
            <div style="font-size: 1.1em; font-weight: bold;">${result.classificationLabel}</div>
            <div style="font-size: 0.9em; margin-top: 5px; color: #555;">${result.explanation}</div>
        `;
    }

    // Clear list
    flagsList.innerHTML = '';

    if (result.flags.length === 0) {
        const noFlagEl = document.createElement('div');
        noFlagEl.className = 'no-flags';
        noFlagEl.textContent = "✅ No common red flags detected (Class A)";
        flagsList.appendChild(noFlagEl);
    } else {
        result.flags.forEach(flag => {
            const card = document.createElement('div');
            card.className = `flag-card ${flag.severity}`;

            // Icon
            const icon = document.createElement('div');
            icon.className = 'flag-icon';
            icon.textContent = (flag.severity === 'HIGH') ? '👎' : '⚠️';

            const content = document.createElement('div');
            content.className = 'flag-content';

            const title = document.createElement('span');
            title.className = 'flag-title';
            title.textContent = flag.name;

            const desc = document.createElement('div');
            desc.className = 'flag-desc';
            desc.textContent = flag.description;

            content.appendChild(title);
            content.appendChild(desc);

            if (flag.trigger) {
                const triggerEl = document.createElement('div');
                triggerEl.style.fontSize = '11px';
                triggerEl.style.color = '#c62828';
                triggerEl.style.marginTop = '4px';
                triggerEl.style.fontStyle = 'italic';
                triggerEl.textContent = `Triggered by: "${flag.trigger}"`;
                content.appendChild(triggerEl);
            }

            card.appendChild(icon);
            card.appendChild(content);

            flagsList.appendChild(card);
        });
    }
}

function showMain() {
    resultsView.classList.add('hidden');
    mainActions.classList.remove('hidden');
    manualText.value = '';
}

function showError(msg) {
    alert(msg);
}
