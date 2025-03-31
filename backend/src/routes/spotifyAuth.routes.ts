import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAuthorizeURL, getAccessTokenFromCode } from '../utils/spotify';
import { tokenStore } from '../utils/store';

// In-memory store for states (in production, use Redis or similar)
const stateStore = new Map<string, { state: string; timestamp: number }>();

// Clean up old states every hour
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of stateStore.entries()) {
        if (now - value.timestamp > 3600000) { // 1 hour
            stateStore.delete(key);
        }
    }
}, 3600000);

const router = express.Router();

// Route to initiate the Spotify authorization flow
router.get('/login', (req: Request, res: Response) => {
    const state = uuidv4();
    const spotifyScopes = (process.env.SPOTIFY_SCOPES || '').split(',');

    const authorizeURL = getAuthorizeURL(spotifyScopes, state);

    // Store state in memory with timestamp
    stateStore.set(state, {
        state,
        timestamp: Date.now()
    });

    console.log('Setting state for login:', state);
    console.log('Current states:', Array.from(stateStore.keys()));
    
    res.redirect(authorizeURL);
});

router.get('/callback', async (req: Request, res: Response): Promise<void> => {
    const { code, state } = req.query;
    
    console.log('Callback received:');
    console.log('Received state:', state);
    console.log('Available states:', Array.from(stateStore.keys()));

    if (!code || !state || typeof state !== 'string') {
        console.error('Error during callback: missing code or state');
        res.status(400).send('Missing code or state');
        return;
    }

    const storedStateData = stateStore.get(state);
    if (!storedStateData) {
        console.error('Error during callback: state not found');
        res.status(400).send('Invalid state');
        return;
    }

    // Remove the used state
    stateStore.delete(state);

    try {
        const tokenData = await getAccessTokenFromCode(code as string);
        
        // Store the access token
        const tokenId = uuidv4();
        tokenStore.set(tokenId, {
            accessToken: tokenData.accessToken,
            timestamp: Date.now()
        });

        // Send the token ID to the client
        res.send(`Successfully authenticated with Spotify! Token ID: ${tokenId}`);
    } catch (error) {
        console.error('Error during callback', error);
        res.status(500).send('Authentication failed');
    }
});

// Route to get the current access token
router.get('/token/:tokenId', (req: Request, res: Response) => {
    const { tokenId } = req.params;
    const tokenData = tokenStore.get(tokenId);

    if (!tokenData) {
        res.status(404).send('Token not found or expired');
        return;
    }

    res.json({ accessToken: tokenData.accessToken });
});

export default router;