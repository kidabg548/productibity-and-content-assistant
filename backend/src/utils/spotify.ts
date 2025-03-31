import SpotifyWebApi from 'spotify-web-api-node';
import * as dotenv from 'dotenv';
import { stringify } from 'querystring';

dotenv.config();

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI // Add redirect URI
});

// Function to get the authorization URL
const getAuthorizeURL = (scopes: string[], state: string) => {
    return spotifyApi.createAuthorizeURL(scopes, state);
};

// Function to exchange authorization code for access token
const getAccessTokenFromCode = async (code: string) => {
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);
        return {
            accessToken: data.body['access_token'],
            refreshToken: data.body['refresh_token'],
            expiresIn: data.body['expires_in'],
        };
    } catch (error) {
        console.error('Error exchanging code for access token', error);
        throw error;
    }
};

export { spotifyApi, getAuthorizeURL, getAccessTokenFromCode };