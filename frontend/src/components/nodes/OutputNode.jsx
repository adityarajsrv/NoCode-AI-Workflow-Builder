import { Handle, Position } from 'reactflow';

const OutputNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-l-4 border-orange-500 min-w-48 ${selected ? 'ring-2 ring-orange-300' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500"
      />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Output</div>
          <div className="text-xs text-gray-500">Final response</div>
        </div>
      </div>
    </div>
  );
};

export default OutputNode;