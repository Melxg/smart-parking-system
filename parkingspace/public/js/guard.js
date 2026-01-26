// guard.js - Improved Authentication Guard
(function () {
    const token = localStorage.getItem("token");
    
    // If no token, redirect to login
    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    // Validate token (basic check)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            window.location.href = "/login.html?error=Session expired";
            return;
        }
        
        // Optional: Add user info to window for easy access
        window.user = {
            id: payload.id,
            email: localStorage.getItem("userEmail")
        };
        
    } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        window.location.href = "/login.html?error=Invalid session";
    }
})();