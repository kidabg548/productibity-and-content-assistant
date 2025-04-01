import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/database';
import userRoutes from './routes/user.route';
import authRoutes from './routes/auth.routes';
import musicRoutes from './routes/music.routes';
import spotifyAuthRoutes from './routes/spotifyAuth.routes'; // Import Spotify auth routes
import musicLLMRoutes from './routes/musicLLM.routes';
import taskRoutes from './routes/task.routes';
import timeManagementRoutes from './routes/timeManagement.routes';
import breakEnforcementRoutes from './routes/breakEnforcement.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: 'http://localhost:5173/', // Replace with your frontend origin
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser()); // Add cookie parser

// Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/music', musicRoutes);
app.use('/spotify', spotifyAuthRoutes); // Use Spotify auth routes
app.use('/llm', musicLLMRoutes); // Add LLM music recommendation routes
app.use('/tasks', taskRoutes);
app.use('/llm', timeManagementRoutes);
app.use('/break', breakEnforcementRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

// Start the server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });