class DataService {
    static API_URL = 'http://localhost:5240/api/Profile'; // Using HTTP for simplicity if HTTPS fails local cert check, or use 7116 for HTTPS

    static async getAllProfiles() {
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }
    }

    static async getProfile(email) {
        try {
            const response = await fetch(`${this.API_URL}/${email}`);
            if (response.status === 404) return null;
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    static async saveProfile(profile) {
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return true;
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    }

    static async init() {
        // No seed needed for API
    }
}

// Initialize on load
DataService.init();
