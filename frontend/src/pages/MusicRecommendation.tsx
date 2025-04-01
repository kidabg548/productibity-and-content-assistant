import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { MusicalNoteIcon, SparklesIcon, PlayIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArt: string | null;
  uri: string;
}

interface RecommendationResponse {
  detectedMood: string;
  explanation: string;
  recommendations: Track[];
}

interface ErrorResponse {
  message: string;
  note?: string;
}

const MusicRecommendation = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, spotifyTokenId, connectSpotify } = useAuth();

  const { data: response, refetch } = useQuery<RecommendationResponse | ErrorResponse>({
    queryKey: ['musicRecommendations'],
    queryFn: async () => {
      if (!prompt) return null;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          'http://localhost:3000/llm/musicRecommendation',
          { 
            prompt,
            tokenId: spotifyTokenId 
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          setError('Please connect your Spotify account to get music recommendations');
          return null;
        }
        setError('Failed to get recommendations. Please try again.');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    enabled: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const isRecommendationResponse = (response: RecommendationResponse | ErrorResponse): response is RecommendationResponse => {
    return 'recommendations' in response && Array.isArray(response.recommendations);
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4">Music Recommendations</h1>
        <p className="text-gray-400 text-lg">
          Get personalized music recommendations based on your mood and preferences
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={connectSpotify}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
            >
              <MusicalNoteIcon className="h-5 w-5" />
              <span>Connect with Spotify</span>
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <SparklesIcon className="h-5 w-5 text-indigo-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="How are you feeling today? (e.g., 'I'm feeling energetic and need motivation')"
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </button>
        </form>
      </motion.div>

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          {isRecommendationResponse(response) ? (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Detected Mood: {response.detectedMood}</h2>
                <p className="text-gray-400">{response.explanation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {response.recommendations.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition-colors group"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={track.albumArt || 'https://via.placeholder.com/300'}
                        alt={track.album}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={track.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors"
                        >
                          <PlayIcon className="h-6 w-6" />
                        </a>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 truncate">{track.name}</h3>
                      <p className="text-gray-400 text-sm mb-1 truncate">{track.artists.join(', ')}</p>
                      <p className="text-gray-500 text-sm truncate">{track.album}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-400">{response.message}</p>
              {response.note && (
                <p className="text-gray-500 mt-2">{response.note}</p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MusicRecommendation; 