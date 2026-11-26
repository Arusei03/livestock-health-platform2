import { Outlet } from "react-router-dom";
import Header from "../modules/header/page";
import Footer from "../modules/footer/page";
import useUser from "../hooks/userUser";

const AppLayout = () => {
  const { user, isLoading } = useUser();

  return (
    <div>
      <div>
        <div>
          <Header
            user={user}
            isUserLoading={isLoading}
            showNotifications
            onNotifications={() => {}}
          />
        </div>

        <div>
          {/* Navigation */}
        </div>

        <div>
          <Outlet />
        </div>

        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;