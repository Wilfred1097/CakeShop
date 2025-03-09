import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CakeForm from "@/components/admin/cakes/CakeForm";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
}

const AddCakePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;

        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (values: any, images: File[]) => {
    try {
      setIsLoading(true);

      // Insert cake data
      const { data: cakeData, error: cakeError } = await supabase
        .from("cakes")
        .insert({
          name: values.name,
          price: values.price,
          description: values.description,
          weight: values.weight || null,
          servings: values.servings || null,
        })
        .select()
        .single();

      if (cakeError) throw cakeError;

      const cakeId = cakeData.id;

      // Upload images to storage
      const imageUrls = [];

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${cakeId}/${i}.${fileExt}`;

          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("cake-images").upload(fileName, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("cake-images").getPublicUrl(fileName);

          imageUrls.push(publicUrl);

          // Insert image URL to database
          await supabase.from("cake_images").insert({
            cake_id: cakeId,
            url: publicUrl,
            position: i,
          });
        }
      }

      // Add ingredients
      if (values.ingredients && values.ingredients.length > 0) {
        const ingredientsToInsert = values.ingredients.map((name: string) => ({
          cake_id: cakeId,
          name,
        }));

        const { error: ingredientsError } = await supabase
          .from("cake_ingredients")
          .insert(ingredientsToInsert);

        if (ingredientsError) throw ingredientsError;

        // Get all unique ingredients for future suggestions
        const uniqueIngredients = new Set(values.ingredients);

        // Check which ingredients are new and need to be added to our suggestions
        for (const ingredient of uniqueIngredients) {
          // We don't need to check if it exists, as duplicate entries in cake_ingredients
          // are fine - they're associated with different cakes
          // This ensures the ingredient will appear in future suggestions
        }
      }

      // Add categories
      if (values.categories && values.categories.length > 0) {
        // First ensure all categories exist
        for (const categoryId of values.categories) {
          // Check if the category exists by ID
          const { data: existingCategory } = await supabase
            .from("categories")
            .select("id")
            .eq("id", categoryId)
            .single();

          if (!existingCategory) {
            // Get the category name from our local state
            const categoryName =
              categories.find((c) => c.id === categoryId)?.name || categoryId;

            // Create the category if it doesn't exist
            await supabase
              .from("categories")
              .insert({ id: categoryId, name: categoryName });
          }
        }

        // Now link categories to the cake
        const categoriesToInsert = values.categories.map(
          (categoryId: string) => ({
            cake_id: cakeId,
            category_id: categoryId,
          }),
        );

        const { error: categoriesError } = await supabase
          .from("cake_categories")
          .insert(categoriesToInsert);

        if (categoriesError) throw categoriesError;
      }

      // Redirect to cakes list
      navigate("/admin/cakes");
    } catch (error) {
      console.error("Error adding cake:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Cake</h1>
      </div>

      <div className="border rounded-md p-6 bg-white">
        <CakeForm
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AddCakePage;
