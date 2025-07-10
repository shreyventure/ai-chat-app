import LoginButton from "./components/LoginButton";
export default function Home() {
  return (
    <main className="flex justify-center items-center min-h-screen">
      <h1 className="text-2xl font-bold">Welcome to AI Chat App</h1>
      <LoginButton />
    </main>
  );
}
