"use client";
import Footer from "@/components/footer";
import { useChat } from "ai/react";
import { Suspense, lazy, useEffect, useState, useRef } from "react";
import "highlight.js/styles/github-dark.css";
import Edit from "react-contenteditable";

const Title = lazy(() => import("@/components/title"));
const Message = lazy(() => import("@/components/message"));

export default function Home() {
  const [api, setApi] = useState(process.env.NEXT_PUBLIC_LLM_API);
  const [slash, setSlash] = useState(false);
  const [modelIndex, setModelIndex] = useState(0);
  const [MODELS, setMODELS] = useState([
    "text-davinci-002-render-sha",
    "@hf/thebloke/zephyr-7b-beta-awq",
  ]);

  const [prompt, setPrompt] = useState({
    id: "1",
    role: "system",
    content: `你是一个精通一切领域的专家。`,
  });

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
    initialMessages: [prompt],
    onResponse: () => {
      umami.track(MODELS[modelIndex], { prompt: input });
    },
  });
  const bottomRef = useRef(null);

  const clear = () => {
    if (messages[0]["role"] === "system") {
      setMessages([messages[0]]);
    } else {
      setMessages([]);
    }
  };

  const fetchModels = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_LLM_API}models`);
    const models = await res.json();
    setMODELS(models);
  };

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (0 <= modelIndex <= MODELS.length) {
      setApi(`${process.env.NEXT_PUBLIC_LLM_API}?model=${modelIndex}`);
      setSlash(false);
      setInput("");
    }
  }, [modelIndex]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handlePromptChange = (e) => {
    setMessages(
      messages.map((message) => {
        if (message.role === "system") {
          message.content = e.target.value;
          setPrompt({ id: "1", role: "system", content: e.target.value });
          return message;
        } else {
          return message;
        }
      }),
    );
  };

  return (
    <div className="max-w-3xl mx-auto relative min-h-[90vh]">
      <div className="pb-8">
        <Suspense
          fallback={
            <div className="mx-6 mt-20 text-3xl text-center font-sans">
              ● {MODELS[modelIndex]}
            </div>
          }
        >
          <Title name={MODELS[modelIndex]} />
        </Suspense>
        <form onSubmit={handleSubmit}>
          <>
            <div className="ml-6 flex items-center">
              <span className="inline-block w-4 h-4 bg-black dark:border rounded-sm align-middle"></span>
              <span className="pl-1 text-sm">
                PROMPT
                <span className="text-zinc-400 mx-2 text-xs">editable</span>
              </span>
            </div>
            <div className="mx-6 py-6 w-full">
              <Edit html={prompt.content} onChange={handlePromptChange} />
            </div>
          </>
          {messages
            .filter((message) => message.role != "system")
            .map((message, index) => {
              return (
                <Message
                  isLoading={isLoading && index === messages.length - 1}
                  key={message.id}
                  content={message.content}
                  role={message.role}
                  // name={MODELS[modelIndex]}
                />
              );
            })}
          <div className="flex mb-12" ref={bottomRef}>
            <div className="flex-1"></div>
            {messages?.length > 1 && !isLoading && (
              <div
                className="p-1 h-6 w-6 mr-4 cursor-pointer text-lg font-sans hover:text-xl transition"
                onClick={reload}
              >
                ↺
              </div>
            )}
          </div>
          <div
            id="input"
            className="fixed bottom-10 w-full max-w-3xl backdrop-blur caret-blue-500 z-10"
          >
            {slash && (
              <div className="relative w-full mb-2 text-center">
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
                  className="text-2xl w-12 h-12 bg-transparent font-sans  hover:text-3xl"
                >
                  ■
                </button>
              )}
              <textarea
                onChange={handleInputChange}
                onKeyUp={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    handleSubmit(event);
                  } else {
                    if (input === "/") {
                      setSlash(true);
                    } else {
                      setSlash(false);
                    }
                  }
                }}
                value={input}
                placeholder=""
                disabled={isLoading}
                rows={1}
                className="resize-none border-0 max-w-3xl w-full h-12 pl-4 p-3 bg-transparent
              outline-none max-h-24 overflow-y-hidden focus:ring-0 focus-visible:ring-0"
              />
              <button
                type="submit"
                className="w-12 h-12 text-2xl bg-transparent "
              >
                {input && <span className="font-sans hover:text-3xl">▲</span>}
                {!input && <span className="font-sans text-zinc-400 ">▲</span>}
              </button>
              {messages?.length > 1 && (
                <button
                  className="w-12 h-12 text-zinc-400 text-3xl bg-transparent font-mono hover:text-4xl"
                  onClick={clear}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      <Footer text={MODELS[modelIndex]} />
    </div>
  );
}
