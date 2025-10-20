import { Handle, Position } from 'reactflow';

const SimpleNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-300">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
      />
      <div className="font-semibold">{data.label}</div>
      <div className="text-xs text-gray-500">Simple node</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
      />
    </div>
  );
};

export default SimpleNode;