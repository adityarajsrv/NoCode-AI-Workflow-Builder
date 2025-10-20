import { Handle, Position } from 'reactflow';

const KnowledgeBaseNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-l-4 border-green-500 min-w-48 ${selected ? 'ring-2 ring-green-300' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500"
      />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Knowledge Base</div>
          <div className="text-xs text-gray-500">Document processing</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500"
      />
    </div>
  );
};

export default KnowledgeBaseNode;