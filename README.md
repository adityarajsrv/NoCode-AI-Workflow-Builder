# 🧩 No-Code AI Workflow Builder

A **No-Code/Low-Code web application** that allows users to visually create, configure, and execute **intelligent workflows** using drag-and-drop components.
Users can design custom pipelines that integrate **document knowledge extraction**, **LLM-based reasoning**, and **chat-based interaction** without writing any code.

---

## 🚀 Objective

Develop a **visual workflow builder** that enables users to:

* Configure a sequence of intelligent components (User Query → KnowledgeBase → LLM Engine → Output)
* Ask questions through a chat interface
* Automatically process queries using the defined workflow and return meaningful responses

---

## 🧠 Core Features

### 1. **User Query Component**

* Entry point for user queries
* Captures and forwards input to connected components

### 2. **KnowledgeBase Component**

* Allows **document upload** (PDFs, etc.)
* Extracts text using **PyMuPDF**
* Generates **embeddings** using OpenAI or Gemini models
* Stores vectors in **ChromaDB**
* Retrieves relevant context for queries

### 3. **LLM Engine Component**

* Accepts user query and optional context
* Supports **Gemini** models
* Integrates **SerpAPI** for web results
* Returns AI-generated responses

### 4. **Output Component**

* Displays the final response in a **chat interface**
* Supports follow-up queries reusing the same workflow logic

---

## ⚙️ Workflow Execution

### **Build Stack**

* Users connect components visually
* System validates configuration and readiness

### **Chat with Stack**

* Users interact via a chat interface
* Each query flows through:
  `User Query → (Optional) KnowledgeBase → LLM Engine → Output`
* Final response is rendered in the chat view

---

## 🧰 Tech Stack

| Layer               | Technology          |
| ------------------- | ------------------- |
| **Frontend**        | React.js            |
| **Backend**         | FastAPI             |
| **Database**        | PostgreSQL          |
| **Drag & Drop**     | React Flow          |
| **Vector Store**    | ChromaDB            |
| **Embeddings**      | Gemini              |
| **LLM**             | Gemini              |
| **Web Search**      | SerpAPI             |
| **Text Extraction** | PyMuPDF             |

---

## 💻 Frontend Specification

### **Component Library Panel**

* Lists all four available components
* Supports drag-and-drop to the canvas

### **Workspace Panel**

* Visual builder powered by **React Flow**
* Features drag-and-drop, zoom, pan, and connector arrows

### **Component Configuration Panel**

* Displays configurable options for the selected component
* Includes appropriate input fields (text fields, dropdowns, toggles)

### **Execution Controls**

* **Build Stack** – Validates and prepares workflow
* **Chat with Stack** – Opens chat interface for interaction

---

## 🏗️ Architecture Overview

```
Frontend (React.js)
│
├── Component Library Panel
├── Workflow Canvas (React Flow)
├── Configuration Panel
└── Chat Interface
     │
     ▼
Backend (FastAPI)
│
├── Workflow Execution Engine
├── KnowledgeBase (ChromaDB + PyMuPDF)
├── LLM Engine (OpenAI / Gemini)
└── PostgreSQL Database
```

---

## 🧩 Example Workflow

```
User Query → KnowledgeBase → LLM Engine → Output
```

1. User submits a query
2. System fetches context from uploaded documents
3. LLM generates a relevant answer
4. Output is displayed in chat

---

## 📦 Setup Instructions (Summary)

### **1. Frontend**

```bash
cd frontend
npm install
npm start
```

### **2. Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### **3. Database**

Ensure PostgreSQL is running and configured in `.env`
Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/workflow_db
```

## ⭐ Support the Project

If you find this project helpful or interesting, please consider giving it a star on GitHub! Your support helps me continue to improve and maintain the project.

---
