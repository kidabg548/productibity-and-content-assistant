import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  spotifyTokenId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  connectSpotify: () => Promise<void>;
  handleSpotifyCallback: () => Promise<void>;
}

const useAuth = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
  user: null,
  spotifyTokenId: localStorage.getItem('spotifyTokenId'),
  
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ isAuthenticated: true, token, user });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await axios.post('http://localhost:3000/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ isAuthenticated: true, token, user });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('spotifyTokenId');
    set({ isAuthenticated: false, token: null, user: null, spotifyTokenId: null });
  },

  connectSpotify: async () => {
    try {
      // Store the current URL to redirect back after authentication
      localStorage.setItem('spotifyRedirectUrl', window.location.pathname);
      window.location.href = 'http://localhost:3000/spotify/login';
    } catch (error) {
      console.error('Spotify connection error:', error);
      throw error;
    }
  },

  handleSpotifyCallback: async () => {
    try {
      // Get the token ID from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenId = urlParams.get('tokenId');
      
      if (tokenId) {
        // Store the token ID
        localStorage.setItem('spotifyTokenId', tokenId);
        set({ spotifyTokenId: tokenId });

        // Get the stored redirect URL
        const redirectUrl = localStorage.getItem('spotifyRedirectUrl') || '/music';
        localStorage.removeItem('spotifyRedirectUrl');
        
        // Redirect back to the previous page
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error('Spotify callback error:', error);
      throw error;
    }
  },
}));

export default useAuth; 