"use client";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import Title from "@/components/title";
import hljs from "highlight.js";
import MarkdownIt from "markdown-it";
import "highlight.js/styles/github-dark.css";

let parentMessageId = null;
let conversationId = null;

const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(str, {
        language: lang,
        ignoreIllegals: true,
      }).value;
    }
    return "";
  },
});

const Message = ({ role, content, serverUP }) => {
  if (role === "user") {
    return (
      <>
        <div className="ml-6 h-4">
          <span className="rounded-full inline-block w-4 h-4 bg-zinc-600 align-middle"></span>
          <span className="pl-1 text-sm">YOU</span>
        </div>
        <div
          className="mx-6 py-4"
          dangerouslySetInnerHTML={{
            __html: md.render(`${content}`),
          }}
        ></div>
      </>
    );
  }
  return (
    <>
      <div className="ml-6 h-4">
        {!serverUP && (
          <span className="rounded-full inline-block w-4 h-4 bg-red-500 align-middle"></span>
        )}
        {serverUP && (
          <span className="rounded-full inline-block w-4 h-4 bg-blue-500 align-middle"></span>
        )}
        <span className="pl-1 text-sm">GPT</span>
      </div>
      <div
        className="mx-6 py-4"
        dangerouslySetInnerHTML={{
          __html: md.render(`${content}`),
        }}
      ></div>
    </>
  );
};

export default function Home() {
  const [chat, setChat] = useState([]);
  const inputRef = useRef();
  const bottomRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverUP, setServerUP] = useState(true);
  const [isBottom, setIsBottom] = useState(true);

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

    const handleScroll = () => {
      const documentHeight = document.documentElement.scrollHeight;
      setIsBottom(window.innerHeight + window.scrollY >= documentHeight - 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async () => {
    const question = inputRef?.current?.value;
    if (question === "" || !question) {
      return;
    }
    chat.push({ role: "user", content: question });
    inputRef.current.value = "";
    await answer(question);
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
      model: "text-davinci-002-render-sha-mobile",
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
          console.debug("sse onmessage", event.data);
          currentData = data.message?.content?.parts?.[0];
          conversationId = data.conversation_id;
          parentMessageId = data.message.id;
          setAssistantChat(currentData + "●");
          if (window.navigator.vibrate) {
            window.navigator.vibrate(15);
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
    <div className="max-w-3xl mx-auto">
      <Title />
      {/* <div
        className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
        role="alert"
      >
        <p class="font-bold">OpenAI Status</p>
        <p>
          Customer logins to ChatGPT are not available. At this time many users
          are not able to log into ChatGPT. We are actively investigating.
        </p>
      </div> */}
      <div className="mt-4">
        {chat.map((messageObj, index) => {
          return (
            <Message
              content={messageObj.content}
              role={messageObj.role}
              key={index}
              serverUP={serverUP}
            />
          );
        })}
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
      {!isLoading && isBottom && (
        <div id="input" className="fixed bottom-10 left-0 w-full">
          <div className="flex justify-center">
            <input
              disabled={isLoading}
              ref={inputRef}
              type="text"
              placeholder=""
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  send();
                }
              }}
              className="h-12 pl-4 py-3 bg-zinc-100 text-center flex-1 dark:bg-zinc-800 rounded-none outline-none disabled:bg-zinc-50 disabled:dark:bg-zinc-950"
            />
            <button
              className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-2xl"
              onClick={send}
            >
              ▲
            </button>
            {chat.length > 0 && (
              <button
                className="w-12 bg-zinc-100 dark:bg-zinc-800 text-2xl"
                onClick={clearHistory}
              >
                ○
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
