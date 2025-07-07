import HomePage from "../pages/home/home-page";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly
} from "../utils/auth";
import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";
import DetailPage from "../pages/detail/detail-page";
import AddPage from "../pages/add/add-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import NotFound from "../pages/not-found/not-found";

const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  "/home": () => new HomePage(),
  "/detail/:id": () => new DetailPage(),
  "/add": () => new AddPage(),
  "/bookmark": () => new BookmarkPage(),
  "*": () => new NotFound()
};

export default routes;
