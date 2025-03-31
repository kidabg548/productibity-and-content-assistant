import express, { Request, Response } from 'express';
import { spotifyApi } from '../utils/spotify';
import authMiddleware from '../middleware/authMiddleware';
import { tokenStore } from '../utils/store';

const router = express.Router();

// Interface for Spotify Track
interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
    uri: string;
}

// Endpoint to get music recommendations based on mood
router.get('/recommendations', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const mood = req.query.mood as string;
        const tokenId = req.query.tokenId as string;

        if (!mood) {
            res.status(400).json({ message: 'Mood is required' });
            return;
        }

        if (!tokenId) {
            res.status(401).json({ message: 'Token ID is required. Please authenticate with Spotify first.' });
            return;
        }

        // Get the token from the token store
        const tokenData = tokenStore.get(tokenId);
        if (!tokenData) {
            res.status(401).json({ message: 'Invalid or expired token. Please authenticate with Spotify again.' });
            return;
        }

        // Set the access token for this request
        spotifyApi.setAccessToken(tokenData.accessToken);

        // Mood-based search queries
        const moodQueries: { [key: string]: string } = {
            Happy: 'happy upbeat positive',
            Sad: 'sad emotional melancholic',
            Energetic: 'energetic high energy',
            Relaxed: 'chill relaxing peaceful',
            Focused: 'instrumental focus concentration',
            Party: 'party dance upbeat',
            Sleepy: 'sleepy calm ambient',
            Workout: 'workout energetic pump up'
        };

        const searchQuery = moodQueries[mood] || 'popular';

        console.log('Searching for tracks with mood:', mood);
        console.log('Using query:', searchQuery);

        // Search for tracks matching the mood
        const searchResults = await spotifyApi.searchTracks(searchQuery, {
            limit: 20,
            market: 'US'
        });

        if (!searchResults.body.tracks) {
            res.status(404).json({ message: 'No tracks found for the specified mood.' });
            return;
        }

        const tracks = searchResults.body.tracks.items.map((track: SpotifyTrack) => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map((artist: { name: string }) => artist.name),
            album: track.album.name,
            albumArt: track.album.images[0]?.url || null,
            uri: track.uri
        }));

        res.json(tracks);
    } catch (error: any) {
        console.error('Error getting music recommendations:', error);
        if (error.statusCode === 401) {
            res.status(401).json({ message: 'Spotify token expired. Please authenticate again.' });
        } else if (error.statusCode === 404) {
            res.status(404).json({ message: 'No recommendations found for the specified mood.' });
        } else {
            res.status(500).json({ 
                error: 'Failed to get music recommendations',
                details: error.message || 'Unknown error'
            });
        }
    }
});

export default router;
