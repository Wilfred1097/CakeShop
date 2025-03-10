import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { MoreVertical, Eye, CheckCircle, XCircle } from "lucide-react";

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
  item_count: number;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<
    "accepted" | "declined" | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);

      // Fetch orders directly without RLS constraints
      const { data: ordersData, error: ordersError } =
        await supabase.rpc("get_all_orders");

      console.log("Orders data from RPC:", ordersData);

      if (ordersError) throw ordersError;

      // Get item count for each order and user details
      const ordersWithItemCount = ordersData
        ? await Promise.all(
            ordersData.map(async (order) => {
              // Get order items count
              const { count, error: countError } = await supabase
                .from("order_items")
                .select("*", { count: "exact" })
                .eq("order_id", order.id);

              if (countError) {
                console.error("Error fetching order items count:", countError);
              }

              // Get user details directly from users table
              const { data: userData, error: userError } = await supabase
                .from("users")
                .select("full_name, email, phone_number")
                .eq("id", order.user_id)
                .single();

              if (userError) {
                console.error("Error fetching user details:", userError);
              }

              return {
                ...order,
                user_email: userData?.email || "Unknown",
                user_name: userData?.full_name || "Unknown",
                item_count: count || 0,
              };
            }),
          )
        : [];

      setOrders(ordersWithItemCount);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !statusAction) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: statusAction,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedOrder);

      if (error) throw error;

      // Refetch orders to ensure we have the latest data
      await fetchOrders();

      setIsDialogOpen(false);
      setSelectedOrder(null);
      setStatusAction(null);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const openStatusDialog = (
    orderId: string,
    action: "accepted" | "declined",
  ) => {
    setSelectedOrder(orderId);
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="border rounded-md">
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <Skeleton
                  key={`skeleton-row-${index}`}
                  className="h-16 w-full mb-2"
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Order Management</h1>
      <p className="text-muted-foreground">
        View and manage customer orders. Update order status or view order
        details.
      </p>

      <div className="border rounded-md">
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
            <p className="text-muted-foreground mb-4">
              There are no orders in the system yet.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.user_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.user_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>{order.item_count}</TableCell>
                  <TableCell>₱{order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        order.status,
                      )}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {order.status === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                openStatusDialog(order.id, "accepted")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Accept Order
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openStatusDialog(order.id, "declined")
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Decline Order
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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

export default OrdersPage;
