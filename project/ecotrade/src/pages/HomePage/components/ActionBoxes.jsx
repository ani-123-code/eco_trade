import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, DollarSign, Wrench, Recycle, Building2 } from 'lucide-react';

const ActionBoxes = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: ShoppingBag,
      title: 'Buy',
      description: 'Explore premium refurbished electronics',
      color: 'from-green-500 to-emerald-600',
      hoverColor: 'hover:from-green-600 hover:to-emerald-700',
      action: () => navigate('/products')
    },
    {
      icon: DollarSign,
      title: 'Sell',
      description: 'Sell your old devices for instant cash',
      color: 'from-blue-500 to-cyan-600',
      hoverColor: 'hover:from-blue-600 hover:to-cyan-700',
      action: () => navigate('/sell')
    },
    {
      icon: Wrench,
      title: 'Repair',
      description: 'Get your devices repaired by experts',
      color: 'from-orange-500 to-amber-600',
      hoverColor: 'hover:from-orange-600 hover:to-amber-700',
      action: () => navigate('/repair')
    },
    {
      icon: Recycle,
      title: 'Recycle',
      description: 'Dispose e-waste responsibly',
      color: 'from-purple-500 to-violet-600',
      hoverColor: 'hover:from-purple-600 hover:to-violet-700',
      action: () => navigate('/recycle')
    },
    {
      icon: Building2,
      title: 'Business',
      description: 'Bulk orders for businesses & retailers',
      color: 'from-indigo-500 to-blue-600',
      hoverColor: 'hover:from-indigo-600 hover:to-blue-700',
      action: () => navigate('/business')
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What Would You Like To Do?</h2>
            <p className="text-gray-600">Choose from our comprehensive range of services</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${action.color} ${action.hoverColor} p-8 text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 transform`}
                >
                  <div className="relative z-10">
                    <div className="mb-4 inline-block rounded-full bg-white/20 p-4 backdrop-blur-sm">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold">{action.title}</h3>
                    <p className="text-sm text-white/90">{action.description}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActionBoxes;
