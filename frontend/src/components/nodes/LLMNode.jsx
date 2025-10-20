import { Handle, Position } from 'reactflow';

const LLMNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-l-4 border-purple-500 min-w-48 ${selected ? 'ring-2 ring-purple-300' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500"
      />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-gray-800">LLM (OpenAI)</div>
          <div className="text-xs text-gray-500">AI model processing</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-purple-500"
      />
    </div>
  );
};

export default LLMNode;