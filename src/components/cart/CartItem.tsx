import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem = ({
  id,
  name,
  price,
  image,
  quantity,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) => {
  const handleIncrement = () => {
    onUpdateQuantity(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(id, quantity - 1);
    }
  };

  return (
    <div className="flex items-center py-4 border-b">
      <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>

      <div className="ml-4 flex-1">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-muted-foreground">₱{price.toFixed(2)}</p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrement}
            disabled={quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrement}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onRemove(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="ml-4 w-20 text-right font-medium">
        ₱{(price * quantity).toFixed(2)}
      </div>
    </div>
  );
};

export default CartItem;
