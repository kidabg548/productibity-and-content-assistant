import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const GoogleCallback: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const token = params.get('token');
                const error = params.get('error');

                if (error) {
                    throw new Error(error);
                }

                if (token) {
                    localStorage.setItem('token', token);
                    navigate('/tasks');
                } else {
                    throw new Error('No token received');
                }
            } catch (err) {
                console.error('Error processing Google callback:', err);
                navigate('/login', { state: { error: 'Failed to authenticate with Google' } });
            }
        };

        handleCallback();
    }, [navigate, location]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h2 className="text-2xl font-semibold text-gray-900">
                    Completing Google Sign In...
                </h2>
                <p className="mt-2 text-gray-600">
                    Please wait while we process your authentication.
                </p>
            </motion.div>
        </div>
    );
};

export default GoogleCallback; 