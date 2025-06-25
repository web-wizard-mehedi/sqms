import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://sqms.netlify.app/",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json()); 

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/queueSystem';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let db;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db();
    console.log('Connected to MongoDB');
    
    const adminExists = await db.collection('users').findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.collection('users').insertOne({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User',
        phone: '+1234567890',
        createdAt: new Date()
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinQueue', async (queueId) => {
    socket.join(`queue_${queueId}`);
    const queue = await db.collection('queues').findOne({ _id: new ObjectId(queueId) });
    if (queue) {
      socket.emit('queueUpdate', queue);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection('users').insertOne({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date()
    });

    res.status(201).json({ 
      message: 'Registration successful',
      userId: result.insertedId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Queue Management
app.post('/api/queue/book', authenticateToken, async (req, res) => {
  try {
    const { serviceType, timeSlot } = req.body;
    const userId = req.user.userId;

    const currentQueue = await db.collection('queues').find({
      serviceType,
      timeSlot,
      date: new Date().toISOString().split('T')[0],
      status: { $in: ['pending', 'serving'] }
    }).toArray();

    const queueNumber = currentQueue.length + 1;
    const position = queueNumber;

    const booking = await db.collection('queues').insertOne({
      userId,
      serviceType,
      timeSlot,
      queueNumber,
      position,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date()
    });

    // Emit queue update to all clients
    io.emit('queueUpdate', {
      serviceType,
      queueNumber,
      position,
      status: 'pending'
    });

    res.json({
      success: true,
      bookingId: booking.insertedId,
      queueNumber,
      message: `Your booking is confirmed! Queue Number: #${queueNumber}`
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'An error occurred while processing your booking' });
  }
});

// Get all queues (admin only)
app.get('/api/queue/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const queues = await db.collection('queues')
      .find({
        date: new Date().toISOString().split('T')[0]
      })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(queues);
  } catch (error) {
    console.error('Queue fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch queues' });
  }
});

// Admin endpoints
app.post('/api/queue/next', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { serviceType } = req.body;
    
    // Find the next pending queue
    const nextInQueue = await db.collection('queues').findOne({
      serviceType,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    }, { sort: { position: 1 } });

    if (!nextInQueue) {
      return res.status(404).json({ message: 'No pending customers in queue' });
    }

    // Update status to serving
    await db.collection('queues').updateOne(
      { _id: nextInQueue._id },
      { $set: { status: 'serving' } }
    );

    // Emit update to all clients
    io.emit('queueUpdate', {
      serviceType,
      queueId: nextInQueue._id,
      status: 'serving',
      queueNumber: nextInQueue.queueNumber
    });

    res.json({ message: 'Next customer called', queue: nextInQueue });
  } catch (error) {
    console.error('Next queue error:', error);
    res.status(500).json({ message: 'Failed to process next in queue' });
  }
});

app.post('/api/queue/complete', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { queueId } = req.body;

    const queue = await db.collection('queues').findOne({ _id: new ObjectId(queueId) });
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    // Mark as completed
    await db.collection('queues').updateOne(
      { _id: new ObjectId(queueId) },
      { $set: { status: 'completed', completedAt: new Date() } }
    );

    // Update positions for remaining queue
    await db.collection('queues').updateMany(
      {
        serviceType: queue.serviceType,
        date: queue.date,
        status: { $in: ['pending', 'serving'] },
        position: { $gt: queue.position }
      },
      { $inc: { position: -1 } }
    );

    // Emit update to all clients
    io.emit('queueUpdate', {
      serviceType: queue.serviceType,
      queueId,
      status: 'completed'
    });

    res.json({ message: 'Service completed successfully' });
  } catch (error) {
    console.error('Complete service error:', error);
    res.status(500).json({ message: 'Failed to complete service' });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      { $set: { name, phone, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get user bookings
app.get('/api/user/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await db.collection('queues')
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(bookings);
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});