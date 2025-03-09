import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
}

const EditCategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);

        // In a real app, this would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('categories')
        //   .select('*')
        //   .eq('id', id)
        //   .single();
        // if (error) throw error;

        // For demo purposes, using sample data
        const sampleCategory = {
          id: id || "1",
          name:
            id === "Chocolate"
              ? "Chocolate"
              : id === "Vanilla"
                ? "Vanilla"
                : id === "Strawberry"
                  ? "Strawberry"
                  : id === "Birthday"
                    ? "Birthday"
                    : "Sample Category",
        };

        // Simulate API delay
        setTimeout(() => {
          setCategory(sampleCategory);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching category:", error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  const handleSubmit = async (values: { name: string }) => {
    try {
      setIsSaving(true);

      if (!category || !category.id) {
        throw new Error("Category ID is missing");
      }

      const { error } = await supabase
        .from("categories")
        .update({
          name: values.name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", category.id);

      if (error) throw error;

      // Redirect to categories list
      navigate("/admin/categories");
    } catch (error) {
      console.error("Error updating category:", error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Category</h1>
        </div>
        <div className="border rounded-md p-6 bg-white flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Category</h1>
        </div>
        <div className="border rounded-md p-6 bg-white">
          <p className="text-center text-muted-foreground">
            Category not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Category</h1>
      </div>

      <div className="border rounded-md p-6 bg-white">
        <CategoryForm
          category={category}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
};

export default EditCategoryPage;
