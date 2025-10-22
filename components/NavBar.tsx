import LogoutButton from "@/components/LogoutButton";

const NavBar = () => {
  return (
    <div className="w-full flex justify-between items-center">
      <h1 className="font-bold text-2xl text-white">Your Sessions</h1>
      <LogoutButton
        className="bg-red-400 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-lg w-fit mx-auto md:mx-0 flex items-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
        showProfilePic={false}
      />
    </div>
  );
};

export default NavBar;
