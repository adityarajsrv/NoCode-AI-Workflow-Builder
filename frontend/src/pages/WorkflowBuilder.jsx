import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Workspace from "../components/Workspace";

const WorkflowBuilder = () => {
  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-68 bg-white shadow-md">
          <Sidebar />
        </div>
        <div className="flex-1">
          <Workspace />
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
