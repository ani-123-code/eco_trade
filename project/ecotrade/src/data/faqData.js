export const faqData = [
   {
        id: 1,
        question: 'What is your return policy for certified refurbished products?',
        answer: 'We offer a 15-day return policy for all certified refurbished products. Items must be in the same condition as received with all original accessories and packaging. We provide a full refund if the product doesn\'t meet your expectations.'
      },
      {
        id: 2,
        question: 'How do you ensure the quality of certified refurbished products?',
        answer: 'Every device goes through our rigorous 40-point quality check process. We test functionality, battery health, screen quality, and all hardware components. Each product is cleaned, sanitized, and comes with a detailed quality report and certification.'
      },
      {
        id: 3,
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit/debit cards (Visa, MasterCard, American Express), UPI payments, net banking, and cash on delivery. We also offer EMI options for purchases above ₹5,000 with 0% interest for up to 12 months on select refurbished devices.'
      },
      {
        id: 4,
        question: 'How long is the warranty period?',
        answer: 'Warranty periods vary by product condition and type, ranging from 6 months to 1 year. All refurbished devices come with our comprehensive warranty covering hardware defects. Check individual product pages for specific warranty details.'
      },
      {
        id: 5,
        question: 'What are your delivery charges and timelines?',
        answer: 'Free delivery across India for orders above ₹2,000. For orders below ₹2,000, delivery charges are ₹150. Standard delivery takes 3-5 business days, while express delivery (next day) is available for ₹300 extra. We deliver Monday to Saturday, 9 AM to 7 PM.'
      },
      {
        id: 6,
        question: 'Can I sell my old device to Reeown?',
        answer: 'Yes! We buy old smartphones, laptops, tablets, and other electronics. Get an instant quote on our website, schedule a free pickup, and receive payment immediately after device verification. We accept devices in any working condition.'
      },
      {
        id: 7,
        question: 'What is your device grading system?',
        answer: 'We use a 4-tier grading system: Like New (95-100% condition), Excellent (85-94% condition), Good (70-84% condition), and Fair (60-69% condition). Each grade reflects the device\'s cosmetic and functional condition, clearly described on product pages.'
      },
      {
        id: 8,
        question: 'What does the certified refurbished warranty cover?',
        answer: 'Our comprehensive warranty covers hardware defects, battery issues, and functional problems. It includes free repair or replacement of defective components. Warranty does not cover physical damage, water damage, or issues caused by misuse after purchase.'
      },
      {
        id: 9,
        question: 'Do you offer financing options?',
        answer: 'Yes, we partner with leading financial institutions to offer easy EMI options. You can choose from 3, 6, 12, or 18-month EMI plans. We also offer 0% interest EMI on select refurbished devices during promotional periods. Credit approval is subject to bank terms.'
      },
      {
        id: 10,
        question: 'Do you provide data wiping services?',
        answer: 'Yes, all devices undergo complete data wiping using industry-standard methods to ensure your personal information is completely removed. We follow strict data security protocols and provide a data deletion certificate upon request.'
      },
      {
        id: 11,
        question: 'What if my device needs repair after warranty?',
        answer: 'We provide post-warranty repair services through our authorized service centers. Our skilled technicians use genuine spare parts and offer competitive pricing. We also provide a 3-month warranty on all repair work performed by our service team.'
      },
      {
        id: 12,
        question: 'How can I track my order?',
        answer: 'You can track your order using the tracking number provided via SMS and email. Visit our website and enter your order number in the tracking section, or call our customer service team. You will receive updates at every stage of the delivery process.'
      },
      {
        id: 13,
        question: 'Do you offer bulk discounts for corporate or educational purchases?',
        answer: 'Yes, we offer special pricing for bulk orders, corporate purchases, and educational institutions. Contact our sales team with your requirements, and we will provide a customized quote with volume discounts and flexible payment terms.'
      },
      {
        id: 14,
        question: 'Can I inspect the device before purchasing?',
        answer: 'Yes! We offer device inspection at our experience centers. You can also request detailed photos and videos of specific devices. Our experts will showcase the features and condition to help you make an informed decision.'
      },
      {
        id: 15,
        question: 'What is your price matching policy?',
        answer: 'We offer competitive pricing and will match legitimate competitor prices for identical refurbished products in the same condition grade. The competitor must be a verified seller, and the product must be in stock. Terms and conditions apply.'
      }
];


export const getContactPageFAQs = () => {
  return faqData.slice(0, 4);
};
