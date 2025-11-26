import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Phone, Mail, Send, MessageCircle, Headphones, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { submitContactForm, resetContactState } from '../store/slices/newsletterContactSlice';
import { useToast } from '../contexts/ToastContext';
import  FAQModal from '../components/FAQModal/FAQModal';
import { getContactPageFAQs } from '../data/faqData';

const ContactPage = () => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  
  // Redux state
  const { 
    contactSubmitting, 
    contactSubmitted, 
    contactError 
  } = useSelector(state => state.newsletterContact);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address');
      return;
    }

    try {
      await dispatch(submitContactForm(formData)).unwrap();
      showSuccess('Your message has been sent successfully! We\'ll get back to you within 24 hours.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      showError(error.message || 'Failed to send message. Please try again.');
    }
  };

  // Handle success/error states
  useEffect(() => {
    if (contactSubmitted) {
      // Reset the state after showing success
      const timer = setTimeout(() => {
        dispatch(resetContactState());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [contactSubmitted, dispatch]);

  useEffect(() => {
    if (contactError) {
      // Reset error state after 5 seconds
      const timer = setTimeout(() => {
        dispatch(resetContactState());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [contactError, dispatch]);

  // Handler functions for actions
  const handleGetDirections = () => {
    const address = "123 Electronics Plaza, Andheri West, Mumbai 400058, Maharashtra, India";
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleCallNow = () => {
    window.open('tel:8008030203');
  };

  const handleSendEmail = () => {
    window.open('mailto:team@eco-dispose.com');
  };

  const handleLiveChat = () => {
    const whatsappNumber = '8861009443';
    const message = 'Hello! I would like to get assistance with Reeown refurbished electronics.';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      details: ['88610 09443', 'Customer Support', 'Mon-Sat: 9AM-6PM'],
      action: 'Call Now',
      onClick: handleCallNow
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['team@eco-dispose.com', 'We reply within 24 hours'],
      action: 'Send Email',
      onClick: handleSendEmail
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      details: ['Available 24/7', 'Instant responses', 'Expert assistance'],
      action: 'Start Chat',
      onClick: handleLiveChat
    }
  ];

  const departments = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'sales', label: 'Sales & Products' },
    { value: 'support', label: 'Technical Support' },
    { value: 'warranty', label: 'Warranty Claims' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'partnership', label: 'Business Partnership' }
  ];

  const faqs = getContactPageFAQs();

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-gray-200">
              Have questions about our refurbished electronics? Our expert team is ready to help you find the perfect device for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <info.icon className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{info.title}</h3>
                <div className="space-y-1 mb-4">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                  ))}
                </div>
                <button 
                  onClick={info.onClick}
                  className="text-green-700 hover:text-emerald-600 font-medium text-sm transition-colors"
                >
                  {info.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              <p className="text-gray-600 mb-8">
                Have a question or need assistance? Fill out the form below and our team will get back to you within 24 hours.
              </p>

              {contactSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-green-600">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      fullWidth
                      placeholder="Enter your full name"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      fullWidth
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      placeholder="Enter your phone number"
                    />
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                      >
                        <option value="">Select a subject</option>
                        {departments.map((dept) => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      required
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>
                  
                  {contactError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-red-600 text-sm">
                        {contactError.message || 'An error occurred. Please try again.'}
                      </p>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    leftIcon={<Send className="h-5 w-5" />}
                    isLoading={contactSubmitting}
                    disabled={contactSubmitting}
                    fullWidth
                  >
                    {contactSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>

            {/* Additional Info */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>

              {/* Quick Contact */}
              <div className="bg-green-600 text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Headphones className="h-5 w-5 mr-2" />
                  Need Immediate Help?
                </h3>
                <p className="text-gray-200 mb-4">
                  Our customer support team is available 24/7 to assist you with any questions or concerns.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={handleCallNow}
                  >
                    Call Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-white text-white hover:bg-white hover:text-green-700"
                    onClick={handleLiveChat}
                  >
                    Live Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">
                Quick answers to common questions about our products and services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">
                Can't find what you're looking for?
              </p>
              <Button 
                variant="outline"
                onClick={() => setIsFAQModalOpen(true)}
              >
                View All FAQs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Modal */}
      <FAQModal 
        isOpen={isFAQModalOpen} 
        onClose={() => setIsFAQModalOpen(false)} 
      />

      {/* Support Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-12">
              <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Ready to Go Green?</h2>
              <p className="text-xl text-gray-200 mb-8">
                Get instant support through WhatsApp or call our dedicated team at 88610 09443.
                Experience quality certified refurbished electronics with expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={handleLiveChat}
                  leftIcon={<MessageCircle className="h-5 w-5" />}
                >
                  Chat on WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-green-700"
                  onClick={handleCallNow}
                  leftIcon={<Phone className="h-5 w-5" />}
                >
                  Call 88610 09443
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;