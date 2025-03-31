// Shared store for tokens (in production, use Redis or similar)
export const tokenStore = new Map<string, { accessToken: string; timestamp: number }>();

// Clean up old tokens every hour
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tokenStore.entries()) {
        if (now - value.timestamp > 3600000) { // 1 hour
            tokenStore.delete(key);
        }
    }
}, 3600000); 