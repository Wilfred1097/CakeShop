import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface CartItem {
  id: string;
  cake_id: string;
  quantity: number;
  cake: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface UserProfile {
  id: string;
  full_name: string;
  address: string;
  phone_number: string;
}

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  additionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [shopProfile, setShopProfile] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      address: "",
      phoneNumber: "",
      additionalNotes: "",
    },
  });

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
        form.setValue("fullName", userData.full_name);
        form.setValue("address", userData.address);
        form.setValue("phoneNumber", userData.phone_number);

        // Fetch cart items with cake details
        const { data: cartData, error: cartError } = await supabase
          .from("cart_items")
          .select(
            `
            id,
            cake_id,
            quantity,
            cakes:cake_id (id, name, price)
          `,
          )
          .eq("user_id", userId);

        if (cartError) throw cartError;

        if (cartData.length === 0) {
          navigate("/");
          return;
        }

        // Fetch cake images
        const cartItemsWithImages = await Promise.all(
          cartData.map(async (item) => {
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

        setCartItems(cartItemsWithImages);

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
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load checkout data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, form]);

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.cake.price * item.quantity,
      0,
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    // You can add shipping cost or other fees here
    return subtotal;
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const total = calculateTotal();

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_address: values.address,
          phone_number: values.phoneNumber,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: orderData.id,
        cake_id: item.cake_id,
        quantity: item.quantity,
        price: item.cake.price,
      }));

      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      // Clear cart
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (clearCartError) throw clearCartError;

      // Navigate to order confirmation
      navigate(`/order-confirmation/${orderData.id}`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      setError(error.message || "Failed to place order");
      setIsSubmitting(false);
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
          cartItemCount={cartItems.length}
        />
      )}

      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="123 Main St, City, Country"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+63 912 345 6789"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Special instructions for delivery"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4 lg:hidden">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting
                            ? "Processing..."
                            : `Place Order - ₱${calculateTotal().toFixed(2)}`}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center py-2">
                        <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={item.cake.image}
                            alt={item.cake.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-sm">
                            {item.cake.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            ₱{item.cake.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="ml-4 font-medium text-sm">
                          ₱{(item.cake.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₱{calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between py-2 text-lg font-bold">
                        <span>Total</span>
                        <span>₱{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="hidden lg:block pt-4">
                      <Button
                        onClick={form.handleSubmit(onSubmit)}
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Place Order"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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

export default Checkout;
