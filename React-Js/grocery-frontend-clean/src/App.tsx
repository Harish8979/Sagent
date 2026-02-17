import { useState } from "react";
import "./styles/app.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import DeliveryPage from "./pages/DeliveryPage";
import ProfilePage from "./pages/ProfilePage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OffersPage from "./pages/OffersPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const [page, setPage] = useState("login");
  const [orderId, setOrderId] = useState<number>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (page === "login")
    return <LoginPage onLogin={() => setPage("products")} goToRegister={() => setPage("register")} />;

  if (page === "register")
    return <RegisterPage onRegister={() => setPage("products")} goToLogin={() => setPage("login")} />;

  if (page === "categories")
    return (
      <CategoryPage 
        onCategorySelect={(categoryId) => {
          setSelectedCategoryId(categoryId);
          setPage("products");
        }}
        goToCart={() => setPage("cart")}
        goToProducts={() => setPage("products")}
      />
    );

  if (page === "products")
    return (
      <ProductPage 
        goCart={() => setPage("cart")} 
        categoryId={selectedCategoryId}
        goBack={() => {
          setSelectedCategoryId(null);
          setPage("categories");
        }}
        goToProfile={() => setPage("profile")}
      />
    );

  if (page === "cart")
    return (
      <CartPage
        goPayment={(id: number) => {
          setOrderId(id);
          setPage("payment");
        }}
        goToProducts={() => setPage("products")}
      />
    );

  if (page === "payment")
    return (
      <PaymentPage
        orderId={orderId}
        goDelivery={(id: number) => {
          setOrderId(id);
          setPage("delivery");
        }}
        goToProducts={() => setPage("products")}
      />
    );

  if (page === "delivery")
    return <DeliveryPage orderId={orderId} />;

  if (page === "profile")
    return (
      <ProfilePage
        goToOrders={() => setPage("orders")}
        goToOffers={() => setPage("offers")}
        goToSettings={() => setPage("settings")}
        goBack={() => setPage("products")}
      />
    );

  if (page === "orders")
    return <OrderHistoryPage goBack={() => setPage("profile")} />;

  if (page === "offers")
    return <OffersPage goBack={() => setPage("profile")} />;

  if (page === "settings")
    return <SettingsPage goBack={() => setPage("profile")} />;

  return <DeliveryPage orderId={orderId} />;
}

export default App;
