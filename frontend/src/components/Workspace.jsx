/* eslint-disable react-hooks/exhaustive-deps */
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Grip,
  MessageCircleMore,
  Play,
  SquareMousePointer,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Rocket,
  Bot,
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

import UserQueryNode from "./nodes/UserQueryNode";
import KnowledgeBaseNode from "./nodes/KnowledgeBaseNode";
import LLMNode from "./nodes/LLMNode";
import OutputNode from "./nodes/OutputNode";
import ChatPopup from "./ChatPopup";
import axios from "axios";

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
  const [nodeResults, setNodeResults] = useState({}); 
  const reactFlowWrapper = useRef(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isChatIconHighlighted, setIsChatIconHighlighted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setNodeResults((prev) => {
        const newResults = { ...prev };
        delete newResults[nodeId];
        return newResults;
      });
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
          nodeResults: nodeResults,
          onNodeResultUpdate: (nodeId, result) => {
            setNodeResults((prev) => ({
              ...prev,
              [nodeId]: result,
            }));
          },
          onConfigUpdate: (nodeId, config) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, config } }
                  : node
              )
            );
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, handleDeleteNode, handleResetConnections, nodeResults]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleBuildStack = async () => {
    if (nodes.length === 0) {
      toast.error('Please add nodes to build a workflow', {
        icon: '⚠️',
        style: {
          background: '#fef3f2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
        }
      });
      return;
    }

    try {
      setIsBuilding(true);
      
      const buildingToast = toast.loading(
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <div>
            <p className="font-semibold text-gray-800">Building AI Workflow</p>
            <p className="text-sm text-gray-600">Validating nodes and preparing pipeline...</p>
          </div>
        </div>,
        {
          duration: Infinity,
          style: {
            background: '#f0f9ff',
            color: '#0369a1',
            border: '1px solid #bae6fd',
            minWidth: '320px',
          }
        }
      );

      console.log("🏗️ Building and testing workflow...");

      const userQueryNode = nodes.find((node) => node.type === "userQuery");
      let testQuery = "What is machine learning?"; 

      if (userQueryNode && nodeResults[userQueryNode.id]?.data) {
        testQuery = nodeResults[userQueryNode.id].data;
      }

      const buildResponse = await axios.post(
        "http://localhost:8000/api/workflows/build",
        {
          workflow: {
            nodes: nodes.map((node) => ({
              id: node.id,
              type: node.type,
              data: {
                ...node.data,
                config: node.data.config || {},
              },
            })),
            edges: edges,
          },
        }
      );

      console.log("✅ Workflow built successfully:", buildResponse.data);

      toast.success(
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-gray-800">Workflow Built!</p>
          </div>
        </div>,
        {
          id: buildingToast,
          duration: 3000,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            minWidth: '320px',
          }
        }
      );

      const runResponse = await axios.post(
        "http://localhost:8000/api/workflows/run",
        {
          workflow: {
            nodes: nodes.map((node) => ({
              id: node.id,
              type: node.type,
              data: {
                ...node.data,
                config: node.data.config || {},
              },
            })),
            edges: edges,
          },
          query: testQuery,
          session_id: `session_${Date.now()}`,
        }
      );

      console.log("✅ Workflow test results:", runResponse.data);

      if (runResponse.data.node_results) {
        setNodeResults(runResponse.data.node_results);

        const testConversation = {
          query: testQuery,
          response: runResponse.data.final_output,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        };
        
        const existingTests = JSON.parse(localStorage.getItem('workflowTestHistory') || '[]');
        const updatedTests = [...existingTests, testConversation].slice(-10); // Keep last 10 tests
        localStorage.setItem('workflowTestHistory', JSON.stringify(updatedTests));

        setConversationHistory(updatedTests);

        toast.success(
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-semibold text-gray-800">Your stack workflow is ready! 🎉</p>
              <p className="text-sm text-gray-600">Click the chat icon to continue exploring</p>
            </div>
          </div>,
          {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              minWidth: '320px',
            }
          }
        );
        
        showChatNotification();
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            data: {
              ...node.data,
              nodeResults: runResponse.data.node_results,
              conversationHistory: updatedTests,
              onNodeResultUpdate: (nodeId, result) => {
                setNodeResults((prev) => ({
                  ...prev,
                  [nodeId]: result,
                }));
              },
              onConfigUpdate: (nodeId, config) => {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === nodeId ? { ...n, data: { ...n.data, config } } : n
                  )
                );
              },
            },
          }))
        );
      }

    } catch (error) {
      console.error("❌ Workflow build/test failed:", error);
      
      toast.error(
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-semibold text-gray-800">Build Failed</p>
            <p className="text-sm text-gray-600">
              {error.response?.data?.detail || error.message}
            </p>
          </div>
        </div>,
        {
          duration: 6000,
          style: {
            background: '#fef3f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            minWidth: '320px',
          }
        }
      );
    } finally {
      setIsBuilding(false);
    }
  };

  const showChatNotification = () => {
    setIsChatIconHighlighted(true);
    setShowNotification(true);    
    setTimeout(() => {
      setShowNotification(false);
    }, 6000);    
    setTimeout(() => {
      setIsChatIconHighlighted(false);
    }, 4000);
  };

  useEffect(() => {
    const savedTests = JSON.parse(localStorage.getItem('workflowTestHistory') || '[]');
    setConversationHistory(savedTests);
  }, []);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          nodeResults: nodeResults,
          conversationHistory: conversationHistory,
          onNodeResultUpdate: (nodeId, result) => {
            setNodeResults((prev) => ({
              ...prev,
              [nodeId]: result,
            }));
          },
          onConfigUpdate: (nodeId, config) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, config } } : n
              )
            );
          },
        },
      }))
    );
  }, [nodeResults, conversationHistory]);

  const clearWorkflowHistory = () => {
    localStorage.removeItem('workflowTestHistory');
    setConversationHistory([]);
    
    toast.success('Workflow test history cleared!', {
      style: {
        background: '#f0f9ff',
        color: '#0369a1',
        border: '1px solid #bae6fd',
      }
    });
  };

  return (
    <div className="w-full h-full bg-gray-50 relative" ref={reactFlowWrapper}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />

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

      {conversationHistory.length > 0 && (
        <div className="absolute top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg px-3 py-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span>{conversationHistory.length} test conversation(s) saved</span>
            <button
              onClick={clearWorkflowHistory}
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {showNotification && (
        <div className="absolute top-20 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg shadow-xl animate-fade-in-up max-w-xs z-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <div>
              <p className="font-semibold text-sm">💬 Ready to Chat!</p>
              <p className="text-xs opacity-90">
                Click the chat icon to ask more questions
              </p>
            </div>
          </div>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-purple-600 transform rotate-45"></div>
        </div>
      )}

      <div className="absolute bottom-18 right-5 flex items-center gap-2">
        {hoveredIcon === "build" && (
          <div className="bg-white text-black px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap shadow-lg">
            {isBuilding ? "Building..." : "Build & Test Stack"}
          </div>
        )}
        <div
          className={`p-3 rounded-full shadow-lg cursor-pointer transition-all flex items-center justify-center ${
            isBuilding 
              ? 'bg-yellow-500 animate-pulse' 
              : 'bg-green-600 hover:bg-green-700 hover:shadow-xl'
          }`}
          onClick={handleBuildStack}
          disabled={isBuilding}
          onMouseEnter={() => !isBuilding && setHoveredIcon("build")}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          {isBuilding ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </div>
      </div>
      
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        {hoveredIcon === "chat" && (
          <div className="bg-white text-black px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap shadow-lg">
            Chat with Stack
          </div>
        )}
        <div
          className={`p-3 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-all duration-500 flex items-center justify-center ${
            isChatIconHighlighted 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse ring-4 ring-blue-300 transform scale-110' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={() => {
            setIsChatOpen(true);
            setIsChatIconHighlighted(false);
            setShowNotification(false);
          }}
          onMouseEnter={() => setHoveredIcon("chat")}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <MessageCircleMore className="w-5 h-5 text-white" />
        </div>
      </div>

      <ChatPopup
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        workflow={{
          nodes: nodes,
          edges: edges,
        }}
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
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Workspace;