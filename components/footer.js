export default function Footer() {
  return (
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
  );
}
