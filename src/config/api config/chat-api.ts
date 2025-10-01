import { useMutation } from "@tanstack/react-query";
// import DummyResponse from "../../data/dummy.json";

type RunChatParams = {
  prompt: string;
  chatId: string;
  action: number;
  model: number;
};

const useRunChat = () => {
  return useMutation({
    mutationFn: async ({
      prompt,
      chatId,
      action = 0,
      model = 0,
    }: RunChatParams) => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API
        }/users/handlechatrequest?requesttype=modelconvertation`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, chatId, model, action }),
        }
      );
      const json = await res.json();
      //console.log("✅ API Response:", json); // <-- Log response here
      return json;

      // //console.log("🧪 Using dummy response instead of API call");

      // // Simulate a slight delay like an API would have
      // await new Promise((resolve) => setTimeout(resolve, 500));

      // //console.log("✅ Dummy Response:", DummyResponse);

      // return DummyResponse;
    },
    onError: (error) => {
      console.error("❌ Error in mutation:", error);
    },
  });
};

export default useRunChat;
