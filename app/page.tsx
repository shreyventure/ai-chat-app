import LoginButton from "@/components/LoginButton";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Welcome to AI Chat App</h1>
      <main className="flex justify-center items-center min-h-screen">
        <div>
          <LoginButton />
        </div>
      </main>
    </div>
  );
}
