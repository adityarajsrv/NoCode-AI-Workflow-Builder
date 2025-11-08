/* eslint-disable react/prop-types */
import { FileInput, Settings, Trash2, Unlink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';

const UserQueryNode = ({ data, selected, id }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [query, setQuery] = useState(data.query || '');
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteNode = () => { if (data.onDelete) data.onDelete(id); setShowSettings(false); };
  const handleResetConnections = () => { if (data.onResetConnections) data.onResetConnections(id); setShowSettings(false); };

  const handleQueryChange = (newQuery) => {
    setQuery(newQuery);
    if (data.onNodeResultUpdate) {
      data.onNodeResultUpdate(id, {
        type: 'userQuery',
        data: newQuery,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className={`shadow-lg rounded-lg bg-white min-w-80 ${selected ? 'ring-2 ring-gray-300' : ''}`}>
      {showSettings && (
        <div ref={settingsRef} className="absolute right-2 top-12 bg-white rounded-lg shadow-xl border border-gray-200 z-10 min-w-48">
          <div className="p-1">
            <button onClick={handleResetConnections} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <Unlink className="w-4 h-4 text-orange-600" />
              <span>Reset Connections</span>
            </button>
            <hr className="my-1 border-gray-200" />
            <button onClick={handleDeleteNode} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <Trash2 className="w-4 h-4" />
              <span>Delete Node</span>
            </button>
          </div>
        </div>
      )}

      <div className="px-5 py-3 flex items-center justify-between gap-3 border-b-3 border-gray-200">
        <div className="flex items-center gap-3">
          <FileInput className="w-6 h-6 text-gray-600" />
          <h2 className="font-semibold text-gray-800 text-lg">User Query</h2>
        </div>
        <button
          className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
            showSettings ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
          }`}
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 py-2 text-sm text-gray-600 bg-blue-100">Start your workflow with a query</div>

      <div className="space-y-3 px-5 py-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Enter your query</label>
        <textarea
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[80px] max-h-[120px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          placeholder="Ask a question to start the workflow..."
        />
      </div>

      <h3 className="flex justify-end text-sm mr-2 pb-5">Query Input</h3>
      <Handle type="source" position={Position.Right} className="w-3 h-3 mt-28 p-0.75 !bg-purple-700" />
    </div>
  );
};

export default UserQueryNode;