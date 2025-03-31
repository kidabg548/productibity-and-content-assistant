import express, { Request, Response } from 'express';
import { spotifyApi } from '../utils/spotify';
import authMiddleware from '../middleware/authMiddleware'; // Import auth middleware

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

        if (!mood) {
            res.status(400).json({ message: 'Mood is required' });
            return; // Ensure function execution stops here
        }

        const moodGenreMap: { [key: string]: string[] } = {
            Happy: ['pop', 'happy', 'upbeat'],
            Sad: ['sad', 'indie pop'],
            Energetic: ['rock', 'edm', 'hip-hop'],
            Relaxed: ['chill', 'ambient'],
        };

        const seedGenres = moodGenreMap[mood] || ['pop'];

        const recommendations = await spotifyApi.getRecommendations({
            seed_genres: seedGenres,
            limit: 10,
        });

        const tracks = recommendations.body.tracks.map((track: SpotifyTrack) => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map((artist: { name: string }) => artist.name),
            album: track.album.name,
            albumArt: track.album.images[0]?.url || null,
            uri: track.uri,
        }));

        res.json(tracks); // No return statement needed
    } catch (error) {
        console.error('Error getting music recommendations:', error);
        res.status(500).json({ error: 'Failed to get music recommendations' });
    }
});


export default router;
