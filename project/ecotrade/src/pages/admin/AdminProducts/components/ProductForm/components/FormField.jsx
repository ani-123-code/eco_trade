import React from 'react';
import CustomSelect from './CustomSelect';

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  options = [],
  rows = 3,
  min,
  step
}) => {
  const baseInputClasses = "w-full px-4 py-3 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 text-green-700 placeholder-gray-400";

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <CustomSelect
            label=""
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            required={required}
            placeholder={`Select ${label}`}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            className={baseInputClasses}
            placeholder={placeholder}
            required={required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            name={name}
            value={value}
            onChange={onChange}
            className={baseInputClasses}
            placeholder={placeholder}
            required={required}
            min={min}
            step={step}
          />
        );
      
      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={baseInputClasses}
            placeholder={placeholder}
            required={required}
          />
        );
    }
  };

  if (type === 'select') {
    return (
      <CustomSelect
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        required={required}
      />
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-green-700 mb-2">
        {label} {required && <span className="text-emerald-600">*</span>}
      </label>
      {renderInput()}
    </div>
  );
};

export default FormField;