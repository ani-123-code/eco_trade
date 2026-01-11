import React, { useState } from 'react';
import { X } from 'lucide-react';

const SpecificationManager = ({ specifications, onChange }) => {
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      onChange({
        ...specifications,
        [newSpecKey.trim()]: newSpecValue.trim()
      });
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key) => {
    const newSpecs = { ...specifications };
    delete newSpecs[key];
    onChange(newSpecs);
  };

  const updateSpecification = (key, value) => {
    onChange({
      ...specifications,
      [key]: value
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecification();
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-green-700 mb-1">
        Specifications
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Note: Items will only be saved after clicking "Add" button
      </p>
      <div className="space-y-3">
        {Object.entries(specifications).map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <input
              type="text"
              value={key}
              readOnly
              className="w-full sm:flex-1 px-4 py-3 border border-[#E2E8F0] rounded-md bg-[#F7FAFC] text-green-700"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => updateSpecification(key, e.target.value)}
              className="w-full sm:flex-1 px-4 py-3 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 text-green-700"
            />
            <button
              type="button"
              onClick={() => removeSpecification(key)}
              className="self-center sm:self-auto p-2 text-emerald-600 hover:text-[#A0522D] hover:bg-[#FEF5E7] rounded-md transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <input
            type="text"
            value={newSpecKey}
            onChange={(e) => setNewSpecKey(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Specification name"
            className="w-full sm:flex-1 px-4 py-3 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 text-green-700 placeholder-gray-400"
          />
          <input
            type="text"
            value={newSpecValue}
            onChange={(e) => setNewSpecValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Specification value"
            className="w-full sm:flex-1 px-4 py-3 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 text-green-700 placeholder-gray-400"
          />
          <button
            type="button"
            onClick={addSpecification}
            className="self-center sm:self-auto px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 font-medium"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecificationManager;