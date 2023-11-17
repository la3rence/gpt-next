"use client";

import Footer from "@/components/footer";
import { useChat } from "ai/react";
import { Suspense, lazy } from "react";

const Title = lazy(() => import("@/components/title"));
const Message = lazy(() => import("@/components/message"));

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: process.env.NEXT_PUBLIC_LLAMA_API,
    initialMessages: [
      {
        id: "system",
        role: "system",
        content: "你是一个 AI 助手，使用中文回复。",
      },
    ],
    onResponse: (res) => {
      console.debug(res);
    },
  });

  return (
    <div className="max-w-3xl mx-auto relative min-h-[90vh]">
      <div className="pb-8">
        <Suspense
          fallback={
            <div className="mx-6 mt-20 text-3xl text-center">LLaMA</div>
          }
        >
          <Title name="LLaMA-2-7B" />
        </Suspense>
        <form onSubmit={handleSubmit}>
          {messages.map((message) => {
            return (
              <Message
                key={message.id}
                content={message.content}
                role={message.role}
                serverUP={true}
                name="LLM"
              />
            );
          })}
          <div
            id="input"
            className="fixed bottom-10 w-full max-w-3xl backdrop-blur caret-blue-500 z-10"
          >
            <div className="flex shadow-md border border-zinc-50 dark:border-zinc-800">
              <textarea
                onChange={handleInputChange}
                value={input}
                placeholder="send a prompt"
                rows={1}
                className="resize-none border-0 max-w-3xl w-full h-12 pl-4 p-3 bg-transparent
              outline-none max-h-24 overflow-y-hidden focus:ring-0 focus-visible:ring-0 "
              />
              <button
                type="submit"
                className="w-12 h-12 text-2xl bg-transparent"
              >
                <span>▲</span>
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
