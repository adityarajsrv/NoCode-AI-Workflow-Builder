import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { useCallback, useRef, useState } from "react";
import {
  Grip,
  MessageCircleMore,
  Play,
  SquareMousePointer,
} from "lucide-react";

import UserQueryNode from "./nodes/UserQueryNode";
import KnowledgeBaseNode from "./nodes/KnowledgeBaseNode";
import LLMNode from "./nodes/LLMNode";
import OutputNode from "./nodes/OutputNode";
import ChatPopup from "./ChatPopup";

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const reactFlowWrapper = useRef(null);

  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const handleResetConnections = useCallback(
    (nodeId) => {
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: `${type} Node`,
          onDelete: handleDeleteNode,
          onResetConnections: handleResetConnections,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, handleDeleteNode, handleResetConnections]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="w-full h-full bg-gray-50 relative" ref={reactFlowWrapper}>
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
        <div className="react-flow__controls-bottom-center">
          <Controls />
        </div>
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      {nodes.length === 0 && (
        <div
          className="absolute inset-0 flex flex-col justify-center items-center gap-4 pointer-events-none"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="relative">
            <div className="bg-white p-5 rounded-full shadow-lg">
              <div className="relative w-12 h-12">
                <Grip className="text-green-700 absolute bottom-4.5 right-3 w-8 h-8 opacity-70" />
                <SquareMousePointer className="text-green-700 bg-white absolute top-1/2 left-3/5 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium text-lg">
              Drag & drop to get started
            </p>
          </div>
        </div>
      )}
      
      {/* Build Stack Button with Hover Text */}
      <div className="absolute bottom-18 right-5 flex items-center gap-2">
        {hoveredIcon === 'build' && (
          <div className="bg-white text-black px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap shadow-lg">
            Build Stack
          </div>
        )}
        <div 
          className="bg-green-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow flex items-center justify-center"
          onMouseEnter={() => setHoveredIcon('build')}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <Play className="w-5 h-5" />
        </div>
      </div>
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        {hoveredIcon === 'chat' && (
          <div className="bg-white text-black px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap shadow-lg">
            Chat with Stack
          </div>
        )}
        <div 
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow flex items-center justify-center"
          onClick={() => setIsChatOpen(true)}
          onMouseEnter={() => setHoveredIcon('chat')}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <MessageCircleMore className="w-5 h-5" />
        </div>
      </div>

      <ChatPopup 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      <style>{`
        .react-flow__controls-bottom-center {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }
        
        .react-flow__controls-bottom-center .react-flow__controls {
          position: relative !important;
          bottom: auto !important;
          left: auto !important;
          transform: none !important;
          display: flex !important;
          flex-direction: row !important;
        }
        
        .react-flow__controls-bottom-center .react-flow__controls button {
          transform: none !important;
        }
        
        .react-flow__attribution {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default Workspace;