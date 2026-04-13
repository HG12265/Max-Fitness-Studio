import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { User } from './src/models/User.ts';
import { Client } from './src/models/Client.ts';
import { Trainer } from './src/models/Trainer.ts';
import { sendWelcomeEmail } from './src/lib/email.ts';
import { generateDietPlan } from './src/lib/diet.ts';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || undefined });

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

app.use(cors());
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      // Bootstrap Admin User
      const adminEmail = 'admin@maxfitness.com';
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        console.log('Bootstrapping default admin user...');
        const admin = new User({
          name: 'Admin',
          email: adminEmail,
          password: 'admin123',
          role: 'admin'
        });
        await admin.save();
        console.log('Default admin created: admin@maxfitness.com / admin123');
      }
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      if (err.name === 'MongooseServerSelectionError') {
        console.error('\n' + '='.repeat(50));
        console.error('CONNECTION ERROR: Could not reach MongoDB Atlas.');
        console.error('FIX: Please ensure you have whitelisted "0.0.0.0/0" in your MongoDB Atlas Network Access settings.');
        console.error('Link: https://www.mongodb.com/docs/atlas/security-whitelist/');
        console.error('='.repeat(50) + '\n');
      }
    });
} else {
  console.warn('MONGODB_URI not found in environment variables. Database functionality will be limited.');
}

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// --- API ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const user = new User({ name, email, password, role });
    await user.save();
    
    // Send welcome email on registration
    sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error('Failed to trigger welcome email on registration:', err);
    });
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user: any = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Client Routes
app.get('/api/clients', authenticateToken, async (req: any, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { uid: req.user.id };
    }
    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', authenticateToken, async (req: any, res) => {
  try {
    const clientData = {
      ...req.body,
      uid: req.user.id,
      diet_plan: generateDietPlan(req.body)
    };
    const client = new Client(clientData);
    await client.save();
    
    // Send welcome email if email is provided
    if (client.email) {
      sendWelcomeEmail(client.email, client.name).catch(err => {
        console.error('Failed to trigger welcome email:', err);
      });
    }
    
    res.status(201).json(client);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      diet_plan: generateDietPlan(req.body)
    };
    const client = await Client.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(client);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Trainer Routes
app.get('/api/trainers', authenticateToken, async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });
    res.json(trainers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trainers', authenticateToken, isAdmin, async (req, res) => {
  try {
    const trainer = new Trainer(req.body);
    await trainer.save();
    res.status(201).json(trainer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/trainers/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(trainer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/trainers/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trainer deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chatbot', authenticateToken, async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const systemPrompt = `You are a professional gym coach for Max Fitness Studio. Respond in plain text only, without markdown formatting. Use clear sections, numbered steps, and bullet points. Focus only on gym workouts, training plans, diet, nutrition, recovery, and healthy food choices. If the user asks an unrelated question, politely explain that you only provide gym and fitness support.`;
    const prompt = `${systemPrompt}\n\nUser: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      temperature: 0.2,
      candidate_count: 1
    });

    res.json({ answer: response.text || 'Sorry, I could not generate a response right now.' });
  } catch (err: any) {
    console.error('Chatbot error:', err);
    res.status(500).json({ error: err.message || 'Chatbot request failed.' });
  }
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const frontendRoot = path.join(process.cwd(), 'frontend');
    const vite = await createViteServer({
      root: frontendRoot,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'frontend', 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      app.get('*', (req, res) => {
        res.status(404).send('Static files not found. Please run npm run build.');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
