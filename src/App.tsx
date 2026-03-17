import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import WhatsAppButton from "@/components/WhatsAppButton";

import Index from "./pages/Index";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import MyOrders from "./pages/MyOrders";
import MyAccount from "./pages/MyAccount";
import NotFound from "./pages/NotFound";

import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Coupons from "./pages/admin/Coupons";
import Banners from "./pages/admin/Banners";
import Reports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/carrinho" element={<CartPage />} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/minha-conta" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
              <Route path="/meus-pedidos" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/produto/:slug" element={<ProductPage />} />
              <Route path="/:slug" element={<CategoryPage />} />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="orders" element={<Orders />} />
                <Route path="customers" element={<Customers />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="banners" element={<Banners />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
