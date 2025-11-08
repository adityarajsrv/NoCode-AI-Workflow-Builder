/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { Settings, Eye, Sparkles, Unlink, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Handle, Position } from "reactflow";
import axios from "axios";

const LLMNode = ({ data, selected, id }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    model: "gemini-2.5-flash",
    apiKey: "",
    temperature: 0.75,
    useWebSearch: false,
    serpApiKey: "",
    additionalPrompt: "",
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSerpKey, setShowSerpKey] = useState(false);
  const settingsRef = useRef(null);

  const { context: inputContext = "", query: inputQuery = "" } =
    data.inputs || {};

  const fixedTemplate = `You are a helpful PDF assistant. Use web search if the PDF lacks context.

CONTEXT: {context}
USER QUERY: {query}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update the node configuration when changes happen
  useEffect(() => {
    if (data.onConfigUpdate) {
      data.onConfigUpdate(id, config);
    }
  }, [config, data.onConfigUpdate, id]);

  const handleDeleteNode = () => {
    if (data.onDelete) data.onDelete(id);
    setShowSettings(false);
  };

  const handleResetConnections = () => {
    if (data.onResetConnections) data.onResetConnections(id);
    setShowSettings(false);
  };

  useEffect(() => {
    if (data.inputs && data.inputs.query) {
      runLLMQuery(data.inputs.query, data.inputs.context);
    }
  }, [data.inputs]);

  const runLLMQuery = async (query, context = "") => {
    if (!query || !config.apiKey) {
      console.log("Missing query or API key");
      return;
    }

    const fullTemplate =
      fixedTemplate +
      (config.additionalPrompt.trim() ? `\n\n${config.additionalPrompt}` : "");
    const processedPrompt = fullTemplate
      .replace("{context}", context)
      .replace("{query}", query);

    try {
      console.log("Sending LLM request with:", {
        prompt: processedPrompt,
        temperature: config.temperature,
        api_key: config.apiKey,
        model: config.model,
        use_websearch: config.useWebSearch,
        serp_api_key: config.serpApiKey,
      });

      const res = await axios.post("https://flowmind-ai-82ug.onrender.com/api/llm/", {
        prompt: processedPrompt,
        temperature: config.temperature,
        api_key: config.apiKey,
        model: config.model,
        use_websearch: config.useWebSearch,
        serp_api_key: config.serpApiKey,
      });

      const output = res.data.reply || "No response received";
      if (data.onOutput) data.onOutput(output);
    } catch (err) {
      console.error("LLM request failed", err);
      if (err.response) {
        console.error("Response error:", err.response.data);
      } else {
        console.error("Connection error");
      }
    }
  };

  const modelOptions = [
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Most Advanced)" },
    {
      value: "gemini-2.5-flash",
      label: "Gemini 2.5 Flash (Fast & Intelligent)",
    },
    {
      value: "gemini-2.5-flash-lite",
      label: "Gemini 2.5 Flash-Lite (Ultra Fast)",
    },
  ];

  const toggleApiKeyVisibility = () => setShowApiKey(!showApiKey);
  const toggleSerpKeyVisibility = () => setShowSerpKey(!showSerpKey);

  const updateModel = (model) => setConfig((prev) => ({ ...prev, model }));
  const updateApiKey = (apiKey) => setConfig((prev) => ({ ...prev, apiKey }));
  const updateUseWebSearch = (useWebSearch) =>
    setConfig((prev) => ({ ...prev, useWebSearch }));
  const updateSerpApiKey = (serpApiKey) =>
    setConfig((prev) => ({ ...prev, serpApiKey }));
  const updateAdditionalPrompt = (additionalPrompt) =>
    setConfig((prev) => ({ ...prev, additionalPrompt }));

  return (
    <div
      className={`shadow-lg rounded-lg bg-white max-w-110 ${
        selected ? "ring-2 ring-gray-300" : ""
      }`}
    >
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
        id="context-input"
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-purple-700"
        style={{ top: "53%" }}
        onConnect={(params) => console.log("Context connected:", params)}
      />
      <Handle
        id="query-input"
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-purple-700"
        style={{ top: "56%" }}
        onConnect={(params) => console.log("Query connected:", params)}
      />

      <div className="px-5 py-3 flex items-center justify-between gap-3 border-b-3 border-gray-200">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-gray-600" />
          <h2 className="font-semibold text-gray-800 text-lg">LLM (Gemini)</h2>
        </div>
        <button
          className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
            showSettings
              ? "bg-gray-100 text-blue-600"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 py-2 text-sm text-gray-600 bg-blue-100">
        Run a query with Gemini AI LLM
      </div>

      <div className="space-y-3 px-5 py-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            value={config.model}
            onChange={(e) => updateModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={config.apiKey}
              onChange={(e) => updateApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={toggleApiKeyVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prompt
          </label>
          <div
            className="p-3 border border-gray-300 rounded-md bg-gray-50 text-sm leading-relaxed mb-2"
            style={{ marginTop: "1rem" }}
          >
            <p>
              You are a helpful PDF assistant. Use web search if the PDF lacks
              context.
            </p>
            <p className="mt-1" style={{ marginLeft: "0.5rem" }}>
              CONTEXT: {inputContext}
            </p>
            <p style={{ marginLeft: "0.5rem" }}>USER QUERY: {inputQuery}</p>
          </div>
          <label className="block text-sm font-medium text-gray-500">
            Additional Instructions (optional)
          </label>
          <textarea
            value={config.additionalPrompt}
            onChange={(e) => updateAdditionalPrompt(e.target.value)}
            placeholder="Enter any additional instructions here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <label className="text-sm font-medium text-gray-700">
            WebSearch Tool
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.useWebSearch}
              onChange={(e) => updateUseWebSearch(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>

        <hr className="my-2 border-gray-300" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SERP API
          </label>
          <div className="relative">
            <input
              type={showSerpKey ? "text" : "password"}
              value={config.serpApiKey}
              onChange={(e) => updateSerpApiKey(e.target.value)}
              disabled={!config.useWebSearch}
              placeholder="Enter your SerpAPI key for web search"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={toggleSerpKeyVisibility}
              disabled={!config.useWebSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end text-sm mr-2 py-3 text-gray-600">
        Output
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 mt-80 !bg-purple-700"
      />
    </div>
  );
};

export default LLMNode;
