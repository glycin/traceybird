export async function submitScore(playerName, score) {
    try {
        const response = await fetch("https://your-backend-url.com/submit-score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: playerName, score: score }),
        });

        if (!response.ok) {
            throw new Error(`Failed to submit score: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Score submitted successfully:", data);
    } catch (error) {
        console.error("Error submitting score:", error);
    }
}

export async function submitTap() {
    try {
        const response = await fetch("https://your-backend-url.com/player/action", {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
        }

        const leaderboardData = await response.json();
        console.log("Leaderboard data:", leaderboardData);
        return leaderboardData; // Return data for further processing
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}

export async function submitDeath() {
    try {
        const response = await fetch("https://your-backend-url.com/leaderboard", {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
        }

        const leaderboardData = await response.json();
        console.log("Leaderboard data:", leaderboardData);
        return leaderboardData; // Return data for further processing
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}

export async function submitError() {
    try {
        const response = await fetch("https://your-backend-url.com/leaderboard", {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
        }

        const leaderboardData = await response.json();
        console.log("Leaderboard data:", leaderboardData);
        return leaderboardData; // Return data for further processing
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}

export async function getSession() {
    try {
        const response = await fetch("https://your-backend-url.com/create/player", {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
        }

        const leaderboardData = await response.json();
        console.log("Leaderboard data:", leaderboardData);
        return leaderboardData; // Return data for further processing
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}