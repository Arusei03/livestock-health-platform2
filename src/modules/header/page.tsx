import { useState } from "react";
import { Bell, ChevronDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import { toast } from "sonner";
import useUser from "../../hooks/userUser";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

interface HeaderProps {
  user?: User | null;
  isUserLoading?: boolean;
  showNotifications?: boolean;
  onNotifications?: () => void;
}

const Header = ({
  user,
  isUserLoading: isLoading = false,
  showNotifications = false,
  onNotifications,

}: HeaderProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleCreateAccount = () => {
    navigate("/signup");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
      toast.success("Logged out successfully.");
    } catch {
      toast.error("Unable to log out. Please try again.");
    }
  };

  return (
    <header className="px-6 py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Application Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white">
            L
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary">
              Livestock Health
            </h1>
            <p className="text-xs text-foreground/70">
              Livestock health management platform
            </p>
          </div>
        </div>

        {/* Authentication / App Actions */}
        <div className="relative flex items-center gap-3">
          {isLoading ? null : user ? (
            <>
              {showNotifications && (
                <button
                  onClick={onNotifications}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                </button>
              )}


              <button
                onClick={() =>
                  setIsProfileMenuOpen((prev) => !prev)
                }
                className="flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 transition-colors hover:bg-gray-50"
                title={user.name}
                aria-label={`Profile of ${user.name}`}
                aria-expanded={isProfileMenuOpen}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>

                <span className="max-w-28 truncate text-sm font-medium text-gray-700">
                  {user.name}
                </span>

                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Switch account
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Login
              </button>

              <button
                onClick={handleCreateAccount}
                className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:bg-primary/90"
              >
                Create account
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;