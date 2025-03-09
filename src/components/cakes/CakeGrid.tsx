import React, { useState } from "react";
import CakeCard from "./CakeCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Cake {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  categories: string[];
}

interface CakeGridProps {
  cakes?: Cake[];
  isLoading?: boolean;
  onCakeClick?: (cake: Cake) => void;
  selectedCategories?: string[];
}

const CakeGrid = ({
  cakes = [
    {
      id: "1",
      name: "Chocolate Delight Cake",
      price: 29.99,
      description:
        "A rich, moist chocolate cake with layers of ganache and chocolate frosting. Perfect for any celebration or chocolate lover.",
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
      categories: ["Chocolate", "Birthday", "Bestseller"],
    },
    {
      id: "2",
      name: "Strawberry Shortcake",
      price: 24.99,
      description:
        "Light vanilla sponge cake layered with fresh strawberries and whipped cream. A classic favorite for spring and summer.",
      image:
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&q=80",
      categories: ["Fruit", "Summer", "Light"],
    },
    {
      id: "3",
      name: "Red Velvet Dream",
      price: 32.99,
      description:
        "Luxurious red velvet cake with cream cheese frosting. The perfect balance of cocoa flavor with a stunning presentation.",
      image:
        "https://images.unsplash.com/photo-1586788224331-947f68671cf1?w=500&q=80",
      categories: ["Red Velvet", "Cream Cheese", "Special Occasion"],
    },
    {
      id: "4",
      name: "Lemon Blueberry Cake",
      price: 27.99,
      description:
        "Tangy lemon cake studded with fresh blueberries and topped with lemon buttercream. Refreshing and delightful.",
      image:
        "https://images.unsplash.com/photo-1519869325930-281384150729?w=500&q=80",
      categories: ["Fruit", "Citrus", "Summer"],
    },
    {
      id: "5",
      name: "Carrot Cake",
      price: 26.99,
      description:
        "Spiced carrot cake with walnuts and cream cheese frosting. A homestyle favorite with the perfect balance of spices.",
      image:
        "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&q=80",
      categories: ["Spiced", "Nuts", "Classic"],
    },
    {
      id: "6",
      name: "Tiramisu Cake",
      price: 34.99,
      description:
        "Coffee-soaked layers with mascarpone cream and cocoa dusting. An elegant Italian-inspired dessert in cake form.",
      image:
        "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&q=80",
      categories: ["Coffee", "Italian", "Gourmet"],
    },
  ],
  isLoading = false,
  onCakeClick = (cake) => console.log("Cake clicked:", cake),
  selectedCategories = [],
}: CakeGridProps) => {
  // Filter cakes based on selected categories
  const filteredCakes =
    selectedCategories.length > 0
      ? cakes.filter((cake) =>
          cake.categories.some((category) =>
            selectedCategories.includes(category),
          ),
        )
      : cakes;

  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-50 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="w-full h-[450px] bg-white rounded-lg overflow-hidden"
              >
                <Skeleton className="w-full h-[220px]" />
                <div className="p-4">
                  <Skeleton className="w-3/4 h-6 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="w-16 h-5" />
                    <Skeleton className="w-16 h-5" />
                  </div>
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-3/4 h-4 mb-6" />
                  <Skeleton className="w-full h-10 mt-auto" />
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Render empty state
  if (filteredCakes.length === 0) {
    return (
      <div className="w-full h-[750px] bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No cakes found
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedCategories.length > 0
              ? "No cakes match your selected filters. Try selecting different categories or clear your filters."
              : "There are no cakes available at the moment. Please check back later."}
          </p>
          {selectedCategories.length > 0 && (
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              onClick={() => console.log("Clear filters clicked")}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render cake grid
  return (
    <div className="w-full min-h-[750px] bg-gray-50 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {filteredCakes.map((cake) => (
          <CakeCard
            key={cake.id}
            id={cake.id}
            name={cake.name}
            price={cake.price}
            description={cake.description}
            image={cake.image}
            categories={cake.categories}
            onClick={() => onCakeClick(cake)}
          />
        ))}
      </div>
    </div>
  );
};

export default CakeGrid;
