import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CakeForm from "@/components/admin/cakes/CakeForm";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
}

const EditCakePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cake, setCake] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch cake data
        const { data: cakeData, error: cakeError } = await supabase
          .from("cakes")
          .select("*")
          .eq("id", id)
          .single();

        if (cakeError) throw cakeError;

        // Fetch cake categories
        const { data: cakeCategories, error: categoriesError } = await supabase
          .from("cake_categories")
          .select("category_id")
          .eq("cake_id", id);

        if (categoriesError) throw categoriesError;

        // Fetch cake ingredients
        const { data: cakeIngredients, error: ingredientsError } =
          await supabase
            .from("cake_ingredients")
            .select("name")
            .eq("cake_id", id);

        if (ingredientsError) throw ingredientsError;

        // Fetch cake images
        const { data: cakeImages, error: imagesError } = await supabase
          .from("cake_images")
          .select("url")
          .eq("cake_id", id)
          .order("position", { ascending: true });

        if (imagesError) throw imagesError;

        // Format cake data
        const formattedCake = {
          ...cakeData,
          categories: cakeCategories.map((c) => c.category_id),
          ingredients: cakeIngredients.map((i) => i.name),
          images: cakeImages.map((i) => i.url),
          image: cakeImages.length > 0 ? cakeImages[0].url : null,
        };

        console.log("Formatted cake data:", formattedCake);

        setCake(formattedCake);

        // Fetch all categories
        const { data: allCategories, error: allCategoriesError } =
          await supabase
            .from("categories")
            .select("*")
            .order("name", { ascending: true });

        if (allCategoriesError) throw allCategoriesError;

        setCategories(allCategories || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (values: any, images: File[]) => {
    try {
      setIsSaving(true);

      if (!cake || !cake.id) {
        throw new Error("Cake ID is missing");
      }

      // Update cake data
      const { error: cakeError } = await supabase
        .from("cakes")
        .update({
          name: values.name,
          price: values.price,
          description: values.description,
          weight: values.weight || null,
          servings: values.servings || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cake.id);

      if (cakeError) throw cakeError;

      // Upload new images to storage
      if (images.length > 0) {
        // Get current highest position
        const { data: existingImages } = await supabase
          .from("cake_images")
          .select("position")
          .eq("cake_id", cake.id)
          .order("position", { ascending: false });

        let startPosition = 0;
        if (existingImages && existingImages.length > 0) {
          startPosition = existingImages[0].position + 1;
        }

        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${cake.id}/${Date.now()}-${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("cake-images")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("cake-images").getPublicUrl(fileName);

          // Insert image URL to database
          await supabase.from("cake_images").insert({
            cake_id: cake.id,
            url: publicUrl,
            position: startPosition + i,
          });
        }
      }

      // Update ingredients - first delete existing ones
      await supabase.from("cake_ingredients").delete().eq("cake_id", cake.id);

      // Then add new ingredients
      if (values.ingredients && values.ingredients.length > 0) {
        const ingredientsToInsert = values.ingredients.map((name: string) => ({
          cake_id: cake.id,
          name,
        }));

        const { error: ingredientsError } = await supabase
          .from("cake_ingredients")
          .insert(ingredientsToInsert);

        if (ingredientsError) throw ingredientsError;
      }

      // Update categories - first delete existing ones
      await supabase.from("cake_categories").delete().eq("cake_id", cake.id);

      // Then add new categories
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
            cake_id: cake.id,
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
      console.error("Error updating cake:", error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Cake</h1>
        </div>
        <div className="border rounded-md p-6 bg-white flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Cake</h1>
        </div>
        <div className="border rounded-md p-6 bg-white">
          <p className="text-center text-muted-foreground">Cake not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Cake</h1>
      </div>

      <div className="border rounded-md p-6 bg-white">
        <CakeForm
          cake={cake}
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
};

export default EditCakePage;
