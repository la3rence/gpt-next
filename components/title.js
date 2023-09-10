import { TypeAnimation } from "react-type-animation";
export default function Title() {
  return (
    <div className="mx-6 mt-20 text-center">
      <TypeAnimation
        sequence={[
          "ChatGPT",
          1000,
          "●.lawrenceli.me",
          2000,
          "● ChatGPT",
          2000,
          "●",
        ]}
        wrapper="div"
        cursor={false}
        repeat={0}
        deletionSpeed={60}
        preRenderFirstString={true}
        style={{
          fontSize: "2em",
          minHeight: "4rem",
          // textShadow: "white 0 0 0.1em",
        }}
      />
    </div>
  );
}
