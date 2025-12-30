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

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
        dropZone.style.background = 'rgba(47, 129, 247, 0.1)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'transparent';

        if (e.dataTransfer.files.length) {
            cvInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });

    function handleFileSelect() {
        const file = cvInput.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Only PDF files are allowed.');
                cvInput.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit simulation
                alert('File is too large. Max 5MB.');
                cvInput.value = '';
                return;
            }

            fileLabel.textContent = `Selected: ${file.name}`;

            // Convert to Base64 for storage simulation
            const reader = new FileReader();
            reader.onload = function (e) {
                cvDataInput.value = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

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
            cvBase64: cvDataInput.value
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
