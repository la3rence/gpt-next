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
    content: `你是一个精通一切领域的专家；你会用精确、简短的语言回答我的提问；除非有特殊说明，否则一切回答都使用中文。`,
  });

  const {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    reload,
    stop,
    handleInputChange,
    handleSubmit,
  } = useChat({
    api,
    initialMessages: [prompt],
    onResponse: () => {
      umami.track(MODELS[modelIndex], { prompt: input });
    },
  });
  const bottomRef = useRef(null);
  const promptRef = useRef(null);

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
    promptRef.current.focus();
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
    if (bottomRef.current && isLoading) {
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
            <div className="mx-6 flex items-center">
              <span className="inline-block w-4 h-4 bg-black dark:border dark:border-zinc-700 rounded-sm align-middle"></span>
              <span>
                <span className="px-1 text-sm">
                  SYSTEM
                  <span className="px-1 text-xs text-zinc-400">editable</span>
                </span>
              </span>
            </div>
            <div
              className="shadow-inner mt-2 max-w-3xl mb-4 dark:bg-zinc-800"
              contentEditable="plaintext-only"
            >
              <Edit
                className="p-4"
                innerRef={promptRef}
                inputMode="text"
                html={prompt.content}
                onChange={handlePromptChange}
              />
            </div>
          </>
          {messages
            .filter((message) => message.role != "system")
            .map((message, index) => {
              return (
                <Message
                  isLoading={isLoading && index === messages.length - 2}
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
            className="fixed bottom-0 sm:bottom-10 w-full max-w-3xl backdrop-blur caret-blue-500 z-10"
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
                  className="text-2xl w-12 h-12 bg-transparent font-sans hover:text-3xl"
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
                {input && <span className="font-sans">▲</span>}
                {!input && <span className="font-sans text-zinc-400 ">▲</span>}
              </button>
              {messages?.length > 1 && (
                <button
                  className="w-12 h-12 text-zinc-500 text-2xl bg-transparent font-sans"
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
