/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Settings, Eye, Sparkles, Unlink, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import axios from 'axios';

const LLMNode = ({ data, selected, id }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [model, setModel] = useState('Gemini 2.5 Flash-Lite');
  const [apiKey, setApiKey] = useState('');
  const [temperature, setTemperature] = useState(0.75);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [serpApiKey, setSerpApiKey] = useState('');
  const [response, setResponse] = useState('');
  const settingsRef = useRef(null);

  const defaultPrompt = `You are a helpful PDF assistant. Use web search if the PDF lacks context.
CONTEXT: {context}
User Query: {query}`;
  const [prompt, setPrompt] = useState(defaultPrompt);

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

  // Send LLM request when key params change
  useEffect(() => {
    const runLLMQuery = async () => {
      if (!prompt || !apiKey) return;

      try {
        const res = await axios.post('http://localhost:8000/api/llm', {
          prompt,
          temperature,
          api_key: apiKey,
          model,
          use_websearch: useWebSearch,
          serp_api_key: serpApiKey,
        });

        const output = res.data.answer || 'No response received';
        setResponse(output);
        if (data.onOutput) data.onOutput(output);
      } catch (err) {
        console.error('LLM request failed', err);
        setResponse('Error contacting backend');
      }
    };

    runLLMQuery();
  }, [prompt, apiKey, temperature, model, useWebSearch, serpApiKey]);

  return (
    <div className={`shadow-lg rounded-lg bg-white min-w-90 ${selected ? 'ring-2 ring-gray-300' : ''}`}>
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
      <Handle id="query-input" type="target" position={Position.Left} className="w-3 h-3 mt-37 p-0.75 !bg-purple-700" style={{ top: '30%' }} />
      <Handle id="context-input" type="target" position={Position.Left} className="w-3 h-3 mt-11 p-0.75 !bg-purple-700" style={{ top: '50%' }} />

      <div className="px-5 py-3 flex items-center justify-between gap-3 border-b-3 border-gray-200">
        <div className='flex items-center gap-3'>
          <Sparkles className="w-6 h-6 text-gray-600" />
          <h2 className="font-semibold text-gray-800 text-lg">LLM (Gemini)</h2>
        </div>
        <button className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-colors ${showSettings ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`} onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 py-2 text-sm text-gray-600 bg-blue-100">Run a query with Google Gemini LLM</div>

      <div className="space-y-3 px-5 py-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option>Gemini 2.5 Flash-Lite</option>
            <option>Gemini 2.5 Flash</option>
            <option>Gemini 2.5 Pro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="**********"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm min-h-[85px] max-h-[120px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Web Search toggle */}
        <div className="flex items-center justify-between">
          <label className="text-md font-medium text-gray-700 mt-2">WebSearch Tool</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={useWebSearch} onChange={() => setUseWebSearch(!useWebSearch)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>

        <hr className='text-gray-400' />

        {/* Serp API */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SERP API</label>
          <input
            type="password"
            value={serpApiKey}
            onChange={(e) => setSerpApiKey(e.target.value)}
            placeholder="***************"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <h3 className="flex justify-end text-sm mr-2 pb-5">Output</h3>
      <Handle type="source" position={Position.Right} className="w-3 h-3 mt-71 p-0.75 !bg-purple-700" style={{ top: '50%' }} />
    </div>
  );
};

export default LLMNode;
