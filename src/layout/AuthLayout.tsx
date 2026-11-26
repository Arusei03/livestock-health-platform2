import { Outlet } from "react-router-dom";
import Header from "../modules/header/page";
import Footer from "../modules/footer/page";

const AuthLayout = () => {
  return (
    <div>
      <div>
        <div>
          <Header/>
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

export default AuthLayout;