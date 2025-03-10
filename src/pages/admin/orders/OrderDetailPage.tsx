import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrderItem {
  id: string;
  cake_id: string;
  quantity: number;
  price: number;
  cake: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: string;
  phone_number: string;
  user_email: string;
  user_name: string;
  items: OrderItem[];
}

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusAction, setStatusAction] = useState<
    "accepted" | "declined" | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);

      // Fetch order details using RPC function
      const { data: orderData, error: orderError } = await supabase.rpc(
        "get_order_by_id",
        { order_id: orderId },
      );

      if (!orderData || orderData.length === 0) {
        throw new Error("Order not found");
      }

      const order = orderData[0];
      console.log("Order detail data:", order);

      // Get user details directly from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("full_name, email, phone_number")
        .eq("id", order.user_id)
        .single();

      if (userError) {
        console.error("Error fetching user details:", userError);
      }

      if (orderError) throw orderError;

      // Fetch order items
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from("order_items")
        .select(
          `
          id,
          cake_id,
          quantity,
          price,
          cakes:cake_id (id, name)
        `,
        )
        .eq("order_id", orderId);

      if (orderItemsError) throw orderItemsError;

      // Fetch cake images
      const orderItemsWithImages = await Promise.all(
        orderItemsData.map(async (item) => {
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

      setOrder({
        ...order,
        user_email: userData?.email || "Unknown",
        user_name: userData?.full_name || "Unknown",
        items: orderItemsWithImages,
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || !statusAction) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: statusAction,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (error) throw error;

      // Update local state
      setOrder({
        ...order,
        status: statusAction,
      });

      // Refetch order details to ensure we have the latest data
      await fetchOrderDetails();

      setIsDialogOpen(false);
      setStatusAction(null);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const openStatusDialog = (action: "accepted" | "declined") => {
    setStatusAction(action);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/orders")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-medium mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/admin/orders")}>
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/orders")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
              order.status,
            )}`}
          >
            {order.status.toUpperCase()}
          </span>
        </div>

        {order.status === "pending" && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
              onClick={() => openStatusDialog("accepted")}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Accept Order
            </Button>
            <Button
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
              onClick={() => openStatusDialog("declined")}
            >
              <XCircle className="mr-2 h-4 w-4" /> Decline Order
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Order Items */}
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center py-2 border-b last:border-0"
                >
                  <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.cake.image}
                      alt={item.cake.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">{item.cake.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ₱{item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="ml-4 font-medium">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div className="pt-4 border-t">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₱{order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total</span>
                  <span>₱{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Name
                  </h3>
                  <p>{order.user_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </h3>
                  <p>{order.user_email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Phone Number
                  </h3>
                  <p>{order.phone_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Shipping Address
                  </h3>
                  <p>{order.shipping_address}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Order Date
                  </h3>
                  <p>{formatDate(order.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusAction === "accepted"
                ? "Accept this order?"
                : "Decline this order?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction === "accepted"
                ? "This will mark the order as accepted and notify the customer that their order is being processed."
                : "This will mark the order as declined. The customer will be notified that their order cannot be fulfilled."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              className={
                statusAction === "accepted" ? "bg-green-600" : "bg-destructive"
              }
            >
              {statusAction === "accepted" ? "Accept" : "Decline"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderDetailPage;
