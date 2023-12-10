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

const Content = ({ content }) => (
  <div
    className="mx-6 py-4"
    dangerouslySetInnerHTML={{
      __html: md.render(`${content}`),
    }}
  ></div>
);

const Message = ({ role, content, isLoading }) => {
  if (role === "user") {
    return (
      <>
        <div className="ml-6 flex items-center">
          <span className="rounded-full inline-block w-4 h-4 bg-zinc-600 align-middle"></span>
          <span className="pl-1 text-sm">{role.toUpperCase()}</span>
        </div>
        <Content content={content} />
      </>
    );
  }
  return (
    <>
      <div className="ml-6 flex items-center">
        <span className="rounded-full inline-block w-4 h-4 bg-blue-500 align-middle"></span>
        <span className="pl-1 text-sm">{role.toUpperCase()}</span>
      </div>
      {isLoading && <Content content={content + "●"} />}
      {!isLoading && <Content content={content} />}
    </>
  );
};

export default Message;
