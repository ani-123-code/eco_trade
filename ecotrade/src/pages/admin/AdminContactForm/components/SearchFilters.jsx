import React from 'react';
import { Search } from 'lucide-react';
import CustomSelect from '../../../../components/ui/CustomSelect';

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  departmentFilter,
  setDepartmentFilter
}) => {
  const primaryColor = '#2A4365';
  
  // Define options for each select
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'general', label: 'General' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Support' },
    { value: 'warranty', label: 'Warranty' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'partnership', label: 'Partnership' }
  ];

  return (
    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search submissions..."
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm"
            style={{
              '--tw-ring-color': primaryColor,
              focusRingColor: primaryColor
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 2px ${primaryColor}40`;
              e.target.style.borderColor = primaryColor;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '';
              e.target.style.borderColor = '';
            }}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Select status..."
            className="text-sm"
          />
          
          <CustomSelect
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
            placeholder="Select priority..."
            className="text-sm"
          />
          
          <CustomSelect
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departmentOptions}
            placeholder="Select department..."
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;