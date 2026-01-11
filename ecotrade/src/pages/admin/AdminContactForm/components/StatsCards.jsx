import React from 'react';
import { MessageSquare, Clock, Check, AlertCircle } from 'lucide-react';


const StatsCards = ({ stats }) => {
  const primaryColor = '#2A4365';
  const secondaryColor = '#C87941';
  
  const cardData = [
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions,
      icon: MessageSquare,
      bgColor: primaryColor,
      lightBgColor: '#E2E8F0'
    },
    {
      title: 'In Progress',
      value: stats.inProgressSubmissions,
      icon: Clock,
      bgColor: secondaryColor,
      lightBgColor: '#FED7AA'
    },
    {
      title: 'Resolved',
      value: stats.resolvedSubmissions,
      icon: Check,
      bgColor: '#10B981',
      lightBgColor: '#D1FAE5'
    },
    {
      title: 'Urgent',
      value: stats.urgentSubmissions,
      icon: AlertCircle,
      bgColor: '#EF4444',
      lightBgColor: '#FEE2E2'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{card.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div
                className="p-2 sm:p-3 rounded-lg flex-shrink-0"
                style={{ backgroundColor: card.lightBgColor }}
              >
                <Icon
                  className="h-4 w-4 sm:h-6 sm:w-6"
                  style={{ color: card.bgColor }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;