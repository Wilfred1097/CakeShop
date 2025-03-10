import { Navigate, RouteObject } from "react-router-dom";
import Home from "./components/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CakesPage from "./pages/admin/cakes/CakesPage";
import AddCakePage from "./pages/admin/cakes/AddCakePage";
import EditCakePage from "./pages/admin/cakes/EditCakePage";
import CategoriesPage from "./pages/admin/categories/CategoriesPage";
import AddCategoryPage from "./pages/admin/categories/AddCategoryPage";
import EditCategoryPage from "./pages/admin/categories/EditCategoryPage";
import ShopProfilePage from "./pages/admin/profile/ShopProfilePage";
import OrdersPage from "./pages/admin/orders/OrdersPage";
import OrderDetailPage from "./pages/admin/orders/OrderDetailPage";

// Import the new pages
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerProfile from "./pages/customer/Profile";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/register",
    element: <AdminRegister />,
  },
  {
    path: "/register-success",
    element: <RegisterSuccess />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/order-confirmation/:orderId",
    element: <OrderConfirmation />,
  },
  {
    path: "/orders",
    element: <Orders />,
  },
  {
    path: "/customer/dashboard",
    element: <CustomerDashboard />,
  },
  {
    path: "/customer/profile",
    element: <CustomerProfile />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        path: "",
        element: <AdminDashboard />,
      },
      {
        path: "cakes",
        element: <CakesPage />,
      },
      {
        path: "cakes/new",
        element: <AddCakePage />,
      },
      {
        path: "cakes/edit/:id",
        element: <EditCakePage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "categories/new",
        element: <AddCategoryPage />,
      },
      {
        path: "categories/edit/:id",
        element: <EditCategoryPage />,
      },
      {
        path: "profile",
        element: <ShopProfilePage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "orders/:orderId",
        element: <OrderDetailPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;
