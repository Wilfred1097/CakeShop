import React, { useEffect, useState } from "react";
import ShopProfileForm from "@/components/admin/profile/ShopProfileForm";
import { supabase } from "@/lib/supabase";

const ShopProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("shop_profile")
          .select("*")
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        // If profile exists, format it for our component
        if (data) {
          const formattedProfile = {
            shopName: data.shop_name,
            address: data.address,
            phone: data.phone,
            email: data.email,
            aboutUs: data.about_us,
            socialLinks: {
              facebook: data.facebook_url || "",
              instagram: data.instagram_url || "",
              twitter: data.twitter_url || "",
              github: data.github_url || "",
            },
            logo:
              data.logo_url ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=cake",
          };

          setProfile(formattedProfile);
        } else {
          // Use default profile if none exists
          const defaultProfile = {
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
          };

          setProfile(defaultProfile);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching shop profile:", error);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (values: any, logo?: File) => {
    try {
      setIsSaving(true);

      let logoUrl = profile?.logo || null;

      // Upload logo if provided
      if (logo) {
        const fileExt = logo.name.split(".").pop();
        const fileName = `shop-logo-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("shop")
          .upload(fileName, logo, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("shop").getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("shop_profile")
        .select("id")
        .limit(1);

      let profileData = {
        shop_name: values.shopName,
        address: values.address,
        phone: values.phone,
        email: values.email,
        about_us: values.aboutUs,
        logo_url: logoUrl,
        facebook_url: values.socialLinks?.facebook || null,
        instagram_url: values.socialLinks?.instagram || null,
        twitter_url: values.socialLinks?.twitter || null,
        github_url: values.socialLinks?.github || null,
        updated_at: new Date().toISOString(),
      };

      if (existingProfile && existingProfile.length > 0) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("shop_profile")
          .update(profileData)
          .eq("id", existingProfile[0].id);

        if (updateError) throw updateError;
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from("shop_profile")
          .insert(profileData);

        if (insertError) throw insertError;
      }

      // Update local state
      setProfile({
        ...profile,
        ...values,
        logo: logoUrl,
      });

      setIsSaving(false);
    } catch (error) {
      console.error("Error updating shop profile:", error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shop Profile</h1>
        </div>
        <div className="border rounded-md p-6 bg-white flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shop Profile</h1>
      </div>

      <div className="border rounded-md p-6 bg-white">
        <ShopProfileForm
          profile={profile}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
};

export default ShopProfilePage;
