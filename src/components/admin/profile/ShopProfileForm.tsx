import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Image as ImageIcon } from "lucide-react";

const formSchema = z.object({
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  aboutUs: z.string().min(10, "About us must be at least 10 characters"),
  socialLinks: z.object({
    facebook: z
      .string()
      .url("Must be a valid URL")
      .or(z.literal(""))
      .optional(),
    instagram: z
      .string()
      .url("Must be a valid URL")
      .or(z.literal(""))
      .optional(),
    twitter: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
    github: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ShopProfileFormProps {
  profile?: any;
  onSubmit: (values: FormValues, logo?: File) => Promise<void>;
  isLoading: boolean;
}

const ShopProfileForm = ({
  profile = {
    shopName: "Sweet Delights Bakery",
    address: "123 Cake Street, Dessert Town, DT 12345",
    phone: "+1 (555) 123-4567",
    email: "info@sweetdelightsbakery.com",
    aboutUs:
      "Sweet Delights Bakery has been serving delicious cakes and pastries since 2010. We use only the finest ingredients and traditional baking methods to create memorable desserts for all occasions.",
    socialLinks: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      github: "https://github.com",
    },
    logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=cake",
  },
  onSubmit,
  isLoading = false,
}: ShopProfileFormProps) => {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(profile?.logo || "");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shopName: profile?.shopName || "",
      address: profile?.address || "",
      phone: profile?.phone || "",
      email: profile?.email || "",
      aboutUs: profile?.aboutUs || "",
      socialLinks: {
        facebook: profile?.socialLinks?.facebook || "",
        instagram: profile?.socialLinks?.instagram || "",
        twitter: profile?.socialLinks?.twitter || "",
        github: profile?.socialLinks?.github || "",
      },
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit(values, logo || undefined);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="about">About Us</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="shopName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sweet Delights Bakery"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="info@example.com"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="123 Cake Street, Dessert Town, DT 12345"
                          className="min-h-[80px]"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Shop Logo</FormLabel>
                <FormDescription className="mb-4">
                  Upload your shop logo. This will be displayed in the header
                  and footer.
                </FormDescription>

                <div className="flex flex-col items-center justify-center">
                  {logoPreview ? (
                    <div className="mb-4">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                        <img
                          src={logoPreview}
                          alt="Shop logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                  )}

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                    >
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="aboutUs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Us</FormLabel>
                  <FormDescription>
                    Write a description about your bakery, its history, values,
                    and what makes it special.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Sweet Delights Bakery has been serving delicious cakes and pastries since 2010..."
                      className="min-h-[200px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="social" className="space-y-6 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="socialLinks.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://facebook.com/yourbakery"
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
                  name="socialLinks.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/yourbakery"
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
                  name="socialLinks.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://twitter.com/yourbakery"
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
                  name="socialLinks.github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/yourbakery"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ShopProfileForm;
