import { FunctionComponent } from "react";
import ScrambledText from "@/components/ui/ScrambledText";
import RotatingText from "@/components/ui/RotatingText";
import { HeroBackground } from "@/components/ui/FaultyTerminal";

const HeroSection: FunctionComponent = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        top: 0,
        left: 0,
      }}
      className="flex justify-center items-center"
    >
      <HeroBackground />

      <div className="text-center px-4 relative flex flex-col justify-center items-center z-10">
        <h1 className="lg:text-6xl text-3xl font-bold flex items-center text-white">
          A
          <RotatingText
            texts={[
              "Web",
              "Frontend",
              "Dedicated",
              "Passionate",
              "Creative",
              "Italian",
            ]}
            mainClassName="px-2 mx-2 sm:px-2 md:px-3 bg-blue-600 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
          Developer
        </h1>
        <ScrambledText
          scrambleChars={
            [
              "A",
              "B",
              "C",
              "D",
              "E",
              "F",
              "G",
              "H",
              "I",
              "J",
              "K",
              "L",
              "M",
              "N",
              "O",
              "P",
              "Q",
              "R",
              "S",
              "T",
              "U",
              "V",
              "W",
              "X",
              "Y",
              "Z",
              ";",
              "#",
              "%",
              "&",
              "/",
              "(",
              ")",
              "=",
              "?",
              "¡",
              "¿",
              "*",
              "+",
              "-",
              "_",
              "<",
              ">",
              "^",
              "°",
              "@",
              "€",
              "$",
              "£",
              "¢",
              "¬",
              "{",
              "}",
              "[",
              "]",
              "|",
              "~",
            ][Math.round(Math.random() * 40)]
          }
          radius={50}
        >
          enthusiastic about crafting exceptional digital experiences. <br />
          Welcome to my portfolio!
        </ScrambledText>
      </div>
    </div>
  );
};

export default HeroSection;
