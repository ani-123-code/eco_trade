import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeNewsletter } from '../../../store/slices/newsletterContactSlice';
import { useToast } from '../../../contexts/ToastContext';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { newsletterSubscribing } = useSelector(
    (state) => state.newsletterContact
  );
  const { showSuccess, showError } = useToast();

const handleSubmit = async (e) => {
  e.preventDefault();
  if (email.trim()) {
    const result = await dispatch(subscribeNewsletter({ email }));
    if (subscribeNewsletter.fulfilled.match(result)) {
      showSuccess('Successfully subscribed to newsletter!');
    } else if (subscribeNewsletter.rejected.match(result)) {
      showError(result.payload?.message || 'Subscription failed. Please try again.');
    }
    setEmail('');
  }
};


  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/325111/pexels-photo-325111.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Newsletter background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A202C]/95 via-gray-900/90 to-emerald-900/85"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Stay Updated</h2>
          <p className="text-xl text-gray-200 mb-8">
            Subscribe to our newsletter for exclusive deals on refurbished devices, new arrivals, and tech tips
          </p>
    
           <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto">
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email address"
    className="flex-1 px-6 py-4 text-gray-900 my-2 sm:my-0 rounded-l-lg sm:rounded-r-none rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    required
    disabled={newsletterSubscribing}
  />
  <button
    type="submit"
    disabled={newsletterSubscribing}
    className="bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-r-lg sm:rounded-l-none rounded-l-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {newsletterSubscribing ? 'Subscribing...' : 'Subscribe'}
  </button>
</form>
     
          
          <p className="text-sm text-gray-400 mt-4">
            No spam, unsubscribe at any time
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;