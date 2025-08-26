import { PowerMakerLayout } from "@/components/PowerMakerLayout";

const Index = () => {
  console.log("Index component rendering");
  
  // Simple test render first
  return (
    <div className="min-h-screen bg-red-500 p-8">
      <h1 className="text-white text-4xl">Test - Can you see this?</h1>
      <div className="bg-blue-500 p-4 mt-4">
        <p className="text-white">If you can see this, the basic rendering works</p>
      </div>
    </div>
  );
  
  // Original layout - commented out for now
  // return <PowerMakerLayout />;
};

export default Index;
