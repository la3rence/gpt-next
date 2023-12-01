"use client";
import Footer from "@/components/footer";
import { useChat } from "ai/react";
import { Suspense, lazy, useEffect, useState } from "react";
import "highlight.js/styles/github-dark.css";

const Title = lazy(() => import("@/components/title"));
const Message = lazy(() => import("@/components/message"));

export default function Home() {
  const [api, setApi] = useState(process.env.NEXT_PUBLIC_LLM_API);
  const {
    messages,
    input,
    isLoading,
    reload,
    stop,
    handleInputChange,
    handleSubmit,
    setMessages,
  } = useChat({
    api,
    initialMessages: [],
    onResponse: () => {
      umami.track("GPT", { prompt: input });
    },
  });

  const clear = () => {
    setMessages([]);
  };

  useEffect(() => {
    const currentUrl = window.location.href;
    const queryParams = new URLSearchParams(new URL(currentUrl).search);
    const model = queryParams.get("model");
    if (model) {
      setApi(`${api}?model=${model}`);
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto relative min-h-[90vh]">
      <div className="pb-8">
        <Suspense
          fallback={
            <div className="mx-6 mt-20 text-3xl text-center">ChatGPT</div>
          }
        >
          <Title name="ChatGPT" />
        </Suspense>
        <form onSubmit={handleSubmit}>
          {messages.map((message) => {
            return (
              <Message
                key={message.id}
                content={message.content}
                role={message.role}
                serverUP={true}
                name="GPT"
              />
            );
          })}
          {messages?.length > 1 && !isLoading && (
            <div className="flex">
              <div className="flex-1"></div>
              <div
                className="p-1 h-6 w-6 mr-4 cursor-pointer text-lg"
                onClick={reload}
              >
                ↺
              </div>
            </div>
          )}
          <div
            id="input"
            className="fixed bottom-10 w-full max-w-3xl backdrop-blur caret-blue-500 z-10"
          >
            <div className="flex shadow-md border border-zinc-50 dark:border-zinc-800">
              {isLoading && (
                <button
                  onClick={stop}
                  className="text-2xl w-12 h-12 bg-transparent"
                >
                  ■
                </button>
              )}
              <textarea
                onChange={handleInputChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    handleSubmit(event);
                  }
                }}
                value={input}
                placeholder="send a prompt"
                disabled={isLoading}
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
              {messages?.length > 1 && (
                <button
                  className="w-12 h-12 text-2xl bg-transparent"
                  onClick={clear}
                >
                  ○
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
