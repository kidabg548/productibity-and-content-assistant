import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                if (!code) {
                    throw new Error('No authorization code received');
                }

                const response = await fetch(`http://localhost:3000/auth/google/callback?code=${code}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to complete Google authentication');
                }

                const data = await response.json();
                
                // Send success message to parent window
                window.opener.postMessage({
                    type: 'GOOGLE_AUTH_SUCCESS',
                    token: data.token
                }, 'http://localhost:3000');

                // Close this window
                window.close();
            } catch (error) {
                console.error('Google callback error:', error);
                
                // Send error message to parent window
                window.opener.postMessage({
                    type: 'GOOGLE_AUTH_ERROR',
                    error: error instanceof Error ? error.message : 'Authentication failed'
                }, 'http://localhost:3000');

                // Close this window
                window.close();
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-4">Completing Google Calendar Connection...</h1>
                <p className="text-gray-600">Please wait while we connect your Google Calendar account.</p>
            </div>
        </div>
    );
};

export default GoogleCallback; 