import { motion } from 'framer-motion';
import { GreetingContainer } from "@/components/chat/GreetingContainer";

const Greeting = () => {
  return (
    <div className="flex-1 flex flex-col bg-layout-main">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col h-full px-4 sm:px-6 lg:px-8"
      >
        <GreetingContainer />
      </motion.div>
    </div>
  );
};

export default Greeting;