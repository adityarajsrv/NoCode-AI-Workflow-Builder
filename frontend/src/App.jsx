import Dashboard from "./pages/Dashboard"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorkflowBuilder from "./pages/WorkflowBuilder";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workflow-builder/:stackName" element={<WorkflowBuilder />} />
      </Routes>
    </Router>
  )
}

export default App