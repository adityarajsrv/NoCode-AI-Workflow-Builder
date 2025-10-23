/* eslint-disable react/prop-types */
import { useState } from 'react';

const CreateStackPopup = ({ isOpen, onClose, onCreate }) => {
  const [stackName, setStackName] = useState('');
  const [stackDescription, setStackDescription] = useState('');

  const handleCreate = () => {
    if (stackName.trim()) {
      onCreate({
        name: stackName,
        description: stackDescription
      });
      setStackName('');
      setStackDescription('');
    }
  };

  const handleCancel = () => {
    setStackName('');
    setStackDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-96 p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-2">Create New Stack</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={stackName}
            onChange={(e) => setStackName(e.target.value)}
            placeholder="Chat With PDF"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
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
            className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStackPopup;