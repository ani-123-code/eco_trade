
import React from 'react';
import { ShoppingCart, DollarSign, Clock, CheckCircle } from 'lucide-react';


const OrdersStatistics = ({ stats }) => {
  // Guard against initial render when stats might be null
  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-24 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const statisticsData = [
    { title: 'Total Orders', value: stats.totalOrders?.toLocaleString(), icon: ShoppingCart },
    { title: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign },
    { title: 'Processing', value: stats.processingOrders?.toLocaleString(), icon: Clock },
    { title: 'Completed', value: stats.deliveredOrders?.toLocaleString(), icon: CheckCircle }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statisticsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <IconComponent className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrdersStatistics;