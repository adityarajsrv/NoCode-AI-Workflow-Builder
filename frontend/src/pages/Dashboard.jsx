/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateStackPopup from "../components/CreateStackPopup";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [stacks, setStacks] = useState([]);
  const [editingStack, setEditingStack] = useState(null);
  const [isRenamePopupOpen, setIsRenamePopupOpen] = useState(false);
  const [renameData, setRenameData] = useState({ name: '', description: '' });
  const navigate = useNavigate();
  const [userTier, setUserTier] = useState("free");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || '{"tier": "free"}');
    setUser(userData);
    setUserTier(userData.tier);
    
    if (userData && userData.email) {
      const savedStacks = JSON.parse(localStorage.getItem('userWorkflows') || '[]');
      setStacks(savedStacks);
    }
  }, []);

  const isLoggedIn = user && user.email;
  const canCreateMoreWorkflows = userTier === "premium" || stacks.length < 3;

  const handleCreateStack = (stackData) => {
    if (!isLoggedIn) {
      alert("Please login to create stacks!");
      return;
    }

    const newStack = { ...stackData, id: Date.now() };
    const updatedStacks = [...stacks, newStack];
    
    setStacks(updatedStacks);
    localStorage.setItem('userWorkflows', JSON.stringify(updatedStacks));
    
    setIsPopupOpen(false);
  };

  const handleEditStack = (stackName) => {
    if (!isLoggedIn) {
      alert("Please login to edit stacks!");
      return;
    }
    navigate(`/workflow-builder/${encodeURIComponent(stackName)}`);
  };

  const handleRenameStack = (stack) => {
    setEditingStack(stack);
    setRenameData({ name: stack.name, description: stack.description });
    setIsRenamePopupOpen(true);
  };

  const handleUpdateStack = () => {
    if (!renameData.name.trim()) {
      alert("Stack name is required!");
      return;
    }

    const updatedStacks = stacks.map(stack => 
      stack.id === editingStack.id 
        ? { ...stack, name: renameData.name, description: renameData.description }
        : stack
    );
    
    setStacks(updatedStacks);
    localStorage.setItem('userWorkflows', JSON.stringify(updatedStacks));
    setIsRenamePopupOpen(false);
    setEditingStack(null);
    setRenameData({ name: '', description: '' });
  };

  const handleDeleteStack = (stackId) => {
    if (window.confirm("Are you sure you want to delete this stack? This action cannot be undone.")) {
      const updatedStacks = stacks.filter(stack => stack.id !== stackId);
      setStacks(updatedStacks);
      localStorage.setItem('userWorkflows', JSON.stringify(updatedStacks));
    }
  };

  const handleCreateButtonClick = () => {
    if (!isLoggedIn) {
      alert("Please login to create stacks!");
      return;
    }
    
    if (!canCreateMoreWorkflows) {
      alert("🚫 Free tier limited to 3 workflows. Upgrade to Premium!");
      return;
    }
    setIsPopupOpen(true);
  };

  const remainingWorkflows = 3 - stacks.length;

  return (
    <div className="w-full h-screen bg-gray-100">
      <Navbar />
      {userTier === "premium" && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 text-center">
          🚀 Premium Member - Unlimited Workflows Active!
        </div>
      )}
      <div className="flex flex-row justify-between px-20 mt-15">
        <h2 className="text-2xl font-semibold mt-2">My Stacks</h2>
        <button
          onClick={handleCreateButtonClick}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
            : userTier === "premium"
              ? "Create New Stack"
              : `Create Stack (${remainingWorkflows > 0 ? remainingWorkflows : 0} left)`
          }
        </button>
      </div>
      <hr className="w-[89%] mt-3 text-gray-300 ml-20" />
      {!isLoggedIn ? (
        <div className="flex flex-row justify-center items-center">
          <div className="bg-white h-48 w-94 rounded-xl shadow-md mt-25 p-5 text-center">
            <h2 className="text-2xl font-semibold mb-3">Welcome to GenAI Stack</h2>
            <p className="text-gray-500 py-1 mb-4">
              Please login to start building your AI workflows and create amazing stacks!
            </p>
            <button
              onClick={() => {
                const loginButton = document.querySelector('[class*="bg-green-600"]');
                if (loginButton) loginButton.click();
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Login to Get Started
            </button>
          </div>
        </div>
      ) : stacks.length === 0 ? (
        <div className="flex flex-row justify-center items-center">
          <div className="bg-white h-48 w-94 rounded-xl shadow-md mt-25 p-5">
            <h2 className="text-2xl font-semibold mb-1">Create New Stack</h2>
            <p className="text-gray-500 py-1 mb-4 w-[90%]">
              Start building your generative AI apps with our essential tools and frameworks
            </p>
            <button
              onClick={handleCreateButtonClick}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
        <div className="px-20 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stacks.map((stack) => (
              <StackCard 
                key={stack.id}
                stack={stack}
                onEdit={handleEditStack}
                onRename={() => handleRenameStack(stack)}
                onDelete={() => handleDeleteStack(stack.id)}
              />
            ))}
          </div>
          {stacks.length >= 3 && userTier !== "premium" && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🚀 Ready for Unlimited Power?
              </h3>
              <p className="text-yellow-700 mb-4">
                You&apos;ve reached the free tier limit of 3 workflows. Upgrade to Premium for unlimited creations!
              </p>
              <button
                onClick={() => {
                  const premiumButton = document.querySelector('[class*="bg-gradient-to-r from-purple-600"]');
                  if (premiumButton) premiumButton.click();
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all cursor-pointer"
              >
                Upgrade to Premium
              </button>
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-96 p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-2">Rename Stack</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                onClick={() => {
                  setIsRenamePopupOpen(false);
                  setEditingStack(null);
                  setRenameData({ name: '', description: '' });
                }}
                className="cursor-pointer px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStack}
                className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StackCard = ({ stack, onEdit, onRename, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>        
        {isMenuOpen && (
          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-32">
            <button
              onClick={() => {
                onRename();
                setIsMenuOpen(false);
              }}
              className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Rename</span>
            </button>
            <button
              onClick={() => {
                onDelete();
                setIsMenuOpen(false);
              }}
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
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          {stack.name}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {stack.description}
        </p>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => onEdit(stack.name)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-4 py-2 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
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