import logo from '../assets/logo.png';
import { useState, useEffect, useRef } from "react";
import LoginPopup from './LoginPopup';

const Navbar = () => {
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthPopupOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
  };

  const getInitials = (user) => {
    if (user.profile.firstName && user.profile.lastName) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase();
    }
    return user.username ? user.username[0].toUpperCase() : 'U';
  };

  return (
    <div>
      <div className="h-16 flex flex-row justify-between px-6 py-2 bg-white shadow-md">
        <div className='flex flex-row space-x-3 items-center'>
          <img src={logo} alt="" className='h-10 w-10'/>
          <h1 className='font-semibold text-xl text-gray-900'>GenAI Stack</h1>
        </div>
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="cursor-pointer flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user.profile.profileImage ? (
                <img 
                  src={user.profile.profileImage} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getInitials(user)}
                  </span>
                </div>
              )}
              <span className="text-gray-700 font-medium hidden sm:block">
                {user.profile.firstName || user.username}
              </span>
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.profile.firstName} {user.profile.lastName}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                  }}
                  className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Profile
                </button>
                
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                  }}
                  className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Settings
                </button>
                <div className="border-t border-gray-100 mt-1">
                  <button 
                    onClick={handleLogout}
                    className="cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setIsAuthPopupOpen(true)}
            className='text-lg border rounded-full bg-green-600 hover:bg-green-700 text-white px-4 cursor-pointer transition-colors font-medium'
          >
            Login
          </button>
        )}
      </div>
      <LoginPopup
        isOpen={isAuthPopupOpen}
        onClose={() => setIsAuthPopupOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Navbar;