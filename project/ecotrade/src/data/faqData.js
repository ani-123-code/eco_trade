export const faqData = [
  {
    id: 1,
    question: 'How do I register as a buyer or seller?',
    answer: 'During registration, you can choose to register as either a buyer or seller. After registration and email verification, your account will be pending admin verification. Once approved, you can start participating in auctions or listing materials.'
  },
  {
    id: 2,
    question: 'How does the auction system work?',
    answer: 'Sellers list materials for auction with a starting price and end time. Buyers can place bids in real-time. The highest bidder at the end of the auction wins. All bidding happens in real-time with instant updates.'
  },
  {
    id: 3,
    question: 'What is Request for Quote (RFQ)?',
    answer: 'RFQ allows buyers to request a custom quote from sellers for materials. Sellers can respond with their quoted price, and buyers can accept or reject the offer. This is useful when you need a specific quantity or have special requirements.'
  },
  {
    id: 4,
    question: 'What materials can I trade on EcoTrade?',
    answer: 'EcoTrade supports trading of e-waste, FMGC (Fast Moving Consumer Goods), metals, plastics, and paper. All materials must be properly categorized and verified by admin before being listed.'
  },
  {
    id: 5,
    question: 'How long does admin verification take?',
    answer: 'Admin verification typically takes 24-48 hours. You will receive an email notification once your account is verified. Only verified buyers can bid, and only verified sellers can list materials.'
  },
  {
    id: 6,
    question: 'Can I list materials as both auction and RFQ?',
    answer: 'No, when listing a material, you must choose either auction (default) or RFQ only. Auction listings allow real-time bidding, while RFQ listings allow buyers to request custom quotes.'
  },
  {
    id: 7,
    question: 'What happens if I win an auction?',
    answer: 'Once an auction ends and you are the highest bidder (and reserve price is met if set), you win the auction. The seller will be notified, and you can proceed with the transaction details.'
  },
  {
    id: 8,
    question: 'How do I place a bid?',
    answer: 'Navigate to an active auction, enter your bid amount (must be at least 2% higher than current bid), and click "Place Bid". Your bid will be updated in real-time for all participants.'
  },
  {
    id: 9,
    question: 'Can sellers bid on their own materials?',
    answer: 'No, sellers cannot bid on their own materials. This ensures fair and transparent auctions for all participants.'
  },
  {
    id: 10,
    question: 'What is a reserve price?',
    answer: 'A reserve price is the minimum price a seller is willing to accept. If the auction ends below the reserve price, the seller is not obligated to sell. Reserve prices are optional and can be set when listing materials.'
  }
];

export const getContactPageFAQs = () => {
  return faqData.slice(0, 4);
};
