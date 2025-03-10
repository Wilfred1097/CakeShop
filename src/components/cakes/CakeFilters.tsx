import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CakeFiltersProps {
  categories?: Category[];
  selectedCategories?: string[];
  onCategoryToggle?: (categoryId: string) => void;
  onClearFilters?: () => void;
}

const CakeFilters = ({
  categories = [
    { id: "1", name: "Chocolate" },
    { id: "2", name: "Vanilla" },
    { id: "3", name: "Strawberry" },
    { id: "4", name: "Birthday" },
    { id: "5", name: "Wedding" },
    { id: "6", name: "Gluten Free" },
    { id: "7", name: "Vegan" },
    { id: "8", name: "Bestseller" },
  ],
  selectedCategories = [],
  onCategoryToggle = (categoryId) =>
    console.log(`Category toggled: ${categoryId}`),
  onClearFilters = () => console.log("Filters cleared"),
}: CakeFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedCategories = isExpanded ? categories : categories.slice(0, 5);

  return (
    <div className="w-full py-4 px-6 border-b bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Filter by Category</h3>
            {selectedCategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear filters
                <X className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {displayedCategories.map((category) => (
              <Badge
                key={category.id}
                variant={
                  selectedCategories.includes(category.name.toLowerCase())
                    ? "default"
                    : "outline"
                }
                className={cn(
                  "cursor-pointer hover:bg-primary/90 transition-colors px-3 py-1",
                  selectedCategories.includes(category.name.toLowerCase())
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-secondary",
                )}
                onClick={() => onCategoryToggle(category.name)}
              >
                {category.name}
              </Badge>
            ))}

            {categories.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-medium"
              >
                {isExpanded ? "Show less" : `+${categories.length - 5} more`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CakeFilters;
