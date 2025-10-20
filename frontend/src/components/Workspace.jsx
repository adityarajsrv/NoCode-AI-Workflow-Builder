import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback, useRef } from 'react';

import UserQueryNode from './nodes/UserQueryNode';
import KnowledgeBaseNode from './nodes/KnowledgeBaseNode';
import LLMNode from './nodes/LLMNode';
import OutputNode from './nodes/OutputNode';

const nodeTypes = {
  userQuery: UserQueryNode,
  knowledgeBase: KnowledgeBaseNode,
  llm: LLMNode,
  output: OutputNode,
};

const initialNodes = [];
const initialEdges = [];

const Workspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // This function handles when a component is dropped onto the workspace
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      // Get the React Flow bounds to calculate position
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      
      // Get the node type that was dragged (stored in dataTransfer)
      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Calculate position where the node should be placed
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      // Create a new node with unique ID and position
      const newNode = {
        id: `${type}-${Date.now()}`, // Unique ID
        type, // Node type (userQuery, llm, etc.)
        position,
        data: { 
          label: `${type} Node`,
          // You can add more data properties here for configuration
        },
      };

      // Add the new node to our nodes state
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  // This allows the drop to happen
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="w-full h-full bg-gray-50 relative" ref={reactFlowWrapper}>
      {nodes.length === 0 ? (
        // Empty state
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">GenAI Stack</h2>
            <p className="text-gray-600 mb-8">Drag & drop to get started</p>
            
            {/* Component preview */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="flex gap-4">
                <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-l-4 border-blue-500 min-w-48">
                  <div className="font-semibold text-gray-800">Input</div>
                  <div className="text-xs text-gray-500">User Query Component</div>
                </div>
                <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-l-4 border-purple-500 min-w-48">
                  <div className="font-semibold text-gray-800">LLM (OpenAI)</div>
                  <div className="text-xs text-gray-500">AI model processing</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-l-4 border-green-500 min-w-48">
                  <div className="font-semibold text-gray-800">Knowledge Base</div>
                  <div className="text-xs text-gray-500">Document processing</div>
                </div>
                <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-l-4 border-orange-500 min-w-48">
                  <div className="font-semibold text-gray-800">Output</div>
                  <div className="text-xs text-gray-500">Final response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // React Flow when nodes exist
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      )}
    </div>
  );
};

export default Workspace;