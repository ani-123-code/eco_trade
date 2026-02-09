import React from 'react';
import { Users, Award, TrendingUp, Shield } from 'lucide-react';

const StatsSection = () => {
  const features = [
    { 
      icon: Users, 
      title: 'Verified Community', 
      description: 'All users are verified and authenticated for secure trading' 
    },
    { 
      icon: Award, 
      title: 'Quality Assured', 
      description: 'Every material is verified by our expert admin team' 
    },
    { 
      icon: TrendingUp, 
      title: 'Fair Trading', 
      description: 'Transparent bidding process ensures competitive pricing' 
    },
    { 
      icon: Shield, 
      title: 'Secure Platform', 
      description: 'Safe and reliable marketplace for all your trading needs' 
    }
  ];

  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/1034653/pexels-photo-1034653.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Technology background"
          className="w-full h-full object-cover opacity-10"
        />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;