/* eslint-disable react/prop-types */
import { BookOpen, FileInput, FileOutput, Sparkles } from "lucide-react";

const Sidebar = ({ stackName }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white shadow-md h-full p-5 mt-0.5">
      <button className="flex items-center justify-between w-full text-gray-700 bg-gray-100 hover:text-gray-800 font-medium border border-gray-300 px-4 py-2 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          <p className="text-sm text-gray-700">{stackName}</p>
        </div>
        <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <h2 className="p-1 mt-3 text-md text-gray-800 font-semibold">Components</h2>
      <div
        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-4 py-3 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-2 cursor-grab active:cursor-grabbing"
        onDragStart={(event) => onDragStart(event, 'userQuery')}
        draggable
      >
        <div className="flex items-center gap-2">
          <FileInput />
          Input
        </div>
        <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>
      <div
        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-4 py-3 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-2 cursor-grab active:cursor-grabbing"
        onDragStart={(event) => onDragStart(event, 'llm')}
        draggable
      >
        <div className="flex items-center gap-2">
          <Sparkles />
          LLM (Gemini)
        </div>
        <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>
      <div
        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-4 py-3 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-2 cursor-grab active:cursor-grabbing"
        onDragStart={(event) => onDragStart(event, 'knowledgeBase')}
        draggable
      >
        <div className="flex items-center gap-2">
          <BookOpen />
          Knowledge Base
        </div>
        <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>
      <div
        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-4 py-3 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-grab active:cursor-grabbing"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        <div className="flex items-center gap-2">
          <FileOutput />
          Output
        </div>
        <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>
    </div>
  );
};

export default Sidebar;