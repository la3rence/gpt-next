"use client";
import Footer from "@/components/footer";
import { useChat } from "ai/react";
import { Suspense, lazy, useEffect, useState } from "react";
import "highlight.js/styles/github-dark.css";

const Title = lazy(() => import("@/components/title"));
const Message = lazy(() => import("@/components/message"));
const MODELS = ["ChatGPT", "Mistral", "LLAMA 2 FP16", "LLAMA 2 INT8"];

export default function Home() {
  const [api, setApi] = useState(process.env.NEXT_PUBLIC_LLM_API);
  const [slash, setSlash] = useState(false);
  const [modelIndex, setModelIndex] = useState(0);
  const {
    messages,
    input,
    setInput,
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
      umami.track(MODELS[modelIndex], { prompt: input });
    },
  });

  const clear = () => {
    setMessages([]);
  };

  useEffect(() => {
    if (0 <= modelIndex <= 3) {
      setApi(`${process.env.NEXT_PUBLIC_LLM_API}?model=${modelIndex}`);
      setSlash(false);
      setInput("");
    }
  }, [modelIndex]);

  return (
    <div className="max-w-3xl mx-auto relative min-h-[90vh]">
      <div className="pb-8">
        <Suspense
          fallback={
            <div className="mx-6 mt-20 text-3xl text-center">
              ● {MODELS[modelIndex]}
            </div>
          }
        >
          <Title name={MODELS[modelIndex]} />
        </Suspense>
        <form onSubmit={handleSubmit}>
          {messages.map((message) => {
            return (
              <Message
                key={message.id}
                content={message.content}
                role={message.role}
                serverUP={true}
                name={MODELS[modelIndex]}
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
            {slash && (
              <div className="relative w-full mx-4 mb-2 text-center ">
                <label htmlFor="modelIndex">Choose model: </label>
                <select
                  id="modelIndex"
                  name="modelIndex"
                  defaultValue={modelIndex}
                  onChange={(e) => setModelIndex(Number(e.target.value))}
                >
                  {MODELS.map((v, i) => (
                    <option value={i} key={i}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                onKeyUp={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    handleSubmit(event);
                  }
                  if (/^\/$/.test(input)) {
                    setSlash(true);
                  } else {
                    setSlash(false);
                  }
                }}
                value={input}
                placeholder="send a prompt. hit `/` for other models."
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
