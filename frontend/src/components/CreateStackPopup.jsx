/* eslint-disable react/prop-types */
import { useState } from 'react';

const CreateStackPopup = ({ isOpen, onClose, onCreate }) => {
  const [stackName, setStackName] = useState('');
  const [stackDescription, setStackDescription] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!stackName.trim()) {
      newErrors.stackName = 'Stack name is required';
    } else if (stackName.trim().length < 2) {
      newErrors.stackName = 'Stack name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateForm()) {
      return;
    }

    onCreate({
      name: stackName.trim(),
      description: stackDescription.trim()
    });
    setStackName('');
    setStackDescription('');
    setErrors({});
  };

  const handleCancel = () => {
    setStackName('');
    setStackDescription('');
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-96 p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Create New Stack</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={stackName}
            onChange={(e) => {
              setStackName(e.target.value);
              if (errors.stackName) {
                setErrors({...errors, stackName: ''});
              }
            }}
            placeholder="Chat With PDF"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.stackName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.stackName && (
            <p className="text-red-500 text-xs mt-1">{errors.stackName}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={stackDescription}
            onChange={(e) => setStackDescription(e.target.value)}
            placeholder="Chat with your pdf notes"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="cursor-pointer px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!stackName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStackPopup;