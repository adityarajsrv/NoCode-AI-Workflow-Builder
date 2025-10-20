/* eslint-disable react/prop-types */
import { Settings, Eye, Sparkles, Unlink, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';

const LLMNode = ({ data, selected, id }) => {
  const [showSettings, setShowSettings] = useState(false);
    const settingsRef = useRef(null);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target)) {
          setShowSettings(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    const handleDeleteNode = () => {
      if (data.onDelete) {
        data.onDelete(id);
      }
      setShowSettings(false);
    };
  
    const handleResetConnections = () => {
      if (data.onResetConnections) {
        data.onResetConnections(id);
      }
      setShowSettings(false);
    };
  return (
    <div className={`shadow-lg rounded-lg bg-white max-w-100 ${selected ? 'ring-2 ring-gray-300' : ''}`}>
      {showSettings && (
        <div 
          ref={settingsRef}
          className="absolute right-2 top-12 bg-white rounded-lg shadow-xl border border-gray-200 z-10 min-w-48"
        >
          <div className="p-1">
            <button
              onClick={handleResetConnections}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Unlink className="w-4 h-4 text-orange-600" />
              <span>Reset Connections</span>
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              onClick={handleDeleteNode}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Node</span>
            </button>
          </div>
        </div>
      )}
      <Handle
        id="query-input"
        type="target"
        position={Position.Left}
        className="w-3 h-3 mt-37 p-0.75 !bg-purple-700"
        style={{ top: '30%' }}
      />
      <Handle
        id="context-input" 
        type="target"
        position={Position.Left}
        className="w-3 h-3 mt-11 p-0.75 !bg-purple-700"
        style={{ top: '50%' }}
      /> 
      <div className="px-5 py-3 flex items-center justify-between gap-3 border-b-3 border-gray-200">
        <div className='flex items-center gap-3'>
          <Sparkles className="w-6 h-6 text-gray-600" />
          <h2 className="font-semibold text-gray-800 text-lg">LLM (Gemini)</h2>
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
      <div className="px-5 py-2 text-sm text-gray-600 bg-blue-100">Run a query with Google Gemini LLM</div>
      <div className="space-y-3 px-5 py-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option className='text-sm'>Gemini 2.5 Flash-Lite</option>
            <option className='text-sm'>Gemini 2.5 Flash</option>
            <option className='text-sm'>Gemini 2.5 Pro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <div className="relative">
            <input 
              type="password"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="**********"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
          <div
            contentEditable={true}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[80px] max-h-[120px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            suppressContentEditableWarning={true}
            dangerouslySetInnerHTML={{
              __html: `
                You are a helpful PDF assistant. Use web search if the PDF lacks context<br>
                <span className="inline-block px-2 py-1 mr-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                  CONTEXT: {context}
                </span><br>
                <span className="inline-block px-2 py-1 mr-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                  User Query: {query}
                </span>
              `
            }}
          />
          <input type="hidden" name="prompt" value="You are a helpful PDF assistant. Use web search if the PDF lacks context CONTEXT: {context}\nUser Query: {query}" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
          <input 
            type="number"
            min="0"
            max="1"
            step="0.1"
            defaultValue="0.75"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-md font-medium text-gray-700 mt-2">WebSearch Tool</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
        <hr className='text-gray-400'/>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SERF API</label>
          <div className="relative">
            <input 
              type="password"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="***************"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <h3 className="flex justify-end text-sm mr-2 pb-5">Output</h3>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 mt-71 p-0.75 !bg-purple-700"
        style={{ top: '50%' }}
      />
    </div>
  );
};

export default LLMNode;