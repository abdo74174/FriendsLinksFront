document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('grid');
    const searchInput = document.getElementById('searchInput');
    const skillFilter = document.getElementById('skillFilter');
    const educationFilter = document.getElementById('educationFilter');
    const languageFilter = document.getElementById('languageFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const noResults = document.getElementById('noResults');
    const toggleFilters = document.getElementById('toggleFilters');
    const filterSection = document.getElementById('filterSection');
    const filterCount = document.getElementById('filterCount');

    let allProfiles = [];

    // Filter Toggle
    toggleFilters.addEventListener('click', () => {
        const isHidden = window.getComputedStyle(filterSection).display === 'none';
        filterSection.style.display = isHidden ? 'block' : 'none';
        toggleFilters.classList.toggle('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!filterSection.contains(e.target) && !toggleFilters.contains(e.target)) {
            filterSection.style.display = 'none';
            toggleFilters.classList.remove('active');
        }
    });

    async function loadProfiles() {
        allProfiles = await DataService.getAllProfiles();
        renderProfiles(allProfiles);
    }

    function renderProfiles(profiles) {
        grid.innerHTML = '';

        if (profiles.length === 0) {
            noResults.style.display = 'block';
            return;
        } else {
            noResults.style.display = 'none';
        }

        profiles.forEach(profile => {
            const card = document.createElement('div');
            card.className = 'profile-card fade-in';
            card.style.cursor = 'pointer';

            // Navigate on click (unless clicking a button/link)
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button') && !e.target.closest('a')) {
                    window.location.href = `profile.html?email=${encodeURIComponent(profile.email)}`;
                }
            });

            // Parse JSON fields safely
            const skills = profile.skills ? JSON.parse(profile.skills) : [];
            const experience = profile.experienceYears || 0;

            card.innerHTML = `
                <div class="avatar">${profile.name.charAt(0).toUpperCase()}</div>
                <div class="profile-name">${profile.name}</div>
                <div class="profile-role" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                    ${profile.education || 'Professional'} • ${experience}y Exp
                </div>
                
                <div class="social-links" style="margin-bottom: 1rem;">
                    <a href="${profile.linkedin}" target="_blank" class="social-icon" title="LinkedIn" onclick="event.stopPropagation()">
                        <ion-icon name="logo-linkedin"></ion-icon>
                    </a>
                    <a href="${profile.github}" target="_blank" class="social-icon" title="GitHub" onclick="event.stopPropagation()">
                        <ion-icon name="logo-github"></ion-icon>
                    </a>
                    ${profile.facebook ? `
                    <a href="${profile.facebook}" target="_blank" class="social-icon" title="Facebook" onclick="event.stopPropagation()">
                        <ion-icon name="logo-facebook"></ion-icon>
                    </a>` : ''}
                </div>

                <div class="skill-tags" style="display: flex; flex-wrap: wrap; gap: 0.25rem; justify-content: center; margin-bottom: 1.5rem; max-height: 50px; overflow: hidden;">
                    ${skills.slice(0, 3).map(skill => `<span style="background: var(--accent); color: white; border-radius: 10px; padding: 2px 8px; font-size: 0.65rem;">${skill}</span>`).join('')}
                    ${skills.length > 3 ? `<span style="background: var(--border); color: var(--text-secondary); border-radius: 10px; padding: 2px 8px; font-size: 0.65rem;">+${skills.length - 3}</span>` : ''}
                </div>

                <div style="display: flex; gap: 0.5rem; margin-top: auto; width: 100%;">
                    <a href="profile.html?email=${encodeURIComponent(profile.email)}" class="btn btn-primary" style="flex: 1; padding: 0.6rem; border-radius: 12px; font-size: 0.8rem; justify-content: center;">
                        <ion-icon name="person-outline"></ion-icon> View Profile
                    </a>
                    <button class="btn btn-outline share-btn" data-email="${profile.email}" title="Share Profile" style="padding: 0.6rem; border-radius: 12px;">
                        <ion-icon name="copy-outline"></ion-icon>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const skillTerm = skillFilter.value.toLowerCase();
        const educationTerm = educationFilter.value.toLowerCase();
        const languageTerm = languageFilter.value.toLowerCase();
        const minExp = parseInt(experienceFilter.value) || 0;

        const filtered = allProfiles.filter(p => {
            // Basic search
            const matchName = p.name.toLowerCase().includes(searchTerm);
            const matchEmail = p.email.toLowerCase().includes(searchTerm);

            // Skill filter
            const skills = p.skills ? JSON.parse(p.skills).map(s => s.toLowerCase()) : [];
            const matchSkills = skillTerm === '' || skills.some(s => s.includes(skillTerm));

            // Education filter
            const matchEdu = p.education ? p.education.toLowerCase().includes(educationTerm) : educationTerm === '';

            // Language filter
            const languages = p.languages ? JSON.parse(p.languages).map(l => l.toLowerCase()) : [];
            const matchLang = languageTerm === '' || languages.some(l => l.includes(languageTerm));

            // Experience filter
            const matchExp = p.experienceYears >= minExp;

            return (matchName || matchEmail) && matchSkills && matchEdu && matchLang && matchExp;
        });

        updateFilterCount();
        renderProfiles(filtered);
    }

    function updateFilterCount() {
        let count = 0;
        if (skillFilter.value.trim()) count++;
        if (educationFilter.value.trim()) count++;
        if (languageFilter.value.trim()) count++;
        if (experienceFilter.value && experienceFilter.value > 0) count++;

        if (count > 0) {
            filterCount.textContent = count;
            filterCount.style.display = 'inline-block';
        } else {
            filterCount.style.display = 'none';
        }
    }

    [searchInput, skillFilter, educationFilter, languageFilter, experienceFilter].forEach(el => {
        el.addEventListener('input', applyFilters);
    });




    // Share Button Logic
    grid.addEventListener('click', async (e) => {
        const btn = e.target.closest('.share-btn');
        if (!btn) return;

        const email = btn.dataset.email;
        if (!email) return;

        const url = new URL(`profile.html?email=${encodeURIComponent(email)}`, window.location.href).href;

        try {
            await navigator.clipboard.writeText(url);
            showToast('Profile link copied!');
        } catch (err) {
            console.error('Failed to copy class:', err);
            // Fallback
            prompt('Copy this link:', url);
        }
    });

    function showToast(message) {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<ion-icon name="checkmark-circle"></ion-icon> ${message}`;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    await loadProfiles();
});
