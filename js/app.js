document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('grid');
    const searchInput = document.getElementById('searchInput');
    const noResults = document.getElementById('noResults');

    let allProfiles = [];

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
                    <a href="${profile.linkedin}" target="_blank" class="social-icon" title="LinkedIn">
                        <ion-icon name="logo-linkedin"></ion-icon>
                    </a>
                    <a href="${profile.github}" target="_blank" class="social-icon" title="GitHub">
                        <ion-icon name="logo-github"></ion-icon>
                    </a>
                    ${profile.facebook ? `
                    <a href="${profile.facebook}" target="_blank" class="social-icon" title="Facebook">
                        <ion-icon name="logo-facebook"></ion-icon>
                    </a>` : ''}
                </div>

                <div class="skill-tags" style="display: flex; flex-wrap: wrap; gap: 0.25rem; justify-content: center; margin-bottom: 1rem; max-height: 50px; overflow: hidden;">
                    ${skills.slice(0, 3).map(skill => `<span style="background: var(--accent); color: white; border-radius: 10px; padding: 2px 8px; font-size: 0.65rem;">${skill}</span>`).join('')}
                    ${skills.length > 3 ? `<span style="background: var(--border); color: var(--text-secondary); border-radius: 10px; padding: 2px 8px; font-size: 0.65rem;">+${skills.length - 3}</span>` : ''}
                </div>

                <div style="display: flex; gap: 0.5rem; margin-top: auto; width: 100%;">
                    <a href="profile.html?email=${encodeURIComponent(profile.email)}" class="btn btn-primary" style="flex: 1; padding: 0.5rem;">
                        View Profile
                    </a>
                    <button class="btn btn-outline share-btn" data-email="${profile.email}" title="Share Profile" style="padding: 0.5rem;">
                        <ion-icon name="share-social-outline"></ion-icon>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProfiles.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.email.toLowerCase().includes(term)
        );
        renderProfiles(filtered);
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
