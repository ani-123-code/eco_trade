const Auction = require('../models/Auction');
const Material = require('../models/Material');
const Bid = require('../models/Bid');
const { createNotification } = require('../controllers/notificationController');
const User = require('../models/User');

// Auto-publish scheduled auctions
const publishScheduledAuctions = async () => {
  try {
    const now = new Date();
    
    // Find scheduled auctions that should be published (must be admin approved)
    const scheduledAuctions = await Auction.find({
      status: 'scheduled',
      scheduledPublishDate: { $lte: now },
      adminApproved: true // Only publish admin-approved scheduled auctions
    })
      .populate('material')
      .populate('material.seller', 'name email');

    for (const auction of scheduledAuctions) {
      // Publish the auction
      auction.status = 'active';
      auction.publishedAt = now;
      await auction.save();

      // Update material status
      if (auction.material) {
        const material = await Material.findById(auction.material._id);
        if (material) {
          material.isVerified = true;
          material.status = 'active';
          await material.save();
        }
      }

      // Notify seller
      if (auction.material?.seller) {
        await createNotification(
          auction.material.seller._id,
          'auction-approved',
          'Auction Published',
          `Your scheduled auction "${auction.material.name}" has been published and is now live!`,
          {
            relatedAuction: auction._id,
            relatedMaterial: auction.material._id,
            sendEmail: true,
            userEmail: auction.material.seller.email,
            userName: auction.material.seller.name,
            auctionName: auction.material.name
          }
        );
      }

      console.log(`Published scheduled auction: ${auction._id}`);
    }

    if (scheduledAuctions.length > 0) {
      console.log(`Published ${scheduledAuctions.length} scheduled auction(s)`);
    }
  } catch (error) {
    console.error('Error publishing scheduled auctions:', error);
  }
};

// Auto-close expired auctions
const closeExpiredAuctions = async () => {
  try {
    const now = new Date();
    
    // Find active auctions that have ended
    const expiredAuctions = await Auction.find({
      status: 'active',
      endTime: { $lte: now }
    })
      .populate('material')
      .populate('currentBidder', 'name email')
      .populate('winner', 'name email');

    for (const auction of expiredAuctions) {
      // Close the auction
      auction.status = 'ended';
      
      // Set winner if there's a current bidder
      if (auction.currentBidder && !auction.winner) {
        auction.winner = auction.currentBidder;
      }

      await auction.save();

      // Mark all bids as closed
      const bids = await Bid.find({ auction: auction._id });
      for (const bid of bids) {
        if (auction.winner && bid.bidder.toString() === auction.winner.toString()) {
          bid.status = 'won';
          
          // Notify winner
          const winner = await User.findById(auction.winner._id);
          if (winner) {
            const tokenDeadline = new Date();
            tokenDeadline.setDate(tokenDeadline.getDate() + 2); // 2 days from now
            
            if (auction.tokenAmount > 0) {
              auction.tokenPaymentDeadline = tokenDeadline;
              await auction.save();
            }

            await createNotification(
              winner._id,
              'bid-won',
              'Congratulations! You Won the Auction',
              `You won the auction for "${auction.material.name}" with a bid of ₹${auction.currentBid.toLocaleString('en-IN')}.${auction.tokenAmount > 0 ? ` Please pay the token amount of ₹${auction.tokenAmount.toLocaleString('en-IN')} within 2 days.` : ''}`,
              {
                relatedAuction: auction._id,
                relatedBid: bid._id,
                relatedMaterial: auction.material._id,
                sendEmail: true,
                userEmail: winner.email,
                userName: winner.name,
                auctionName: auction.material.name,
                winningBid: auction.currentBid,
                tokenAmount: auction.tokenAmount,
                tokenDeadline: tokenDeadline
              }
            );
          }
        } else {
          bid.status = 'lost';
          
          // Notify losers
          const loser = await User.findById(bid.bidder);
          if (loser) {
            await createNotification(
              loser._id,
              'bid-lost',
              'Auction Ended',
              `The auction for "${auction.material.name}" has ended. Your bid did not win.`,
              {
                relatedAuction: auction._id,
                relatedBid: bid._id,
                relatedMaterial: auction.material._id,
                sendEmail: false
              }
            );
          }
        }
        bid.closedAt = new Date();
        await bid.save();
      }

      console.log(`Closed expired auction: ${auction._id}`);
    }

    if (expiredAuctions.length > 0) {
      console.log(`Closed ${expiredAuctions.length} expired auction(s)`);
    }
  } catch (error) {
    console.error('Error closing expired auctions:', error);
  }
};

// Send token payment reminders
const sendTokenPaymentReminders = async () => {
  try {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Find auctions where token payment is due soon (within 24 hours)
    const auctionsNeedingReminder = await Auction.find({
      status: { $in: ['ended', 'admin-approved', 'seller-approved'] },
      tokenAmount: { $gt: 0 },
      tokenPaid: false,
      tokenPaymentDeadline: {
        $gte: now,
        $lte: oneDayFromNow
      }
    })
      .populate('winner', 'name email')
      .populate('material');

    for (const auction of auctionsNeedingReminder) {
      if (auction.winner) {
        const hoursRemaining = Math.ceil((auction.tokenPaymentDeadline - now) / (1000 * 60 * 60));
        
        await createNotification(
          auction.winner._id,
          'token-payment-reminder',
          'Token Payment Reminder',
          `Reminder: Please pay the token amount of ₹${auction.tokenAmount.toLocaleString('en-IN')} for "${auction.material.name}" within ${hoursRemaining} hours.`,
          {
            relatedAuction: auction._id,
            relatedMaterial: auction.material._id,
            sendEmail: true,
            userEmail: auction.winner.email,
            userName: auction.winner.name,
            auctionName: auction.material.name,
            tokenAmount: auction.tokenAmount,
            hoursRemaining: hoursRemaining
          }
        );
      }
    }

    if (auctionsNeedingReminder.length > 0) {
      console.log(`Sent ${auctionsNeedingReminder.length} token payment reminder(s)`);
    }
  } catch (error) {
    console.error('Error sending token payment reminders:', error);
  }
};

// Run schedulers
const startSchedulers = () => {
  // Publish scheduled auctions every minute
  setInterval(publishScheduledAuctions, 60 * 1000);
  
  // Close expired auctions every minute
  setInterval(closeExpiredAuctions, 60 * 1000);
  
  // Send token payment reminders every hour
  setInterval(sendTokenPaymentReminders, 60 * 60 * 1000);
  
  // Run immediately on startup
  publishScheduledAuctions();
  closeExpiredAuctions();
  sendTokenPaymentReminders();
  
  console.log('✅ Auction schedulers started');
};

module.exports = {
  publishScheduledAuctions,
  closeExpiredAuctions,
  sendTokenPaymentReminders,
  startSchedulers
};
