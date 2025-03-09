import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ShoppingCart, AlertCircle } from "lucide-react";
import CartItem from "./CartItem";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  cake_id: string;
  quantity: number;
  cake: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | null;
}

const CartDrawer = ({ open, onOpenChange, userId }: CartDrawerProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && userId) {
      fetchCartItems();
    }
  }, [open, userId]);

  const fetchCartItems = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch cart items with cake details
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          cake_id,
          quantity,
          cakes:cake_id (id, name, price)
        `,
        )
        .eq("user_id", userId);

      if (error) throw error;

      // Fetch cake images
      const cartItemsWithImages = await Promise.all(
        data.map(async (item) => {
          const { data: imageData } = await supabase
            .from("cake_images")
            .select("url")
            .eq("cake_id", item.cake_id)
            .order("position", { ascending: true })
            .limit(1);

          const image =
            imageData && imageData.length > 0
              ? imageData[0].url
              : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80";

          return {
            ...item,
            cake: {
              ...item.cakes,
              image,
            },
          };
        }),
      );

      setCartItems(cartItemsWithImages);
    } catch (error: any) {
      console.error("Error fetching cart items:", error);
      setError(error.message || "Failed to load cart items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    } catch (error: any) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);

      if (error) throw error;

      // Update local state
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Error removing item:", error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.cake.price * item.quantity,
      0,
    );
  };

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" /> Your Cart
          </DrawerTitle>
          <DrawerDescription>
            {cartItems.length === 0 && !isLoading
              ? "Your cart is empty"
              : `You have ${cartItems.length} item${cartItems.length !== 1 ? "s" : ""} in your cart`}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 overflow-y-auto max-h-[calc(85vh-200px)]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-destructive">{error}</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Your cart is empty. Add some delicious cakes!
              </p>
              <Button onClick={() => onOpenChange(false)}>Browse Cakes</Button>
            </div>
          ) : (
            <div className="space-y-1">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  id={item.id}
                  name={item.cake.name}
                  price={item.cake.price}
                  image={item.cake.image}
                  quantity={item.quantity}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="px-4 py-2 border-t">
            <div className="flex justify-between py-2">
              <span className="font-medium">Subtotal</span>
              <span className="font-medium">
                ₱{calculateTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-sm text-muted-foreground">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>Total</span>
              <span>₱{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        )}

        <DrawerFooter>
          {cartItems.length > 0 && (
            <Button onClick={handleCheckout} className="w-full">
              Proceed to Checkout
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
