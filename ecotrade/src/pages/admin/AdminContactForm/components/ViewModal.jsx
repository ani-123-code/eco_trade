import React from 'react';
import { X, User, Mail, Phone } from 'lucide-react';
import { formatDate, getStatusColor, getPriorityColor, getDepartmentColor } from '../../../../utils/helpers';

const ViewModal = ({ submission, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Submission Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{submission.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 break-all">{submission.email}</span>
                  </div>
                  {submission.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{submission.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Submission Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Subject:</span>
                    <p className="text-sm text-gray-900 mt-1 break-words">{submission.subject}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Department:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(submission.department)}`}>
                      {submission.department || 'general'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Submitted:</span>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(submission.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Status & Priority</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                      {submission.status || 'pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Priority:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(submission.priority)}`}>
                      {submission.priority || 'medium'}
                    </span>
                  </div>
                </div>
              </div>

              {submission.adminNotes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Admin Notes</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                    {submission.adminNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Message</h3>
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
              <p className="text-sm text-gray-900 break-words">{submission.message}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              style={{ backgroundColor: '#2A4365' }}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
            >
              Edit Submission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;