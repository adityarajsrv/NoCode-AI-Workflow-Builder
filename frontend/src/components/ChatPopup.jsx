/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import logo from "../assets/logo.png";
import axios from "axios";

const ChatPopup = ({ isOpen, onClose, workflow }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [sessionId] = useState(() => {
    return localStorage.getItem("chatSessionId") || `session_${Date.now()}`;
  });

  useEffect(() => {
    localStorage.setItem("chatSessionId", sessionId);
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatConversationHistory");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatConversationHistory", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || !workflow) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsRunning(true);

    try {
      console.log("🚀 Executing workflow with query:", inputMessage);
      console.log("📋 Workflow nodes:", workflow.nodes?.length);
      console.log("🔗 Workflow edges:", workflow.edges?.length);

      const response = await axios.post(
        "http://localhost:8000/api/workflows/run",
        {
          workflow: {
            nodes:
              workflow.nodes?.map((node) => ({
                id: node.id,
                type: node.type,
                data: {
                  ...node.data,
                  config: node.data.config || {},
                },
              })) || [],
            edges: workflow.edges || [],
          },
          query: inputMessage.trim(),
          session_id: sessionId,
        }
      );
      console.log("✅ Workflow response received:", response.data);

      const aiResponseText =
        response.data.final_output ||
        response.data.response ||
        "No response received from workflow";

      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("❌ Workflow execution failed:", error);

      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to execute workflow. Please check your configuration."
        }`,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem("chatConversationHistory");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-6xl h-[600px] flex flex-col border border-gray-200">
        <div className="flex items-center justify-between rounded-b-md p-4 border-b border-gray-200 bg-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="flex flex-row space-x-1">
              <img src={logo} alt="" className="h-10 w-10 mt-1" />
              <h1 className="font-semibold text-xl mt-2">FlowMind AI</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChatHistory}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Clear Chat
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="cursor-pointer w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex flex-row space-x-1">
                <img src={logo} alt="" className="h-9 w-9 mt-1.5" />
                <h1 className="font-semibold text-xl mt-2">FlowMind AI Chat</h1>
              </div>
              <p className="text-gray-600 text-md ml-2">
                Start a conversation to test your stack
              </p>
              {!workflow && (
                <p className="text-orange-500 text-sm mt-2">
                  ⚠️ Please build a workflow first before chatting
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-green-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.text}
                    </p>
                    <div
                      className={`text-xs mt-1 ${
                        message.sender === "user"
                          ? "text-green-100"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              {isRunning && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-gray-600 text-sm">
                        Executing workflow...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
          <div className="relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !workflow
                  ? "Build a workflow first to start chatting"
                  : "Send a message"
              }
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows="1"
              style={{ minHeight: "48px", maxHeight: "120px" }}
              disabled={!workflow}
            />
            <button
              onClick={handleSendMessage}
              disabled={isRunning || inputMessage.trim() === "" || !workflow}
              className="cursor-pointer absolute right-2 bottom-2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 mb-1.5 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isRunning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          {!workflow && (
            <p className="text-orange-500 text-xs mt-2 text-center">
              ⚠️ Drag and connect nodes on the canvas, then click &apos;Build
              Stack&apos; before chatting
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
