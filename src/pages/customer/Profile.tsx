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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  gender: z.enum(["male", "female", "other"]),
});

type FormValues = z.infer<typeof formSchema>;

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shopProfile, setShopProfile] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      address: "",
      phoneNumber: "",
      gender: "male",
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

        // Set form values
        form.setValue("fullName", userData.full_name);
        form.setValue("address", userData.address);
        form.setValue("phoneNumber", userData.phone_number);
        form.setValue("gender", userData.gender);

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
        setError(error.message || "Failed to load profile data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      // Get user ID
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        navigate("/login");
        return;
      }

      const userId = authData.session.user.id;

      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({
          full_name: values.fullName,
          address: values.address,
          phone_number: values.phoneNumber,
          gender: values.gender,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      setSuccess("Profile updated successfully");
      setTimeout(() => {
        navigate("/customer/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
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
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
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
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
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

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => navigate("/customer/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
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

export default CustomerProfile;
