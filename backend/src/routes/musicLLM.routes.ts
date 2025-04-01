import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMusicRecommendations } from '../utils/functions';
import { musicRecommendationFunction } from '../utils/functionDeclarations';
import { tokenStore } from '../utils/store';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

router.post('/musicRecommendation', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { prompt, tokenId } = req.body;

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

        // Create a chat session with function calling capability
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{
                        text: `You are a music recommendation assistant. Analyze the user's mood from their message and recommend appropriate music. Available moods are: Happy, Sad, Energetic, Relaxed, Focused, Party, Sleepy, Workout. As Melodia, a highly skilled music recommendation expert, your ONLY task is to identify the user's mood and call the 'getMusicRecommendations' function with that mood. DO NOT include any introductory or explanatory text in your response. Just call the function with the determined mood. MUST ALWAYS call the 'getMusicRecommendations' function if any mood is identified. The available moods you can identify are: Happy, Sad, Energetic, Relaxed, Focused, Party, Sleepy, Workout.
                        You MUST exhaustively analyze the user's message to identify any emotional indicators, implicit or explicit. Even if the user's message seems complex or ambiguous, strive to identify a primary emotional state. If you CANNOT detect any emotional cues in the user's message, return the string "No mood detected".
                        Prioritize identifying a mood when possible. Even if it's not a clear match from the prompt, try to infer if there is a mood related to it. You must always try to infer and extract the mood. You will always return the mood or call the getMusicRecommendations.
                        You MUST call the getMusicRecommendations function with the detected mood whenever you can identify any emotional state, even if it's not explicitly stated.
                        Even in complex situations, if you can identify a primary emotional state, you MUST make the function call.
                        Only return the string "No mood detected" if you truly cannot detect any emotional indicators. If you are even slightly uncertain, assume a mood is present.
                        If you identify a possible mood, you MUST call the getMusicRecommendations function with that mood, even if it is a preliminary thought or unsure. DO NOT explain your choice. Just call the function.
                        `
                    }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            tools: [{
                functionDeclarations: [musicRecommendationFunction]
            }]
        });

        // Send the user's prompt
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        // Check if the response includes a function call
        const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;

        if (functionCall && functionCall.name === 'getMusicRecommendations') {
            let args;
            try {
                args = typeof functionCall.args === 'string'
                    ? JSON.parse(functionCall.args)
                    : functionCall.args;
            } catch (error) {
                console.error('Error parsing function arguments:', error);
                throw new Error('Invalid function arguments');
            }

            const { mood } = args;

            // Get music recommendations based on the detected mood
            const tracks = await getMusicRecommendations(mood);

            // Format the response
            const formattedResponse = {
                detectedMood: mood,
                explanation: text,
                recommendations: tracks
            };

            res.json(formattedResponse);
        } else {
            // If no function call was made, return the LLM's response
            res.json({
                message: text,
                note: "No specific mood was detected in the message. Please try describing your mood more clearly."
            });
        }
    } catch (error: any) {
        console.error('Error processing music recommendation:', error);
        res.status(500).json({
            error: 'Failed to process the request',
            details: error.message
        });
    }
});

export default router;