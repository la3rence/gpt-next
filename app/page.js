"use client";
import React, { useEffect, useRef, useState, lazy, Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import "highlight.js/styles/github-dark.css";

const Message = lazy(() => import("@/components/message"));
const Title = lazy(() => import("@/components/title"));
let parentMessageId = null;
let conversationId = null;

export default function Home() {
  const [chat, setChat] = useState([]);
  const inputRef = useRef();
  const bottomRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverUP, setServerUP] = useState(true);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    setChat(JSON.parse(localStorage.getItem("chat.history")) || []);
    conversationId = localStorage.getItem("chat.conversationId") || null;
    parentMessageId = localStorage.getItem("chat.parentMessageId") || null;
    const checkStatus = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_GPT_STATUS, {
          headers: { authorization: "test" },
        });
        const data = await response.json();
        if (response.status !== 200 || !data) {
          setServerUP(false);
        }
      } catch (error) {
        setServerUP(false);
      }
    };
    checkStatus();
  }, []);

  const send = async () => {
    if (inputText === "" || !inputText) {
      return;
    }
    chat.push({ role: "user", content: inputText });
    setInputText("");
    inputRef.current.value = "";
    await answer(inputText);
  };

  const answer = async (question) => {
    setIsLoading(true);
    const body = {
      messages: [
        {
          id: uuidv4(),
          author: {
            role: "user",
          },
          content: {
            parts: [question],
            content_type: "text",
          },
          create_time: (Date.now() / 1000).toFixed(7),
        },
      ],
      parent_message_id: parentMessageId ? parentMessageId : uuidv4(),
      model: "text-davinci-002-render-sha",
      timezone_offset_min: -480,
      arkose_token: null,
      action: "next",
    };
    if (conversationId) {
      body.conversation_id = conversationId;
    }
    chat.push({ role: "assistant", content: "●" });
    setChat([...chat]);
    let currentData = "";
    try {
      await fetchEventSource(process.env.NEXT_PUBLIC_CHAT_API, {
        method: "POST",
        mode: "cors",
        headers: {
          "content-type": "text/event-stream",
          authorization: "test",
        },
        body: JSON.stringify(body),
        async onopen(res) {
          setServerUP(true);
          if (res.status != 200) {
            setServerUP(false);
            throw new Error(`Error code ${res.status} ${res.statusText}`);
          }
        },
        onmessage(event) {
          if (event.data === "[DONE]") {
            return;
          }
          let data;
          try {
            data = JSON.parse(event.data);
          } catch (error) {
            return;
          }
          if (data.is_completion === true) {
            return;
          }
          console.debug("sse onmessage", event.data);
          currentData = data.message?.content?.parts?.[0];
          conversationId = data.conversation_id;
          parentMessageId = data.message?.id;
          setAssistantChat(currentData + "●");
          if (window.navigator.vibrate) {
            window.navigator.vibrate(10);
          }
          bottomRef.current.scrollIntoView({ behavior: "smooth" });
          localStorage.setItem("chat.conversationId", conversationId);
          localStorage.setItem("chat.parentMessageId", parentMessageId);
        },
        onerror(error) {
          throw error;
        },
        async onclose() {
          console.debug("sse closed");
          setAssistantChat(currentData);
          setIsLoading(false);
          localStorage.setItem("chat.history", JSON.stringify(chat));
        },
      });
    } catch (error) {
      setAssistantChat(error.message);
      setIsLoading(false);
      localStorage.setItem("chat.history", JSON.stringify(chat));
      return;
    }
  };

  const setAssistantChat = (content) => {
    chat.pop();
    chat.push({ role: "assistant", content });
    setChat([...chat]);
  };

  const regenerate = async () => {
    chat.pop();
    await answer(chat.slice(-1)[0].content);
  };
  const clearHistory = () => {
    if (window.confirm("确认清空当前记录?")) {
      setChat([]);
      localStorage.removeItem("chat.history");
      localStorage.removeItem("chat.conversationId");
      localStorage.removeItem("chat.parentMessageId");
      parentMessageId = null;
      conversationId = null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto relative min-h-[90vh]">
      <div className="pb-8">
        <Suspense
          fallback={
            <div className="mx-6 mt-20 text-3xl text-center">ChatGPT</div>
          }
        >
          <Title />
        </Suspense>
        {!serverUP && (
          <div
            className="bg-orange-50 dark:bg-orange-950 border-l-4 border-orange-500 text-orange-700 p-4"
            role="alert"
          >
            <p className="font-bold">ChatGPT Status</p>
            <p>
              We are facing some issues to fetch data from OpenAI server. We are
              actively investigating.
            </p>
            <span>Status: https://status.lawrenceli.me</span>
          </div>
        )}
        <div className="mt-4">
          <Suspense fallback={<div className="text-2xl text-center">●▲■</div>}>
            {chat.map((messageObj, index) => {
              return (
                <Message
                  key={index}
                  content={messageObj.content}
                  role={messageObj.role}
                  serverUP={serverUP}
                />
              );
            })}
          </Suspense>
        </div>
        {chat.length > 1 && !isLoading && (
          <div className="flex">
            <div className="flex-1"></div>
            <div
              className="p-1 h-6 w-6 mr-4 cursor-pointer text-lg"
              onClick={regenerate}
            >
              ↺
            </div>
          </div>
        )}
        <div ref={bottomRef} className="mb-36 text-center">
          {isLoading && <span className="text-2xl">■</span>}
        </div>
        <div
          id="input"
          className="fixed bottom-10 w-full max-w-3xl backdrop-blur caret-blue-500 z-10"
        >
          <div className="flex shadow-md border border-zinc-50 dark:border-zinc-800">
            <textarea
              rows="1"
              disabled={isLoading}
              ref={inputRef}
              placeholder="send a prompt"
              onChange={(event) => {
                setInputText(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  send();
                }
              }}
              className="resize-none border-0 max-w-3xl w-full h-12 pl-4 p-3 bg-transparent
              outline-none max-h-24 overflow-y-hidden focus:ring-0 focus-visible:ring-0 "
            />
            <button
              className="w-12 h-12 text-2xl bg-transparent"
              onClick={send}
            >
              {inputText === "" || !inputText ? (
                <span className="text-zinc-500">▲</span>
              ) : (
                <span>▲</span>
              )}
            </button>
            {chat?.length > 3 && (
              <button
                className="w-12 h-12 text-2xl bg-transparent"
                onClick={clearHistory}
              >
                ○
              </button>
            )}
          </div>
        </div>
      </div>
      <footer className="-bottom-7 absolute w-full z-0 flex items-center justify-center text-xs text-zinc-400">
        <span className="mx-1 w-3 h-3 inline-block pt-2 bg-zinc-300 dark:bg-zinc-700 rounded-full"></span>
        <span>Free Research Preview.</span>
        <span className="mx-2 underline">
          <a href="https://github.com/Lonor/gpt-next">Source Code</a>
        </span>
        <span className="underline">
          <a href="https://lawrenceli.me/privacy">Privacy</a>
        </span>
        <span className="mx-2 underline">
          <a href="https://status.lawrenceli.me">Status</a>
        </span>
      </footer>
    </div>
  );
}
