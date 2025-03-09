import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CakeCardProps {
  id?: string;
  name?: string;
  price?: number;
  description?: string;
  image?: string;
  categories?: string[];
  onClick?: () => void;
}

const CakeCard = ({
  id = "1",
  name = "Chocolate Delight Cake",
  price = 29.99,
  description = "A rich, moist chocolate cake with layers of ganache and chocolate frosting. Perfect for any celebration or chocolate lover.",
  image = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
  categories = ["Chocolate", "Birthday", "Bestseller"],
  onClick = () => console.log("Cake card clicked"),
}: CakeCardProps) => {
  return (
    <Card
      className="w-full max-w-[350px] h-[450px] overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-white"
      onClick={onClick}
    >
      <div className="relative w-full h-[220px] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-semibold">
          ₱{price.toFixed(2)}
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold truncate">{name}</CardTitle>
        <div className="flex flex-wrap gap-1 mt-2">
          {categories.map((category, index) => (
            <Badge
              key={`${id}-category-${index}`}
              variant="secondary"
              className="text-xs"
            >
              {category}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 line-clamp-4">{description}</p>
      </CardContent>

      <CardFooter className="pt-2 border-t">
        <button
          className={cn(
            "w-full py-2 rounded-md font-medium text-sm",
            "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          )}
        >
          View Details
        </button>
      </CardFooter>
    </Card>
  );
};

export default CakeCard;
