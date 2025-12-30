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
            // Stagger animation
            // card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="avatar">${profile.name.charAt(0).toUpperCase()}</div>
                <div class="profile-name">${profile.name}</div>
                <!-- Email hidden for privacy -->
                <div class="profile-role" style="display:none;">${profile.email}</div>
                
                <div class="social-links">
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
                    ${profile.portfolio ? `
                    <a href="${profile.portfolio}" target="_blank" class="social-icon" title="Portfolio">
                        <ion-icon name="globe-outline"></ion-icon>
                    </a>` : ''}
                </div>

                <a href="profile.html?email=${encodeURIComponent(profile.email)}" class="btn btn-primary" style="margin-top: 1.5rem; width: 100%;">
                    View Profile
                </a>
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

    await loadProfiles();
});
