export const decodeJWT = (token: string) => {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch (error) {
        return null;
    }
};

export const isTokenExpired = (token: string) => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    const expiry = decoded.exp * 1000; // seconds => milliseconds
    return Date.now() >= expiry;
};

export const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};
