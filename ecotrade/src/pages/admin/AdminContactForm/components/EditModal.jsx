import React from 'react';
import { X } from 'lucide-react';
import CustomSelect from '../../../../components/ui/CustomSelect';

const EditModal = ({ submission, editForm, setEditForm, onClose, onSave }) => {
  const primaryColor = '#2A4365';
  
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const departmentOptions = [
    { value: 'general', label: 'General' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Support' },
    { value: 'warranty', label: 'Warranty' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'partnership', label: 'Partnership' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Submission</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <CustomSelect
              value={editForm.status}
              onChange={(value) => setEditForm({ ...editForm, status: value })}
              options={statusOptions}
              placeholder="Select status"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <CustomSelect
              value={editForm.priority}
              onChange={(value) => setEditForm({ ...editForm, priority: value })}
              options={priorityOptions}
              placeholder="Select priority"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <CustomSelect
              value={editForm.department}
              onChange={(value) => setEditForm({ ...editForm, department: value })}
              options={departmentOptions}
              placeholder="Select department"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{
                '--tw-ring-color': primaryColor,
                focusRingColor: primaryColor
              }}
              rows="4"
              value={editForm.adminNotes}
              onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
              placeholder="Add admin notes..."
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

          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              style={{ backgroundColor: primaryColor }}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;