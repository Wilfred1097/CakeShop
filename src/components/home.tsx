import React, { useState, useEffect } from "react";
import Header from "./layout/Header";
import CakeFilters from "./cakes/CakeFilters";
import CakeGrid from "./cakes/CakeGrid";
import CakeDetailModal from "./cakes/CakeDetailModal";
import Footer from "./layout/Footer";
import { supabase } from "@/lib/supabase";

interface Cake {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  categories: string[];
  ingredients?: string[];
  images?: string[];
  weight?: string;
  servings?: number;
}

interface Category {
  id: string;
  name: string;
}

interface ShopProfile {
  shopName: string;
  address: string;
  phone: string;
  email: string;
  aboutUs: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    github: string;
  };
  logo: string;
}

const Home = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch cakes with their primary image
        const { data: cakesData, error: cakesError } = await supabase.from(
          "cakes",
        ).select(`
            id, 
            name, 
            price, 
            description,
            weight,
            servings
          `);

        if (cakesError) throw cakesError;

        // For each cake, fetch its categories, ingredients and images
        const cakesWithDetails = await Promise.all(
          cakesData.map(async (cake) => {
            // Get categories
            const { data: categoriesData } = await supabase
              .from("cake_categories")
              .select(
                `
              categories(id, name)
            `,
              )
              .eq("cake_id", cake.id);

            const categories =
              categoriesData?.map((item) => item.categories.name) || [];

            // Get ingredients
            const { data: ingredientsData } = await supabase
              .from("cake_ingredients")
              .select("name")
              .eq("cake_id", cake.id);

            const ingredients = ingredientsData?.map((item) => item.name) || [];

            // Get images
            const { data: imagesData } = await supabase
              .from("cake_images")
              .select("url")
              .eq("cake_id", cake.id)
              .order("position", { ascending: true });

            const images = imagesData?.map((item) => item.url) || [];
            const image =
              images.length > 0
                ? images[0]
                : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80";

            return {
              ...cake,
              categories,
              ingredients,
              images,
              image,
            };
          }),
        );

        setCakes(cakesWithDetails);

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
        } else {
          // Default profile if none exists
          setShopProfile({
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
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  const handleCakeClick = (cake: Cake) => {
    setSelectedCake({
      ...cake,
      images: cake.images || [cake.image],
    });
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {shopProfile && (
        <Header
          shopName={shopProfile.shopName}
          isLoggedIn={false}
          cartItemCount={0}
        />
      )}

      <main className="flex-grow">
        <section className="w-full max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Our Delicious Cakes
          </h1>

          <CakeFilters
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onClearFilters={handleClearFilters}
          />

          <CakeGrid
            cakes={cakes}
            isLoading={isLoading}
            onCakeClick={handleCakeClick}
            selectedCategories={selectedCategories.map((c) => c.toLowerCase())}
          />
        </section>
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

      {selectedCake && (
        <CakeDetailModal
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          cake={{
            id: selectedCake.id,
            name: selectedCake.name,
            price: selectedCake.price,
            description: selectedCake.description,
            categories: selectedCake.categories,
            images: selectedCake.images || [selectedCake.image],
            ingredients: selectedCake.ingredients,
            weight: selectedCake.weight,
            servings: selectedCake.servings,
          }}
        />
      )}
    </div>
  );
};

export default Home;
