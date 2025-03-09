import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface OrderItem {
  id: string;
  cake_id: string;
  quantity: number;
  price: number;
  cake: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  phone_number: string;
  created_at: string;
  items: OrderItem[];
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopProfile, setShopProfile] = useState<any>(null);

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

        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", userId)
          .single();

        if (orderError) throw orderError;

        // Fetch order items
        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from("order_items")
          .select(
            `
            id,
            cake_id,
            quantity,
            price,
            cakes:cake_id (id, name)
          `,
          )
          .eq("order_id", orderId);

        if (orderItemsError) throw orderItemsError;

        // Fetch cake images
        const orderItemsWithImages = await Promise.all(
          orderItemsData.map(async (item) => {
            const { data: imageData } = await supabase
              .from("cake_images")
              .select("url")
              .eq("cake_id", item.cake_id)
              .order("position", { ascending: true })
              .limit(1);

            const image =
              imageData && imageData.length > 0
                ? imageData[0].url
                : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80";

            return {
              ...item,
              cake: {
                ...item.cakes,
                image,
              },
            };
          }),
        );

        setOrder({
          ...orderData,
          items: orderItemsWithImages,
        });

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
        console.error("Error fetching order:", error);
        setError(error.message || "Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchData();
    }
  }, [orderId, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <div className="max-w-3xl mx-auto px-4">
          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="text-center mb-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                <p className="text-muted-foreground">
                  Thank you for your order. We've received your order and will
                  begin processing it right away.
                </p>
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Order #{order?.id.slice(0, 8)}</span>
                    <span className="text-sm font-normal bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {order?.status.toUpperCase()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Order Date
                        </h3>
                        <p>
                          {order?.created_at && formatDate(order.created_at)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Total Amount
                        </h3>
                        <p className="font-bold">
                          ₱{order?.total_amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Shipping Address
                        </h3>
                        <p>{order?.shipping_address}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Phone Number
                        </h3>
                        <p>{order?.phone_number}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium mb-4">Order Items</h3>
                      <div className="space-y-4">
                        {order?.items.map((item) => (
                          <div key={item.id} className="flex items-center py-2">
                            <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                              <img
                                src={item.cake.image}
                                alt={item.cake.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="font-medium">{item.cake.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                ₱{item.price.toFixed(2)} x {item.quantity}
                              </p>
                            </div>
                            <div className="ml-4 font-medium">
                              ₱{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center space-x-4">
                <Button onClick={() => navigate("/")} variant="outline">
                  Continue Shopping
                </Button>
                <Button onClick={() => navigate("/orders")}>View Orders</Button>
              </div>
            </>
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

export default OrderConfirmation;
