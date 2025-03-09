import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { X, Upload, Image as ImageIcon, Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.coerce
    .number()
    .min(0.01, "Price must be greater than 0")
    .max(1000, "Price must be less than 1000"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  weight: z.string().optional(),
  servings: z.coerce.number().int().min(1).optional(),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  ingredients: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
}

interface CakeFormProps {
  cake?: any;
  categories: Category[];
  onSubmit: (values: any, images: File[]) => Promise<void>;
  isLoading: boolean;
}

const CakeForm = ({
  cake,
  categories = [],
  onSubmit,
  isLoading = false,
}: CakeFormProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(
    cake?.images || [cake?.image].filter(Boolean) || [],
  );
  const [ingredients, setIngredients] = useState<string[]>(
    cake?.ingredients || [],
  );
  const [newIngredient, setNewIngredient] = useState("");
  const [suggestedIngredients, setSuggestedIngredients] = useState<string[]>(
    [],
  );
  const [ingredientPopoverOpen, setIngredientPopoverOpen] = useState(false);

  useEffect(() => {
    // Fetch all unique ingredients from the database
    const fetchIngredients = async () => {
      try {
        const { data, error } = await supabase
          .from("cake_ingredients")
          .select("name")
          .order("name");

        if (error) throw error;

        // Extract unique ingredient names
        const uniqueIngredients = Array.from(
          new Set(data.map((item) => item.name)),
        );

        setSuggestedIngredients(uniqueIngredients);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: cake?.name || "",
      price: cake?.price || 0,
      description: cake?.description || "",
      weight: cake?.weight || "",
      servings: cake?.servings || undefined,
      categories: cake?.categories || [],
      ingredients: cake?.ingredients || [],
    },
  });

  // Update form values when cake data changes
  useEffect(() => {
    if (cake) {
      form.reset({
        name: cake.name || "",
        price: cake.price || 0,
        description: cake.description || "",
        weight: cake.weight || "",
        servings: cake.servings || undefined,
        categories: cake.categories || [],
        ingredients: cake.ingredients || [],
      });

      // Update ingredients state
      setIngredients(cake.ingredients || []);

      // Update image URLs
      setImageUrls(cake.images || [cake.image].filter(Boolean) || []);
    }
  }, [cake, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);

      // Create preview URLs
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      const updatedIngredients = [...ingredients, newIngredient.trim()];
      setIngredients(updatedIngredients);
      form.setValue("ingredients", updatedIngredients);
      setNewIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    const updatedIngredients = ingredients.filter(
      (item) => item !== ingredient,
    );
    setIngredients(updatedIngredients);
    form.setValue("ingredients", updatedIngredients);
  };

  const handleFormSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values, images);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cake Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Chocolate Delight Cake"
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
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₱)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="29.99"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1.5 kg"
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
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servings (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="12"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A rich, moist chocolate cake with layers of ganache..."
                      className="min-h-[120px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Categories</FormLabel>
                    <FormDescription>
                      Select at least one category for this cake.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <FormField
                        key={category.id}
                        control={form.control}
                        name="categories"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={category.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          category.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== category.id,
                                          ),
                                        );
                                  }}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {category.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ingredients"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Ingredients</FormLabel>
                    <FormDescription>
                      Select ingredients used in this cake or add custom ones.
                    </FormDescription>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {suggestedIngredients.map((ingredient) => (
                      <FormItem
                        key={ingredient}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={ingredients.includes(ingredient)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const updatedIngredients = [
                                  ...ingredients,
                                  ingredient,
                                ];
                                setIngredients(updatedIngredients);
                                form.setValue(
                                  "ingredients",
                                  updatedIngredients,
                                );
                              } else {
                                const updatedIngredients = ingredients.filter(
                                  (i) => i !== ingredient,
                                );
                                setIngredients(updatedIngredients);
                                form.setValue(
                                  "ingredients",
                                  updatedIngredients,
                                );
                              }
                            }}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {ingredient}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>

                  <div className="flex space-x-2 mb-2">
                    <Input
                      placeholder="Add custom ingredient"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addIngredient();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addIngredient}
                      disabled={isLoading || !newIngredient.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {ingredients
                      .filter(
                        (ingredient) =>
                          !suggestedIngredients.includes(ingredient),
                      )
                      .map((ingredient, index) => (
                        <div
                          key={`${ingredient}-${index}`}
                          className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {ingredient}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1 p-0"
                            onClick={() => removeIngredient(ingredient)}
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Images</FormLabel>
              <FormDescription className="mb-2">
                Upload images of the cake. The first image will be used as the
                main image.
              </FormDescription>

              <div className="grid grid-cols-3 gap-2 mb-2">
                {imageUrls.map((url, index) => (
                  <div
                    key={`image-${index}`}
                    className="relative aspect-square rounded-md overflow-hidden border"
                  >
                    <img
                      src={url}
                      alt={`Cake preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(index)}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {imageUrls.length < 5 && (
                  <label className="border border-dashed rounded-md flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-gray-50 aspect-square">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                    <Upload className="h-6 w-6 mb-2 text-gray-400" />
                    <span className="text-xs text-gray-500">Add Image</span>
                  </label>
                )}
              </div>

              {imageUrls.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      No images uploaded yet
                    </p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        multiple
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isLoading}
                      >
                        Upload Images
                      </Button>
                    </label>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : cake ? "Update Cake" : "Add Cake"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CakeForm;
