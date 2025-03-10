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
import { AlertCircle, Package } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  itemCount: number;
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopProfile, setShopProfile] = useState<any>(null);
  const [authData, setAuthData] = useState<any>(null);

  useEffect(() => {
    const fetchAuthData = async () => {
      const { data } = await supabase.auth.getSession();
      setAuthData(data);
      return data;
    };

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is logged in
        const authDataResult = await fetchAuthData();
        if (!authDataResult.session) {
          navigate("/login");
          return;
        }

        const userId = authDataResult.session.user.id;

        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        // Fetch order items count for each order
        const ordersWithItemCount = await Promise.all(
          ordersData.map(async (order) => {
            const { count, error: countError } = await supabase
              .from("order_items")
              .select("*", { count: "exact" })
              .eq("order_id", order.id);

            if (countError) throw countError;

            return {
              ...order,
              itemCount: count || 0,
            };
          }),
        );

        setOrders(ordersWithItemCount);

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
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        setError(error.message || "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

    // Set up real-time subscription for order updates
    const setupSubscription = async () => {
      const authDataResult = await fetchAuthData();
      if (!authDataResult.session) return;

      const userId = authDataResult.session.user.id;

      const orderSubscription = supabase
        .channel("orders-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("Order update received:", payload);
            // Refetch orders when an update occurs with a slight delay
            setTimeout(() => {
              fetchOrders();
            }, 500);
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(orderSubscription);
      };
    };

    const unsubscribe = setupSubscription();

    return () => {
      unsubscribe.then((unsub) => unsub && unsub());
    };
  }, [navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {shopProfile && (
          <Header
            shopName={shopProfile.shopName}
            isLoggedIn={true}
            cartItemCount={0}
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
          cartItemCount={0}
        />
      )}

      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : orders.length === 0 ? (
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
              {orders.map((order) => (
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
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status.toUpperCase()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.itemCount} item{order.itemCount !== 1 && "s"}
                        </p>
                        <p className="font-medium">
                          Total: ₱{order.total_amount.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          navigate(`/order-confirmation/${order.id}`)
                        }
                        variant="outline"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

export default Orders;
