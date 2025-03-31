import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port, default to 3000

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});