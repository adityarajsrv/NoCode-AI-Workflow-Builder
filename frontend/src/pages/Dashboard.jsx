import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateStackPopup from '../components/CreateStackPopup';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [stacks, setStacks] = useState([]);
  const navigate = useNavigate(); 

  const handleCreateStack = (stackData) => {
    const newStack = { ...stackData, id: Date.now() };
    setStacks(prev => [...prev, newStack]);
    setIsPopupOpen(false);
    console.log('Creating stack:', stackData);
  };

  const handleEditStack = (stackName) => {
    navigate(`/workflow-builder/${encodeURIComponent(stackName)}`);
  };

  return (
    <div className="w-full h-screen bg-gray-100">
      <Navbar />
      <div className='flex flex-row justify-between px-20 mt-15'>
        <h2 className='text-2xl font-semibold mt-2'>My Stacks</h2>
        <button 
          onClick={() => setIsPopupOpen(true)}
          className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 transition-colors'
        >
          <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New Stack
        </button>
      </div>
      <hr className='w-[89%] mt-3 text-gray-300 ml-20'/>
      {stacks.length === 0 ? (
        <div className='flex flex-row justify-center items-center'>
          <div className='bg-white h-48 w-94 rounded-xl shadow-md mt-25 p-5'>
            <h2 className='text-2xl font-semibold mb-1'>Create New Stack</h2>
            <p className='text-gray-500 py-1 mb-4 w-[90%]'>
              Start building your generative AI apps with our essential tools and frameworks
            </p>
            <button 
              onClick={() => setIsPopupOpen(true)}
              className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 transition-colors'
            >
              <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Stack
            </button>
          </div>
        </div>
      ) : (
        <div className="px-20 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stacks.map((stack) => (
              <div key={stack.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{stack.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{stack.description}</p>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleEditStack(stack.name)}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-4 py-2 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    Edit Stack
                    <svg className="w-4 h-4" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <CreateStackPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onCreate={handleCreateStack}
      />
    </div>
  );
}

export default Dashboard;