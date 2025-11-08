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
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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
  const [showGuide, setShowGuide] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [guideAnimation, setGuideAnimation] = useState("enter");
  const [isWorkflowBuilt, setIsWorkflowBuilt] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL;

  const guideSteps = [
    {
      title: "Welcome to AI Workspace! 🚀",
      description:
        "Build powerful AI workflows by connecting different nodes. Let's create your first intelligent automation!",
      icon: "🎯",
      color: "blue",
      tips: [
        "Drag nodes from the panel",
        "Connect them to create flows",
        "Test instantly with real AI",
      ],
    },
    {
      title: "Start with User Query",
      description:
        "Add a User Query node to define what users will ask. This is where you set up the input for your AI workflow.",
      icon: "💬",
      color: "green",
      tips: [
        "Write clear, specific queries",
        "Use placeholders for variables",
        "Test different question formats",
      ],
    },
    {
      title: "Add Your Knowledge Base",
      description:
        "Upload PDFs and documents to provide context. The AI will use this information to generate accurate responses.",
      icon: "📚",
      color: "purple",
      tips: [
        "Upload PDFs, text files",
        "Organize documents by topic",
        "Use multiple knowledge bases",
      ],
    },
    {
      title: "Configure AI Model",
      description:
        "Select Gemini model and provide your API key. You can also add custom instructions and enable web search for additional context.",
      icon: "🔑",
      color: "orange",
      tips: [
        "Get API key from Google AI Studio",
        "Add custom instructions",
        "Enable web search for latest info",
      ],
    },
    {
      title: "Build & Generate Output",
      description:
        "Click the Build Stack button to process your workflow. The AI will generate responses based on your query and knowledge base.",
      icon: "⚡",
      color: "red",
      tips: [
        "Wait for processing to complete",
        "Check each node's output",
        "Review the final result",
      ],
    },
    {
      title: "Continue the Conversation",
      description:
        "Once output is generated, use the chat button to ask follow-up questions based on your knowledge base and previous context.",
      icon: "🤖",
      color: "yellow",
      tips: [
        "Ask follow-up questions",
        "Explore different angles",
        "Test edge cases",
      ],
    },
  ];

  const handleNextStep = () => {
    setGuideAnimation("exit");
    setTimeout(() => {
      if (currentStep < guideSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        setGuideAnimation("enter");
      } else {
        setShowGuide(false);
        localStorage.setItem("workspaceGuideSeen", "true");
        toast.success(
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-gray-800">Ready to Build! 🎉</p>
              <p className="text-sm text-gray-600">
                Start dragging nodes to create your first workflow
              </p>
            </div>
          </div>,
          {
            duration: 4000,
          }
        );
      }
    }, 300);
  };

  const handlePrevStep = () => {
    setGuideAnimation("exit");
    setTimeout(() => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        setGuideAnimation("enter");
      }
    }, 300);
  };

  const handleSkipGuide = () => {
    setGuideAnimation("exit");
    setTimeout(() => {
      setShowGuide(false);
      localStorage.setItem("workspaceGuideSeen", "true");
      toast("You can always access help from the help button", {
        icon: "💡",
        duration: 3000,
      });
    }, 300);
  };

  useEffect(() => {
    const guideSeen = localStorage.getItem("workspaceGuideSeen");
    
    if (guideSeen) {
      setShowGuide(false);
    } else {
      localStorage.setItem("firstWorkspaceVisit", "true");

      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const colorMap = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 cursor-pointer",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      button: "bg-green-600 hover:bg-green-700 cursor-pointer",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700 cursor-pointer",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      button: "bg-orange-600 hover:bg-orange-700 cursor-pointer",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
      button: "bg-red-600 hover:bg-red-700 cursor-pointer",
    },
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      button: "bg-yellow-600 hover:bg-yellow-700 cursor-pointer",
    },
  };

  const currentColor =
    colorMap[guideSteps[currentStep]?.color] || colorMap.blue;

  const [showQuickHelp, setShowQuickHelp] = useState(false);

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

      if (nodes.length === 0) {
        toast.success("Great! Now connect it to other nodes", {
          duration: 3000,
        });
      }
    },
    [
      setNodes,
      handleDeleteNode,
      handleResetConnections,
      nodeResults,
      nodes.length,
    ]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleBuildStack = async () => {
    if (nodes.length === 0) {
      toast.error("Please add nodes to build a workflow", {
        icon: "⚠️",
        style: {
          background: "#fef3f2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        },
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
            <p className="text-sm text-gray-600">
              Validating nodes and preparing pipeline...
            </p>
          </div>
        </div>,
        {
          duration: Infinity,
          style: {
            background: "#f0f9ff",
            color: "#0369a1",
            border: "1px solid #bae6fd",
            minWidth: "320px",
          },
        }
      );

      console.log("🏗️ Building and testing workflow...");

      const userQueryNode = nodes.find((node) => node.type === "userQuery");
      let testQuery = "What is machine learning?";

      if (userQueryNode && nodeResults[userQueryNode.id]?.data) {
        testQuery = nodeResults[userQueryNode.id].data;
      }

      await axios.post(
        `${API_BASE}/api/workflows/build`,
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

      console.log("✅ Workflow built successfully");

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
            background: "#f0fdf4",
            color: "#166534",
            border: "1px solid #bbf7d0",
            minWidth: "320px",
          },
        }
      );

      const runResponse = await axios.post(
        `${API_BASE}.com/api/workflows/run`,
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
          }),
        };

        const existingTests = JSON.parse(
          localStorage.getItem("workflowTestHistory") || "[]"
        );
        const updatedTests = [...existingTests, testConversation].slice(-10); 
        localStorage.setItem(
          "workflowTestHistory",
          JSON.stringify(updatedTests)
        );

        setConversationHistory(updatedTests);

        toast.success(
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-semibold text-gray-800">
                Your stack workflow is ready! 🎉
              </p>
              <p className="text-sm text-gray-600">
                Click the chat icon to continue exploring
              </p>
            </div>
          </div>,
          {
            duration: 5000,
            style: {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              minWidth: "320px",
            },
          }
        );

        setIsWorkflowBuilt(true);
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
            background: "#fef3f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            minWidth: "320px",
          },
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

  const handleChatClick = () => {
    if (!isWorkflowBuilt) {
      toast.error("Please build your workflow first before chatting!", {
        icon: "🚫",
        style: {
          background: "#fef3f2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        },
      });
      return;
    }
    setIsChatOpen(true);
    setIsChatIconHighlighted(false);
    setShowNotification(false);
  };

  useEffect(() => {
    const savedTests = JSON.parse(
      localStorage.getItem("workflowTestHistory") || "[]"
    );
    setConversationHistory(savedTests);
    if (savedTests.length > 0) {
      setIsWorkflowBuilt(true);
    }
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
    localStorage.removeItem("workflowTestHistory");
    setConversationHistory([]);
    setIsWorkflowBuilt(false);

    toast.success("Workflow test history cleared!", {
      style: {
        background: "#f0f9ff",
        color: "#0369a1",
        border: "1px solid #bae6fd",
      },
    });
  };

  return (
    <div className="w-full h-full bg-gray-50 relative" ref={reactFlowWrapper}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />

      {showGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all duration-300 ${
              guideAnimation === "enter"
                ? "animate-in fade-in-0 zoom-in-95"
                : "animate-out fade-out-0 zoom-out-95"
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 ${currentColor.bg} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-2xl">
                      {guideSteps[currentStep].icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {guideSteps[currentStep].title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Step {currentStep + 1} of {guideSteps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkipGuide}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {guideSteps[currentStep].description}
                </p>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Pro Tips
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {guideSteps[currentStep].tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {guideSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setGuideAnimation("exit");
                        setTimeout(() => {
                          setCurrentStep(index);
                          setGuideAnimation("enter");
                        }, 300);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentStep
                          ? currentColor.bg
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex space-x-3">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevStep}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}

                  <button
                    onClick={handleNextStep}
                    className={`flex items-center gap-2 px-6 py-2 ${currentColor.button} text-white rounded-lg font-medium transition-colors`}
                  >
                    {currentStep === guideSteps.length - 1 ? (
                      <>
                        Start Building
                        <Rocket className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showGuide && (
        <div className="absolute top-4 left-4 z-40">
          <button
            onClick={() => setShowQuickHelp(!showQuickHelp)}
            className="px-3 py-2.5 bg-white rounded-full shadow-xl scale-100 hover:scale-105 hover:shadow-2xl hover:border-yellow-300 transition-all cursor-pointer border border-gray-200 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">
              💡
            </span>
          </button>

          {showQuickHelp && (
            <div className="absolute left-0 top-14 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 z-50 animate-in fade-in-0 zoom-in-95">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                Quick Help Guide
              </h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <p>
                    <strong>Drag nodes</strong> from left panel to workspace
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <p>
                    <strong>Connect nodes</strong> by dragging between handles
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <p>
                    <strong>Click nodes</strong> to configure settings and
                    parameters
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    4
                  </div>
                  <p>
                    <strong>Click play button</strong> to test your workflow
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    5
                  </div>
                  <p>
                    <strong>Chat button</strong> becomes available after successful build
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQuickHelp(false)}
                className="cursor-pointer w-full mt-4 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                Got it!
              </button>

              <button
                onClick={() => {
                  setShowQuickHelp(false);
                  setShowGuide(true);
                  setCurrentStep(0);
                }}
                className="cursor-pointer w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Show Full Tutorial
              </button>
            </div>
          )}
        </div>
      )}

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
              className="text-blue-600 hover:text-blue-800 text-xs underline cursor-pointer"
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
              ? "bg-yellow-500 animate-pulse"
              : "bg-green-600 hover:bg-green-700 hover:shadow-xl"
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
            {isWorkflowBuilt ? "Chat with Stack" : "Build workflow first"}
          </div>
        )}
        <div
          className={`p-3 rounded-full shadow-lg transition-all duration-500 flex items-center justify-center ${
            isWorkflowBuilt
              ? isChatIconHighlighted
                ? "bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse ring-4 ring-blue-300 transform scale-110 cursor-pointer"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer hover:shadow-xl"
              : "bg-gray-400 cursor-not-allowed opacity-70"
          }`}
          onClick={handleChatClick}
          onMouseEnter={() => isWorkflowBuilt && setHoveredIcon("chat")}
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