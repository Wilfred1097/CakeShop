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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shopName, setShopName] = useState("Sweet Delights Bakery");
  const [shopLogo, setShopLogo] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=cake",
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Check if user is admin
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_type")
          .eq("id", data.session.user.id)
          .single();

        if (!userError && userData.user_type === "admin") {
          navigate("/admin");
        }
      }
    };

    const fetchShopProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("shop_profile")
          .select("shop_name, logo_url")
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching shop profile:", error);
          return;
        }

        if (data) {
          setShopName(data.shop_name);
          if (data.logo_url) {
            setShopLogo(data.logo_url);
          }
        }
      } catch (error) {
        console.error("Error fetching shop profile:", error);
      }
    };

    checkUser();
    fetchShopProfile();
  }, [navigate]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      // Fetch user type from database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_type")
        .eq("id", data.user.id)
        .single();

      if (userError) throw userError;

      // Check if user is admin
      if (userData.user_type === "admin") {
        navigate("/admin");
      } else {
        // Not an admin, sign out and show error
        await supabase.auth.signOut();
        throw new Error("You do not have admin privileges");
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src={shopLogo} alt={shopName} className="h-16 w-16" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {shopName} - Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to manage your cake shop
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="w-full max-w-md mx-auto bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@example.com"
                          type="email"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col space-y-4">
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="text-center text-sm">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      onClick={() => navigate("/admin/register")}
                    >
                      Register as Admin
                    </Button>
                  </div>

                  <div className="text-center text-sm">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      onClick={() => navigate("/login")}
                    >
                      Customer Login
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
