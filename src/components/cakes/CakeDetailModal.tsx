import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ShoppingCart, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CakeDetailModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  cake?: {
    id: string;
    name: string;
    price: number;
    description: string;
    ingredients?: string[];
    categories: string[];
    images: string[];
    weight?: string;
    servings?: number;
  };
}

const CakeDetailModal = ({
  open = true,
  onOpenChange = () => {},
  cake = {
    id: "1",
    name: "Chocolate Delight Cake",
    price: 29.99,
    description:
      "A rich, moist chocolate cake with layers of ganache and chocolate frosting. Perfect for any celebration or chocolate lover. Made with premium cocoa and fresh ingredients for an unforgettable taste experience.",
    ingredients: [
      "Premium Cocoa",
      "Organic Flour",
      "Free-range Eggs",
      "Belgian Chocolate",
      "Vanilla Extract",
      "Butter",
      "Sugar",
    ],
    categories: ["Chocolate", "Birthday", "Bestseller"],
    images: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
      "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&q=80",
      "https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=800&q=80",
    ],
    weight: "1.5 kg",
    servings: 12,
  },
}: CakeDetailModalProps) => {
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl p-0 overflow-hidden bg-white"
        aria-describedby="cake-detail-description"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left side - Image gallery */}
          <div className="bg-gray-50 p-6 flex flex-col">
            <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-md">
              <img
                src={cake.images[activeImageIndex]}
                alt={cake.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail gallery */}
            <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
              {cake.images.map((image, index) => (
                <div
                  key={`image-thumb-${index}`}
                  className={cn(
                    "w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2",
                    activeImageIndex === index
                      ? "border-primary"
                      : "border-transparent",
                  )}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${cake.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Cake details */}
          <div className="p-6 flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {cake.name}
              </DialogTitle>
              <div className="flex flex-wrap gap-1 mt-2">
                {cake.categories.map((category, index) => (
                  <Badge key={`category-${index}`} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 text-3xl font-bold text-primary">
                ₱{cake.price.toFixed(2)}
              </div>
            </DialogHeader>

            <Separator className="my-4" />

            <div className="space-y-4 flex-grow">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p id="cake-detail-description" className="text-gray-700">
                  {cake.description}
                </p>
              </div>

              {cake.ingredients && (
                <div>
                  <h3 className="font-semibold mb-2">Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {cake.ingredients.map((ingredient, index) => (
                      <Badge key={`ingredient-${index}`} variant="outline">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {cake.weight && (
                  <div>
                    <h3 className="font-semibold text-sm">Weight</h3>
                    <p>{cake.weight}</p>
                  </div>
                )}
                {cake.servings && (
                  <div>
                    <h3 className="font-semibold text-sm">Serves</h3>
                    <p>{cake.servings} people</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="flex-1"
                size="lg"
                onClick={async () => {
                  try {
                    // Check if user is logged in
                    const { data } = await supabase.auth.getSession();
                    if (!data.session) {
                      window.location.href = "/login";
                      return;
                    }

                    // Add to cart
                    const { error } = await supabase.from("cart_items").insert({
                      user_id: data.session.user.id,
                      cake_id: cake.id,
                      quantity: 1,
                    });

                    if (error) {
                      console.error("Error adding to cart:", error);
                      return;
                    }

                    // Close modal and update cart count without page reload
                    onOpenChange(false);

                    // Dispatch a custom event to notify cart components to refresh
                    const event = new CustomEvent("cart-updated");
                    window.dispatchEvent(event);
                  } catch (error) {
                    console.error("Error adding to cart:", error);
                  }
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CakeDetailModal;
