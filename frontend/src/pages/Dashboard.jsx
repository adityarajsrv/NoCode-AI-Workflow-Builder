/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateStackPopup from "../components/CreateStackPopup";
import Navbar from "../components/Navbar";
import { stackAPI } from "../../../backend/auth/utils/api";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [stacks, setStacks] = useState([]);
  const [editingStack, setEditingStack] = useState(null);
  const [isRenamePopupOpen, setIsRenamePopupOpen] = useState(false);
  const [renameData, setRenameData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || '{}');
    setUser(userData);
    loadStacks();
  }, []);

  const loadStacks = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = JSON.parse(localStorage.getItem("user") || '{}');
      
      if (userData && userData.token) {
        const stacksData = await stackAPI.getStacks();
        setStacks(stacksData || []);
      }
    } catch {
      setError('Failed to load stacks. Please try again.');
      setStacks([]);
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = user && user.token;
  const userStacks = stacks || [];
  const canCreateMoreStacks = userStacks.length < 3;

  const handleCreateStack = async (stackData) => {
    if (!isLoggedIn) {
      toast.error("Please login to create stacks!");
      return;
    }

    try {
      const newStack = await stackAPI.createStack(stackData);
      setStacks(prev => [...prev, newStack]);
      setIsPopupOpen(false);
      toast.success("Stack created successfully!");
    } catch (err) {
      toast.error(err.message || 'Failed to create stack');
    }
  };

  const handleEditStack = (stackName) => {
    if (!isLoggedIn) {
      toast.error("Please login to edit stacks!");
      return;
    }
    navigate(`/workflow-builder/${encodeURIComponent(stackName)}`);
  };

  const handleRenameStack = (stack) => {
    setEditingStack(stack);
    setRenameData({ 
      name: stack.name, 
      description: stack.description || '' 
    });
    setIsRenamePopupOpen(true);
  };

  const handleUpdateStack = async () => {
    if (!renameData.name.trim()) {
      toast.error("Stack name is required!");
      return;
    }

    try {
      const updatedStack = await stackAPI.updateStack(editingStack._id, renameData);
      setStacks(prev => prev.map(stack => 
        stack._id === editingStack._id ? updatedStack : stack
      ));
      setIsRenamePopupOpen(false);
      setEditingStack(null);
      setRenameData({ name: '', description: '' });
      toast.success("Stack updated successfully!");
    } catch (err) {
      toast.error(err.message || 'Failed to update stack');
    }
  };

  const handleDeleteStack = async (stackId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this stack? This action cannot be undone.");
    
    if (confirmDelete) {
      try {
        await stackAPI.deleteStack(stackId);
        setStacks(prev => prev.filter(stack => stack._id !== stackId));
        toast.success("Stack deleted successfully!");
      } catch (err) {
        toast.error(err.message || 'Failed to delete stack');
      }
    }
  };

  const handleCreateButtonClick = () => {
    if (!isLoggedIn) {
      toast.error("Please login to create stacks!");
      return;
    }
    
    if (!canCreateMoreStacks) {
      toast.warning("🚫 Free tier limited to 3 stacks. Upgrade to Premium!");
      return;
    }
    setIsPopupOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your stacks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-100">
      <Navbar />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-center">
          {error}
        </div>
      )}
      
      <div className="flex flex-row justify-between px-6 md:px-20 mt-8 md:mt-15">
        <h2 className="text-xl md:text-2xl font-semibold mt-2">My Stacks</h2>
        <button
          onClick={handleCreateButtonClick}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 transition-colors text-sm md:text-base"
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {!isLoggedIn 
            ? "Login to Create" 
            : "Create Stack"
          }
        </button>
      </div>
      
      <hr className="w-full md:w-[89%] mt-3 text-gray-300 mx-auto" />
      
      {!isLoggedIn ? (
        <div className="flex flex-row justify-center items-center px-4">
          <div className="bg-white h-48 w-full max-w-md rounded-xl shadow-md mt-20 p-6 text-center">
            <h2 className="text-2xl font-semibold mb-3">Welcome to GenAI Stack</h2>
            <p className="text-gray-500 py-1 mb-4">
              Please login to start building your AI workflows and create amazing stacks!
            </p>
            <button
              onClick={() => {
                const loginButton = document.querySelector('[class*="bg-green-600"]');
                if (loginButton) loginButton.click();
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Login to Get Started
            </button>
          </div>
        </div>
      ) : userStacks.length === 0 ? (
        <div className="flex flex-row justify-center items-center px-4">
          <div className="bg-white h-48 w-full max-w-md rounded-xl shadow-md mt-20 p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-1">Create New Stack</h2>
            <p className="text-gray-500 py-1 mb-4">
              Start building your generative AI apps with our essential tools and frameworks
            </p>
            <button
              onClick={handleCreateButtonClick}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 transition-colors"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                strokeWidth={1.5}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              New Stack
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 md:px-20 mt-6 md:mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {userStacks.map((stack) => (
              <StackCard 
                key={stack._id}
                stack={stack}
                onEdit={handleEditStack}
                onRename={() => handleRenameStack(stack)}
                onDelete={() => handleDeleteStack(stack._id)}
              />
            ))}
          </div>
          
          {userStacks.length >= 3 && (
            <div className="mt-6 md:mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 md:p-6 text-center mx-4 md:mx-0">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🚀 Ready for Unlimited Power?
              </h3>
              <p className="text-yellow-700 mb-4 text-sm md:text-base">
                You&apos;ve reached the free tier limit of 3 stacks. Upgrade to Premium for unlimited creations!
              </p>
            </div>
          )}
        </div>
      )}
      
      <CreateStackPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onCreate={handleCreateStack}
      />
      
      {isRenamePopupOpen && (
        <RenameStackPopup
          renameData={renameData}
          setRenameData={setRenameData}
          onUpdate={handleUpdateStack}
          onClose={() => {
            setIsRenamePopupOpen(false);
            setEditingStack(null);
            setRenameData({ name: '', description: '' });
          }}
        />
      )}
    </div>
  );
};

const RenameStackPopup = ({ renameData, setRenameData, onUpdate, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Rename Stack</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={renameData.name}
            onChange={(e) => setRenameData({...renameData, name: e.target.value})}
            placeholder="Chat With PDF"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={renameData.description}
            onChange={(e) => setRenameData({...renameData, description: e.target.value})}
            placeholder="Chat with your pdf notes"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onUpdate}
            className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!renameData.name.trim()}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

const StackCard = ({ stack, onEdit, onRename, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(stack.name);
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    onRename();
    setIsMenuOpen(false);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  const createdDate = new Date(stack.createdAt).toLocaleDateString();

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow relative">
      <div className="absolute top-3 right-3 md:top-4 md:right-4">
        <button
          onClick={handleMenuToggle}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        
        {isMenuOpen && (
          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-32">
            <button
              onClick={handleRenameClick}
              className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Rename</span>
            </button>
            
            <button
              onClick={handleDeleteClick}
              className="cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-800 line-clamp-2">
          {stack.name}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {stack.description || "No description provided"}
        </p>
        
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Created {createdDate}</span>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleEditClick}
          className="cursor-pointer flex items-center gap-2 text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-3 py-2 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-sm"
        >
          Edit Stack
          <svg
            className="w-4 h-4"
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;