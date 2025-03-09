import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Package, ShoppingBag, User, MapPin } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string;
  address: string;
  phone_number: string;
  gender: string;
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [shopProfile, setShopProfile] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is logged in
        const { data: authData } = await supabase.auth.getSession();
        if (!authData.session) {
          navigate("/login");
          return;
        }

        const userId = authData.session.user.id;

        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (userError) throw userError;
        setUser(userData);

        // Fetch recent orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(3);

        if (ordersError) throw ordersError;
        setRecentOrders(ordersData || []);

        // Fetch cart count
        const { count, error: cartError } = await supabase
          .from("cart_items")
          .select("*", { count: "exact" })
          .eq("user_id", userId);

        if (cartError) throw cartError;
        setCartCount(count || 0);

        // Fetch shop profile
        const { data: profileData, error: profileError } = await supabase
          .from("shop_profile")
          .select("*")
          .limit(1)
          .single();

        if (profileError && profileError.code !== "PGRST116")
          throw profileError;

        if (profileData) {
          const formattedProfile = {
            shopName: profileData.shop_name,
            address: profileData.address,
            phone: profileData.phone,
            email: profileData.email,
            aboutUs: profileData.about_us,
            socialLinks: {
              facebook: profileData.facebook_url || "",
              instagram: profileData.instagram_url || "",
              twitter: profileData.twitter_url || "",
              github: profileData.github_url || "",
            },
            logo:
              profileData.logo_url ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=cake",
          };

          setShopProfile(formattedProfile);
        }

        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load dashboard data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {shopProfile && (
          <Header
            shopName={shopProfile.shopName}
            isLoggedIn={true}
            cartItemCount={cartCount}
          />
        )}
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        {shopProfile && (
          <Footer
            shopName={shopProfile.shopName}
            address={shopProfile.address}
            phone={shopProfile.phone}
            email={shopProfile.email}
            socialLinks={shopProfile.socialLinks}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {shopProfile && (
        <Header
          shopName={shopProfile.shopName}
          isLoggedIn={true}
          cartItemCount={cartCount}
        />
      )}

      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground mb-8">
            Welcome back, {user?.full_name}!
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <User className="mr-2 h-5 w-5" /> My Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {user?.full_name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Gender:</span>{" "}
                    {user?.gender.charAt(0).toUpperCase() +
                      user?.gender.slice(1)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span>{" "}
                    {user?.phone_number}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => navigate("/customer/profile")}
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="mr-2 h-5 w-5" /> My Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{user?.address}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/customer/profile")}
                >
                  Update Address
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" /> My Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  You have {cartCount} item{cartCount !== 1 && "s"} in your cart
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // Open cart drawer by simulating a click on the cart icon
                    const cartButton = document.querySelector(
                      '[aria-label="Open cart"]',
                    ) as HTMLButtonElement;
                    if (cartButton) {
                      cartButton.click();
                    }
                  }}
                >
                  View Cart
                </Button>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No Orders Yet</CardTitle>
                <CardDescription className="text-center mb-6">
                  You haven't placed any orders yet. Start shopping to place
                  your first order!
                </CardDescription>
                <Button onClick={() => navigate("/")}>Browse Cakes</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription>
                          Placed on {formatDate(order.created_at)}
                        </CardDescription>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">
                        Total: ₱{order.total_amount.toFixed(2)}
                      </p>
                      <Button
                        onClick={() =>
                          navigate(`/order-confirmation/${order.id}`)
                        }
                        variant="outline"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {recentOrders.length > 0 && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={() => navigate("/orders")}>
                    View All Orders
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {shopProfile && (
        <Footer
          shopName={shopProfile.shopName}
          address={shopProfile.address}
          phone={shopProfile.phone}
          email={shopProfile.email}
          socialLinks={shopProfile.socialLinks}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
