// CV Parser JavaScript
const API_BASE_URL = 'http://localhost:5240/api';

class CvParserUI {
    constructor() {
        this.currentTab = 'text';
        this.selectedFile = null;
        this.lastResult = null;
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupTextParsing();
        this.setupFileParsing();
        this.setupDragDrop();
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.upload-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update tabs
        document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        this.hideError();
    }

    setupTextParsing() {
        const parseBtn = document.getElementById('parseTextBtn');
        const clearBtn = document.getElementById('clearTextBtn');
        const textArea = document.getElementById('cvTextArea');

        parseBtn.addEventListener('click', () => {
            const text = textArea.value.trim();
            if (!text) {
                this.showError('Please paste CV text first');
                return;
            }
            this.parseText(text);
        });

        clearBtn.addEventListener('click', () => {
            textArea.value = '';
            this.hideResults();
            this.hideError();
        });
    }

    setupFileParsing() {
        const fileInput = document.getElementById('cvFileInput');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const parseBtn = document.getElementById('parseFileBtn');
        const clearBtn = document.getElementById('clearFileBtn');

        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileSelect(file);
            }
        });

        parseBtn.addEventListener('click', () => {
            if (this.selectedFile) {
                this.parseFile(this.selectedFile);
            }
        });

        clearBtn.addEventListener('click', () => {
            this.clearFile();
        });
    }

    setupDragDrop() {
        const dropArea = document.getElementById('fileUploadArea');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('dragover');
            });
        });

        dropArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    handleFileSelect(file) {
        // Validate file type
        const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
        const extension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(extension)) {
            this.showError('Only PDF, DOCX, DOC, and TXT files are allowed');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('File size must be less than 10MB');
            return;
        }

        this.selectedFile = file;
        document.getElementById('fileName').textContent = `Selected: ${file.name}`;
        document.getElementById('parseFileBtn').disabled = false;
        this.hideError();
    }

    clearFile() {
        this.selectedFile = null;
        document.getElementById('cvFileInput').value = '';
        document.getElementById('fileName').textContent = '';
        document.getElementById('parseFileBtn').disabled = true;
        this.hideResults();
        this.hideError();
    }

    async parseText(text) {
        this.showLoading();
        this.hideError();

        try {
            const response = await fetch(`${API_BASE_URL}/CvParser/parse-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cvText: text,
                    fileName: 'pasted_cv'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.displayResults(result);
        } catch (error) {
            console.error('Error parsing CV:', error);
            this.showError('Error parsing CV. Please make sure the backend server is running on port 5240.');
        } finally {
            this.hideLoading();
        }
    }

    async parseFile(file) {
        this.showLoading();
        this.hideError();

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/CvParser/parse-file`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.displayResults(result);
        } catch (error) {
            console.error('Error parsing CV file:', error);
            this.showError(error.message || 'Error parsing CV file. Please make sure the backend server is running on port 5240.');
        } finally {
            this.hideLoading();
        }
    }

    displayResults(result) {
        this.lastResult = result;

        // Update basic fields
        document.getElementById('resultName').textContent = result.fullName || 'Not found';
        document.getElementById('resultEmail').textContent = result.email || 'Not found';
        document.getElementById('resultPhone').textContent = result.phone || 'Not found';
        document.getElementById('resultExperience').textContent =
            result.experienceYears ? `${result.experienceYears} years` : 'Not found';
        document.getElementById('resultEducation').textContent = result.education || 'Not found';

        // Update skills
        const skillsContainer = document.getElementById('resultSkills');
        skillsContainer.innerHTML = '';
        if (result.skills && result.skills.length > 0) {
            result.skills.forEach(skill => {
                const tag = document.createElement('span');
                tag.className = 'skill-tag';
                tag.textContent = skill;
                skillsContainer.appendChild(tag);
            });
        } else {
            skillsContainer.innerHTML = '<span class="result-value placeholder">No skills detected</span>';
        }

        // Update certifications
        const certContainer = document.getElementById('resultCertifications');
        certContainer.innerHTML = '';
        if (result.certifications && result.certifications.length > 0) {
            result.certifications.forEach(cert => {
                const tag = document.createElement('span');
                tag.className = 'cert-tag';
                tag.textContent = cert;
                certContainer.appendChild(tag);
            });
        } else {
            certContainer.innerHTML = '<span class="result-value placeholder">No certifications detected</span>';
        }

        // Update languages
        const langContainer = document.getElementById('resultLanguages');
        langContainer.innerHTML = '';
        if (result.languages && result.languages.length > 0) {
            result.languages.forEach(lang => {
                const tag = document.createElement('span');
                tag.className = 'lang-tag';
                tag.textContent = lang;
                langContainer.appendChild(tag);
            });
        } else {
            langContainer.innerHTML = '<span class="result-value placeholder">No languages detected</span>';
        }

        // Update JSON output
        document.getElementById('jsonOutput').textContent = JSON.stringify(result, null, 2);

        // Show results section
        this.showResults();

        // Setup copy button
        document.getElementById('copyJsonBtn').onclick = () => this.copyJson();
    }

    showResults() {
        document.getElementById('resultSection').style.display = 'block';
        // Scroll to results
        document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideResults() {
        document.getElementById('resultSection').style.display = 'none';
    }

    showLoading() {
        document.getElementById('loading').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading').classList.remove('active');
    }

    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        errorEl.textContent = message;
        errorEl.classList.add('active');
    }

    hideError() {
        document.getElementById('errorMessage').classList.remove('active');
    }

    copyJson() {
        const jsonText = document.getElementById('jsonOutput').textContent;
        navigator.clipboard.writeText(jsonText).then(() => {
            const btn = document.getElementById('copyJsonBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon> Copied!';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showError('Failed to copy to clipboard');
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CvParserUI();
});
