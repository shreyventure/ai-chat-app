import AuthComponent from "@/components/AuthComponent";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-6xl w-full flex flex-col-reverse md:flex-row items-center justify-between gap-12">
        <div className="flex flex-col gap-6 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Welcome to <span className="text-[#72F5FE]">ConvoSync</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-xl">
            Your personal AI assistant to help you chat smarter, faster, and
            better.
          </p>
          <AuthComponent />
        </div>
        <div className="relative w-full md:w-[400px] h-[300px] md:h-[400px]">
          <Image
            src="/images/robo.png"
            alt="Chatbot Illustration"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
