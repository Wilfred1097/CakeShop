import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import { supabase } from "@/lib/supabase";

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: { name: string }) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.from("categories").insert({
        name: values.name,
      });

      if (error) throw error;

      // Redirect to categories list
      navigate("/admin/categories");
    } catch (error) {
      console.error("Error adding category:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Category</h1>
      </div>

      <div className="border rounded-md p-6 bg-white">
        <CategoryForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AddCategoryPage;
