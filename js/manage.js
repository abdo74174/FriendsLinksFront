document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const step1 = document.getElementById('emailStep');
    const step2 = document.getElementById('profileStep');
    const checkEmailForm = document.getElementById('checkEmailForm');
    const profileForm = document.getElementById('profileForm');
    const emailInput = document.getElementById('emailInput');

    // Form Elements
    const currentEmailInput = document.getElementById('currentEmail');
    const nameInput = document.getElementById('nameInput');
    const linkedinInput = document.getElementById('linkedinInput');
    const githubInput = document.getElementById('githubInput');
    const facebookInput = document.getElementById('facebookInput');
    const portfolioInput = document.getElementById('portfolioInput');
    const cvInput = document.getElementById('cvInput');
    const cvDataInput = document.getElementById('cvData');

    // New Fields
    const phoneInput = document.getElementById('phoneInput');
    const experienceInput = document.getElementById('experienceInput');
    const educationInput = document.getElementById('educationInput');
    const skillsInput = document.getElementById('skillsInput');
    const certificationsInput = document.getElementById('certificationsInput');
    const languagesInput = document.getElementById('languagesInput');
    const parseCvBtn = document.getElementById('parseCvBtn');
    const parseLoading = document.getElementById('parseLoading');

    const dropZone = document.getElementById('dropZone');
    const fileLabel = document.getElementById('fileLabel');
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');

    // Step 1: Check Email
    checkEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        if (!email.endsWith('@gmail.com')) {
            alert('Please use a valid Gmail address.');
            return;
        }

        const btn = checkEmailForm.querySelector('button');
        const originalText = btn.innerHTML;
        btn.textContent = 'Checking...';
        btn.disabled = true;

        try {
            const profile = await DataService.getProfile(email);

            // Switch to Step 2
            step1.style.display = 'none';
            step2.style.display = 'block';
            step2.classList.add('fade-in');

            currentEmailInput.value = email;

            if (profile) {
                // Edit Mode
                formTitle.textContent = `Edit Profile`;
                formSubtitle.textContent = `Updating information for ${email}`;
                nameInput.value = profile.name || '';
                linkedinInput.value = profile.linkedin || '';
                githubInput.value = profile.github || '';
                facebookInput.value = profile.facebook || '';
                portfolioInput.value = profile.portfolio || '';

                // New fields
                phoneInput.value = profile.phone || '';
                experienceInput.value = profile.experienceYears || 0;
                educationInput.value = profile.education || '';
                skillsInput.value = profile.skills ? JSON.parse(profile.skills).join(', ') : '';
                certificationsInput.value = profile.certifications ? JSON.parse(profile.certifications).join(', ') : '';
                languagesInput.value = profile.languages ? JSON.parse(profile.languages).join(', ') : '';

                if (profile.cvBase64) {
                    cvDataInput.value = profile.cvBase64;
                    fileLabel.textContent = "CV Attached (Upload new to replace)";
                }
            } else {
                // Create Mode
                formTitle.textContent = `Create Profile`;
                formSubtitle.textContent = `Setting up new profile for ${email}`;
                nameInput.value = '';
                linkedinInput.value = '';
                githubInput.value = '';
                facebookInput.value = '';
                portfolioInput.value = '';
                phoneInput.value = '';
                experienceInput.value = 0;
                educationInput.value = '';
                skillsInput.value = '';
                certificationsInput.value = '';
                languagesInput.value = '';
            }

        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // File Upload Handling
    dropZone.addEventListener('click', () => cvInput.click());

    cvInput.addEventListener('change', handleFileSelect);

    // ... (drag/drop handlers remain same)

    function handleFileSelect() {
        const file = cvInput.files[0];
        if (file) {
            const allowedTypes = [
                'application/pdf',
                'text/plain',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            const extension = file.name.split('.').pop().toLowerCase();

            if (!allowedTypes.includes(file.type) && extension !== 'docx') {
                alert('Only PDF, DOCX, and TXT files are allowed.');
                cvInput.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('File is too large. Max 10MB.');
                cvInput.value = '';
                return;
            }

            fileLabel.textContent = `Selected: ${file.name}`;

            // Convert to Base64 for storage
            const reader = new FileReader();
            reader.onload = function (e) {
                cvDataInput.value = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Modernized Parse CV logic supporting both modes
    parseCvBtn.addEventListener('click', async () => {
        parseCvBtn.disabled = true;
        parseLoading.style.display = 'block';

        try {
            let response;
            if (parsingMode === 'file') {
                const file = cvInput.files[0];
                if (!file) {
                    alert('Please select a file first.');
                    return;
                }
                const formData = new FormData();
                formData.append('file', file);
                response = await fetch('http://localhost:5240/api/CvParser/parse-file', {
                    method: 'POST',
                    body: formData
                });
            } else {
                const text = cvTextPaste.value.trim();
                if (!text) {
                    alert('Please paste some CV text first.');
                    return;
                }
                response = await fetch('http://localhost:5240/api/CvParser/parse-text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cvText: text, fileName: 'pasted_text.txt' })
                });
            }

            if (!response.ok) throw new Error('Parsing failed');

            const result = await response.json();

            // Auto-fill form fields
            if (result.fullName) nameInput.value = result.fullName;
            if (result.phone) phoneInput.value = result.phone;
            if (result.experienceYears !== undefined) experienceInput.value = result.experienceYears;
            if (result.education) educationInput.value = result.education;
            if (result.skills && result.skills.length) skillsInput.value = result.skills.join(', ');
            if (result.certifications && result.certifications.length) certificationsInput.value = result.certifications.join(', ');
            if (result.languages && result.languages.length) languagesInput.value = result.languages.join(', ');

            alert('CV details extracted successfully! Please review the auto-filled fields below.');
        } catch (error) {
            console.error('Error parsing CV:', error);
            alert('Failed to extract data. You can still enter it manually.');
        } finally {
            parseCvBtn.disabled = false;
            parseLoading.style.display = 'none';
        }
    });

    // Step 2: Save Profile
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = profileForm.querySelector('button[type="submit"]');
        btn.textContent = 'Saving...';
        btn.disabled = true;

        const profileData = {
            email: currentEmailInput.value,
            name: nameInput.value,
            linkedin: linkedinInput.value,
            github: githubInput.value,
            facebook: facebookInput.value,
            portfolio: portfolioInput.value,
            cvBase64: cvDataInput.value,
            // New fields - send as JSON strings for arrays
            phone: phoneInput.value,
            experienceYears: parseInt(experienceInput.value) || 0,
            education: educationInput.value,
            skills: JSON.stringify(skillsInput.value.split(',').map(s => s.trim()).filter(s => s)),
            certifications: JSON.stringify(certificationsInput.value.split(',').map(s => s.trim()).filter(s => s)),
            languages: JSON.stringify(languagesInput.value.split(',').map(s => s.trim()).filter(s => s))
        };

        try {
            await DataService.saveProfile(profileData);
            window.location.href = `profile.html?email=${encodeURIComponent(profileData.email)}`;
        } catch (err) {
            console.error(err);
            alert('Failed to save profile.');
            btn.textContent = 'Save Profile';
            btn.disabled = false;
        }
    });

    // Cancel
    document.getElementById('cancelBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
            window.location.href = 'index.html';
        }
    });
});
