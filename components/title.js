import { TypeAnimation } from "react-type-animation";
export default function Title() {
  return (
    <div className="mx-4 mt-20">
      <TypeAnimation
        sequence={["ChatGPT●"]}
        wrapper="div"
        cursor={false}
        repeat={0}
        style={{ fontSize: "2em", minHeight: "4rem" }}
      />
    </div>
  );
}
