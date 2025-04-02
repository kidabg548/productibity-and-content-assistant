import React from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

interface GoogleAuthButtonProps {
    onSuccess: () => void;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onSuccess }) => {
    const { toast } = useToast();

    const handleGoogleLogin = async () => {
        try {
            // Open Google OAuth popup
            const width = 500;
            const height = 600;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            const popup = window.open(
                'http://localhost:3000/auth/google-auth',
                'Google OAuth',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // Listen for messages from the popup
            window.addEventListener('message', async (event) => {
                if (event.origin !== 'http://localhost:3000') return;

                if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                    const { token } = event.data;
                    localStorage.setItem('token', token);
                    toast({
                        title: 'Success',
                        description: 'Logged in with Google successfully!',
                    });
                    onSuccess(); 
                    popup?.close();
                } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                    toast({
                        title: 'Error',
                        description: event.data.error || 'Failed to login with Google',
                        variant: 'destructive',
                    });
                    popup?.close();
                }
            });
        } catch (error) {
            console.error('Google auth error:', error);
            toast({
                title: 'Error',
                description: 'Failed to connect with Google',
                variant: 'destructive',
            });
        }
    };

    return (
        <Button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            <img src="/google.svg" alt="Google logo" className="h-5 w-5" />
            Continue with Google
        </Button>
    );
};

export default GoogleAuthButton;