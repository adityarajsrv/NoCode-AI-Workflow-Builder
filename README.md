# FlowMind AI - No-Code AI Workflow Builder

<div align="center">

**Build intelligent AI workflows visually - no coding required**

*Personal Project • Under Active Development*

[Features](#-features) • [Quick Start](#-quick-start) 

</div>

## 🎯 What is FlowMind AI?

FlowMind AI is a **no-code/low-code web application** that enables users to visually create, configure, and execute intelligent AI workflows using a simple drag-and-drop interface. Design custom pipelines that integrate document knowledge extraction, LLM-based reasoning, and chat-based interaction - all without writing a single line of code.

### 🚀 Key Capabilities

- **🧩 Visual Workflow Builder** - Drag-and-drop components to create AI pipelines
- **📚 Smart Document Processing** - Extract knowledge from PDFs and other documents
- **🤖 Multi-Model AI Integration** - Leverage Gemini and other LLMs
- **🔍 Web Search Integration** - Enhance responses with real-time web data
- **💬 Interactive Chat Interface** - Natural conversation with your AI workflows

## ✨ Features

### 🎨 Visual Workflow Builder
- **Intuitive Drag & Drop** - Build workflows visually with React Flow
- **Component Library** - Pre-built AI components ready to use
- **Real-time Configuration** - Customize each component with ease
- **Workflow Validation** - Ensure your flows are properly connected

### 🧠 Core AI Components

| Component | Description | Capabilities |
|-----------|-------------|--------------|
| **User Query** | Entry point for user input | Captures and forwards queries to connected components |
| **KnowledgeBase** | Document intelligence | PDF upload, text extraction, vector embeddings, semantic search |
| **LLM Engine** | AI reasoning power | Gemini integration, web search (SerpAPI), custom prompts |
| **Output** | Response delivery | Chat interface, follow-up queries, result display |

### 🔧 Advanced Features
- **🧾 Execution Logs** - Monitor workflow execution in real-time
- **👥 User Authentication** - Secure account management
- **💎 Free & Premium Tiers** - Build unlimited workflows with premium
- **📊 Progress Indicators** - Visual feedback during execution

## 🏗️ Architecture

```mermaid
graph TB
    A[Frontend - React.js] --> B[Node.js Auth Server]
    A --> C[FastAPI AI Backend]
    B --> D[MongoDB - Auth & Users]
    C --> E[PostgreSQL - Workflows]
    C --> F[ChromaDB - Vectors]
    C --> G[Gemini - LLM]
    C --> H[SerpAPI - Web Search]
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Python 3.8+
- PostgreSQL
- MongoDB

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd NOCODEBUILDER
```

#### 2. Backend Setup - Node.js Auth Server
```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations
```

#### 3. Backend Setup - FastAPI AI Server
```bash
cd fastapi_app
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations
```

#### 4. Frontend Setup
```bash
cd frontend
npm install
```

#### 5. Run the Application

**Start all services in separate terminals:**

**Terminal 1 - Node.js Auth Server:**
```bash
cd backend
node server.js
# Server running on http://localhost:5000
```

**Terminal 2 - FastAPI AI Server:**
```bash
cd backend/fastapi_app
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# API docs at http://localhost:8000/docs
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# App running on http://localhost:3000
```

Visit `http://localhost:3000` to start building!

## ⚙️ Configuration

### Environment Variables

**Node.js Backend (.env):**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/flowmind_auth

# JWT
JWT_SECRET=your_jwt_secret_key_here

# FastAPI Integration
FASTAPI_URL=http://localhost:8000

# Cloudinary (optional - for file storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**FastAPI Backend (.env):**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/flowmind_ai

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
SERPAPI_KEY=your_serpapi_key_here

# Embeddings
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Application
SECRET_KEY=your_fastapi_secret_key
ENVIRONMENT=development
```

## 📖 Usage Guide

### Building Your First Workflow

1. **Sign Up & Login**
   - Create an account or login at `http://localhost:3000`
   - Free tier allows 3 workflows

2. **Create New Workflow**
   - Click "Create New Stack" from dashboard
   - Name your workflow and add description

3. **Drag & Drop Components**
   - From sidebar, drag components to canvas:
     - `User Query` (start point)
     - `KnowledgeBase` (document processing)
     - `LLM Engine` (AI reasoning)
     - `Output` (chat interface)

4. **Configure Components**
   - Click each node to configure:
     - **KnowledgeBase**: Upload PDF documents
     - **LLM Engine**: Select Gemini model, enable web search
     - Set custom prompts and parameters

5. **Connect & Validate**
   - Connect nodes in logical order
   - Click "Build Stack" to validate
   - Fix any configuration issues

6. **Test Your Workflow**
   - Click "Chat with Stack" 
   - Ask questions and see AI responses
   - Monitor execution logs

### Example Workflow: Research Assistant

```
User Query 
    ↓
KnowledgeBase (Research Papers)
    ↓  
LLM Engine (Gemini + Web Search)
    ↓
Output (Chat Interface)
```

## 🏗️ Project Structure

```
NOCODEBUILDER/
├── backend/                          # Node.js Authentication Server
│   ├── auth/
│   │   ├── config/                  # Database & Cloudinary config
│   │   ├── middleware/              # JWT authentication
│   │   └── models/                  # User & Stack models
│   ├── fastapi_app/                 # Python AI Processing Server
│   │   ├── api/                     # REST API endpoints
│   │   │   ├── chat.py              # Chat interactions
│   │   │   ├── documents.py         # Document processing
│   │   │   ├── llm.py               # LLM operations
│   │   │   └── workflows.py         # Workflow execution
│   │   ├── chroma_store/            # Vector store operations
│   │   │   ├── embeddings.py        # Local embedding model
│   │   │   ├── llm_engine.py        # Gemini integration
│   │   │   ├── text_extractor.py    # PyMuPDF text extraction
│   │   │   └── vectorstore.py       # ChromaDB management
│   │   ├── db/                      # Database models
│   │   ├── uploads/                 # Document storage
│   │   └── utils/                   # Config & logging
│   ├── routes/                      # Express routes
│   │   ├── authRoutes.js            # Authentication routes
│   │   └── stackRoutes.js           # Workflow management
│   └── server.js                    # Main server file
├── frontend/                        # React Application
│   ├── src/
│   │   ├── components/
│   │   │   └── nodes/               # React Flow components
│   │   │       ├── KnowledgeBaseNode.jsx
│   │   │       ├── LLMNode.jsx
│   │   │       ├── OutputNode.jsx
│   │   │       ├── UserQueryNode.jsx
│   │   │       ├── ChatPopup.jsx    # Chat interface
│   │   │       └── PremiumUpgrade.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   └── WorkflowBuilder.jsx  # Workflow canvas
│   │   └── utils/
│   │       └── apis.js              # API communication
│   └── public/
└── README.md
```

## 🔌 API Endpoints

### FastAPI Backend (Port 8000)
- `POST /api/workflows/` - Create new workflow
- `POST /api/workflows/{id}/execute` - Execute workflow
- `POST /api/documents/upload` - Upload documents
- `POST /api/chat/send` - Send chat message
- `POST /api/llm/generate` - Generate LLM response

### Node.js Backend (Port 5000)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET/POST /api/stacks/` - User workflows
- `GET/PUT/DELETE /api/stacks/{id}` - Manage specific workflow

## 🛠️ Development

### Running in Development Mode

**Start all services:**
```bash
# Terminal 1 - Auth Server
cd backend
node server.js

# Terminal 2 - AI Server  
cd backend/fastapi_app
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### Testing
```bash
# Test embeddings functionality
cd backend/fastapi_app
python test_embeddings.py
```

## 🆘 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Node.js: Port 5000
   - FastAPI: Port 8000
   - Frontend: Port 3000

2. **Virtual Environment**
   - Ensure venv is activated for FastAPI
   - Reinstall requirements if needed

3. **Database Connections**
   - Verify PostgreSQL and MongoDB are running
   - Check connection strings in .env files

4. **API Keys**
   - Obtain Gemini API key from Google AI Studio
   - Get SerpAPI key from serpapi.com

### Getting Help
- Check FastAPI docs: `http://localhost:8000/docs`
- Review server logs for error messages
- Verify all services are running on correct ports

## 📊 Plans & Pricing

| Feature | Free Tier | Premium Tier |
|---------|-----------|--------------|
| Workflows | 3 stacks | Unlimited |

*Note: Tier system implemented for feature demonstration*

## 📄 License

This is a personal project for development and portfolio purposes.

---

## ⭐ Support the Project

If you find this project helpful or interesting, please consider giving it a star on GitHub! Your support helps me continue to improve and maintain the project.

---
