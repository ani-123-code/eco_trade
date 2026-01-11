import React from 'react';
import { Search } from 'lucide-react';
import Input from '../../../../components/ui/Input';

const OrdersFilters = ({ searchQuery, statusFilter, onSearch, onStatusFilter }) => {
  const handleSearch = (e) => {
    onSearch(e.target.value);
  };

  const filterButtons = [
    { value: 'all', label: 'All', className: 'bg-green-600 text-white' },
    { value: 'processing', label: 'Processing', className: 'bg-emerald-500 text-white', hoverClass: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    { value: 'shipped', label: 'Shipped', className: 'bg-green-500 text-white', hoverClass: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
    { value: 'delivered', label: 'Delivered', className: 'bg-green-500 text-white', hoverClass: 'bg-green-100 text-green-800 hover:bg-green-200' },
    { value: 'cancelled', label: 'Cancelled', className: 'bg-red-500 text-white', hoverClass: 'bg-red-100 text-red-800 hover:bg-red-200' }
  ];

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
      <div className="w-full lg:w-1/3">
        <Input
          type="text"
          placeholder="Search by Order ID, Customer, Email..."
          value={searchQuery}
          onChange={handleSearch}
          leftIcon={<Search className="h-5 w-5 text-gray-400" />}
          fullWidth
        />
      </div>
      
      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
        {filterButtons.map((button) => (
          <button
            key={button.value}
            onClick={() => onStatusFilter(button.value)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === button.value
                ? button.className
                : button.hoverClass || 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrdersFilters;
