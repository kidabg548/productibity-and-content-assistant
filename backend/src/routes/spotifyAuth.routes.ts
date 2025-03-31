import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; // For generating state
import { getAuthorizeURL, getAccessTokenFromCode } from '../utils/spotify';

const router = express.Router();

// Route to initiate the Spotify authorization flow
router.get('/login', (req: Request, res: Response) => {
    const state = uuidv4(); // Generate a unique state
    const spotifyScopes = (process.env.SPOTIFY_SCOPES || '').split(','); // Get scopes from .env file

    const authorizeURL = getAuthorizeURL(spotifyScopes, state); // Use scopes and state

    // Store the state in a cookie or session for later validation
    res.cookie('spotify_auth_state', state, {
        httpOnly: true,             // Recommended: Prevent client-side JS access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax',           // Adjust based on cross-site needs
        path: '/',                 // Make the cookie available across the app
        domain: undefined       // You generally DO NOT need to set this for localhost
    });

    res.redirect(authorizeURL);
});

router.get('/callback', async (req: Request, res: Response): Promise<void> => {
    const { code, state } = req.query;
    const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

    if (!code || !state || state !== storedState) {
        console.error('Error during callback: state mismatch or missing code');
        console.log(state)
        console.log(storedState)
        
    console.log("State from Cookie: ", req.cookies['spotify_auth_state']); //Debugging
    console.log("Stored state value: ", storedState); 
    
        res.status(400).send('State mismatch or missing code');
        return; // ✅ Explicitly return void
    
    }

   


    try {
        const tokenData = await getAccessTokenFromCode(code as string);
        res.send('Successfully authenticated with Spotify! Access token: ' + tokenData.accessToken);
        return; // ✅ Explicitly return void
    } catch (error) {
        console.error('Error during callback', error);
        res.status(500).send('Authentication failed');
        return; // ✅ Explicitly return void
    }
});

export default router;