import { spotifyApi } from './spotify';

export async function getMusicRecommendations(mood: string): Promise<any> {
    try {
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
            throw new Error('No tracks found for the specified mood.');
        }

        const tracks = searchResults.body.tracks.items.map((track: any) => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map((artist: { name: string }) => artist.name),
            album: track.album.name,
            albumArt: track.album.images[0]?.url || null,
            uri: track.uri
        }));

        return tracks;
    } catch (error) {
        console.error('Error getting music recommendations:', error);
        throw new Error('Failed to get music recommendations');
    }
} 