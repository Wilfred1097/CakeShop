import React, { useEffect, useState } from "react";
import CategoryList from "@/components/admin/categories/CategoryList";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;

        setCategories(data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDeleteCategory = async (id: string) => {
    try {
      // Delete the category
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;

      // Update local state
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      <p className="text-muted-foreground">
        Manage your cake categories to help customers find the perfect cake.
      </p>

      <CategoryList
        categories={categories}
        isLoading={isLoading}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
};

export default CategoriesPage;
