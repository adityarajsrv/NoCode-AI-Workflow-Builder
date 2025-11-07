# FlowMind AI - Frontend
  
**Visual AI Workflow Builder - Frontend**

## 🎯 Overview

React.js frontend for FlowMind AI - a visual no-code platform for building intelligent AI workflows. Features drag-and-drop interface, real-time chat, and component-based workflow design.

## ✨ Features

- **🎨 Visual Workflow Builder** - Drag-and-drop with React Flow
- **🧩 AI Components** - Pre-built nodes for queries, knowledge bases, LLMs, and output
- **💬 Real-time Chat** - Interactive conversation with workflows
- **👤 User Management** - Authentication and premium tiers
- **📱 Responsive Design** - Works on desktop and tablet

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`

### Build Commands
```bash
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Code linting
```

## 🏗️ Project Structure

```
src/
├── components/nodes/          # React Flow components
│   ├── KnowledgeBaseNode.jsx  # Document processing
│   ├── LLMNode.jsx           # AI model config
│   ├── OutputNode.jsx        # Chat interface
│   └── UserQueryNode.jsx     # Input handler
├── components/               # UI components
│   ├── ChatPopup.jsx        # Chat modal
│   ├── LoginPopup.jsx       # Auth modal
│   └── Sidebar.jsx          # Component library
├── pages/
│   ├── Dashboard.jsx        # User dashboard
│   └── WorkflowBuilder.jsx  # Main workspace
├── utils/apis.js            # API communication
└── assets/                  # Images & screenshots
```

## 📸 Screenshots

**Landing Page :** 
![Landing Page](https://raw.githubusercontent.com/adityarajsrv/FlowMind-AI/main/frontend/src/assets/Landing-Page.png)

**Dashboard :**
![Dashboard](https://raw.githubusercontent.com/adityarajsrv/FlowMind-AI/main/frontend/src/assets/Dashboard.png)

**Workspace :**
![Workspace](https://raw.githubusercontent.com/adityarajsrv/FlowMind-AI/main/frontend/src/assets/Workspace.png)

**Workflow Built :**
![Workflow Built](https://raw.githubusercontent.com/adityarajsrv/FlowMind-AI/main/frontend/src/assets/Workflow-Built.png)

**Chatting Feature :**
![Chatting Feature](https://raw.githubusercontent.com/adityarajsrv/FlowMind-AI/main/frontend/src/assets/Chatting-Feature.png)

## 🔌 API Integration

Connects to two backend services:
- **Node.js Auth Server** (Port 5000) - Authentication & user data
- **FastAPI AI Server** (Port 8000) - Workflow execution & AI processing

## 🛠️ Development

### Key Dependencies
- React 18 + Vite
- React Flow for workflow visualization
- Axios for API calls
- CSS for styling

### Environment Setup
```env
VITE_API_URL=http://localhost:5000
VITE_FASTAPI_URL=http://localhost:8000
```

---

<div align="center">

**Start building: `npm run dev`**

</div>
