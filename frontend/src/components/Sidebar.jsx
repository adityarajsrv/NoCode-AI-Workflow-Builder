const Sidebar = () => {
  // This function is called when drag starts
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white shadow-md h-full w-64 p-5 mt-0.5">
      {/* Chat With AI Button (not draggable) */}
      <button className="flex items-center justify-between w-full text-gray-700 bg-gray-100 hover:text-gray-800 font-medium border border-gray-300 px-4 py-2 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          Chat With AI
        </div>
        <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <h2 className="p-1 mt-3 text-md text-gray-800 font-semibold">Components</h2>
      
      {/* Draggable Input Component */}
      <div
        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-4 py-3 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-2 cursor-grab active:cursor-grabbing"
        onDragStart={(event) => onDragStart(event, 'userQuery')}
        draggable
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          Input
        </div>
        <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>

      {/* Draggable LLM Component */}
      <div
        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-4 py-3 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-2 cursor-grab active:cursor-grabbing"
        onDragStart={(event) => onDragStart(event, 'llm')}
        draggable
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          LLM (OpenAI)
        </div>
        <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>

      {/* Draggable Knowledge Base Component */}
      <div
        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-4 py-3 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-2 cursor-grab active:cursor-grabbing"
        onDragStart={(event) => onDragStart(event, 'knowledgeBase')}
        draggable
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          Knowledge Base
        </div>
        <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>

      {/* Draggable Output Component */}
      <div
        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-800 font-medium border border-gray-300 px-4 py-3 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-grab active:cursor-grabbing"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
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