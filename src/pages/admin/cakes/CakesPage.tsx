import React, { useEffect, useState } from "react";
import CakeList from "@/components/admin/cakes/CakeList";
import { supabase } from "@/lib/supabase";

interface Cake {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  categories: string[];
}

const CakesPage = () => {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        setIsLoading(true);

        // Fetch cakes with their primary image
        const { data: cakesData, error: cakesError } = await supabase.from(
          "cakes",
        ).select(`
            id, 
            name, 
            price, 
            description
          `);

        if (cakesError) throw cakesError;

        // For each cake, fetch its categories and primary image
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

            // Get primary image (position 0 or first available)
            const { data: imagesData } = await supabase
              .from("cake_images")
              .select("url")
              .eq("cake_id", cake.id)
              .order("position", { ascending: true })
              .limit(1);

            const image =
              imagesData && imagesData.length > 0
                ? imagesData[0].url
                : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80";

            return {
              ...cake,
              categories,
              image,
            };
          }),
        );

        setCakes(cakesWithDetails);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching cakes:", error);
        setIsLoading(false);
      }
    };

    fetchCakes();
  }, []);

  const handleDeleteCake = async (id: string) => {
    try {
      // Delete cake images from storage first
      const { data: images } = await supabase
        .from("cake_images")
        .select("url")
        .eq("cake_id", id);

      if (images && images.length > 0) {
        // Extract file paths from URLs
        for (const image of images) {
          const url = new URL(image.url);
          const path = url.pathname.split("/").slice(-2).join("/");

          if (path) {
            await supabase.storage.from("cake-images").remove([path]);
          }
        }
      }

      // Delete the cake (cascade will handle related records)
      const { error } = await supabase.from("cakes").delete().eq("id", id);

      if (error) throw error;

      // Update local state
      setCakes((prev) => prev.filter((cake) => cake.id !== id));
    } catch (error) {
      console.error("Error deleting cake:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cake Listings</h1>
      <p className="text-muted-foreground">
        Manage your cake listings, add new cakes, or update existing ones.
      </p>

      <CakeList
        cakes={cakes}
        isLoading={isLoading}
        onDeleteCake={handleDeleteCake}
      />
    </div>
  );
};

export default CakesPage;
