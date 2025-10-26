import logo from '../assets/logo.png';
import { useState } from "react";
import LoginPopup from './LoginPopup';

const Navbar = () => {
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);

  return (
    <div>
      <div className="h-13 flex flex-row justify-between px-6 py-1 bg-white shadow-md">
        <div className='flex flex-row space-x-1'>
          <img src={logo} alt="" className='h-11 w-11 mt-0.5'/>
          <h1 className='font-semibold text-xl mt-2'>GenAI Stack</h1>
        </div>
        <button 
          onClick={() => setIsAuthPopupOpen(true)}
          className='text-lg border rounded-full bg-green-600 hover:bg-green-700 text-white px-4 cursor-pointer'
        >
          Login
        </button>
      </div>
      <LoginPopup
        isOpen={isAuthPopupOpen}
        onClose={() => setIsAuthPopupOpen(false)}
      />
    </div>
  );
};

export default Navbar;