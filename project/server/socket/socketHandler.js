const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL,
        'https://reeown.com',
        'https://www.reeown.com'
      ].filter(Boolean) // Remove undefined values
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Join auction room
    socket.on('join-auction', (auctionId) => {
      socket.join(`auction-${auctionId}`);
      console.log(`User ${socket.user.name} joined auction ${auctionId}`);
    });

    // Leave auction room
    socket.on('leave-auction', (auctionId) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`User ${socket.user.name} left auction ${auctionId}`);
    });

    // Handle bid placement (this will be called from the controller)
    socket.on('place-bid', async (data) => {
      // This is handled by the API endpoint, socket just broadcasts
      // The actual bid logic is in auctionController
    });

    // Handle RFQ creation
    socket.on('rfq-created', (data) => {
      // Broadcast to seller
      socket.to(`seller-${data.sellerId}`).emit('new-rfq', data);
    });

    // Handle RFQ response
    socket.on('rfq-responded', (data) => {
      // Broadcast to buyer
      socket.to(`buyer-${data.buyerId}`).emit('rfq-response', data);
    });

    // Join user-specific room for notifications
    socket.on('join-user-room', () => {
      socket.join(`user-${socket.user._id}`);
      console.log(`User ${socket.user.name} joined their notification room`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

// Helper function to emit bid updates
const emitBidUpdate = (auctionId, bidData) => {
  if (io) {
    io.to(`auction-${auctionId}`).emit('bid-updated', bidData);
  }
};

// Helper function to emit auction updates
const emitAuctionUpdate = (auctionId, auctionData) => {
  if (io) {
    io.to(`auction-${auctionId}`).emit('auction-updated', auctionData);
  }
};

// Helper function to emit RFQ updates
const emitRFQUpdate = (sellerId, buyerId, rfqData) => {
  if (io) {
    io.to(`seller-${sellerId}`).emit('rfq-updated', rfqData);
    io.to(`buyer-${buyerId}`).emit('rfq-updated', rfqData);
  }
};

// Helper function to emit notification to specific user
const emitNotification = (userId, notificationData) => {
  if (io) {
    io.to(`user-${userId}`).emit('new-notification', notificationData);
  }
};

module.exports = {
  initializeSocket,
  emitBidUpdate,
  emitAuctionUpdate,
  emitRFQUpdate,
  emitNotification,
  getIO: () => io
};

