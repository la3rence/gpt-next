import hljs from "highlight.js";
import MarkdownIt from "markdown-it";

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

export default Message;
