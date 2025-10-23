import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Workspace from "../components/Workspace";

const WorkflowBuilder = () => {
  const { stackName } = useParams();  
  const decodedStackName = decodeURIComponent(stackName);
  
  console.log('Editing stack with name:', decodedStackName);
  
  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-68 bg-white shadow-md">
          <Sidebar stackName={decodedStackName} />
        </div>
        <div className="flex-1">
          <Workspace stackName={decodedStackName} />
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;