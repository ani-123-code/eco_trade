import React, { useState } from 'react';
import { X } from 'lucide-react';

const FeatureManager = ({ features, onChange }) => {
  const [newFeature, setNewFeature] = useState('');

  const addFeature = () => {
    if (newFeature.trim()) {
      onChange([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    onChange(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    onChange(newFeatures);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-green-700 mb-1">
        Features
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Note: Items will only be saved after clicking "Add" button
      </p>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <input
              type="text"
              value={feature}
              onChange={(e) => updateFeature(index, e.target.value)}
              className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 text-green-700"
            />
            <button
              type="button"
              onClick={() => removeFeature(index)}
              className="p-2 text-emerald-600 hover:text-[#A0522D] hover:bg-[#FEF5E7] rounded-md transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Add new feature"
            className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 text-green-700 placeholder-gray-400"
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 font-medium"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureManager;