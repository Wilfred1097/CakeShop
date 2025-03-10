import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, Tag, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    cakeCount: 0,
    categoryCount: 0,
    orderCount: 0,
    customerCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [popularCakes, setPopularCakes] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch cake count
        const { count: cakeCount } = await supabase
          .from("cakes")
          .select("*", { count: "exact" });

        // Fetch category count
        const { count: categoryCount } = await supabase
          .from("categories")
          .select("*", { count: "exact" });

        // Fetch order count
        const { count: orderCount } = await supabase
          .from("orders")
          .select("*", { count: "exact" });

        // Fetch customer count
        const { count: customerCount } = await supabase
          .from("users")
          .select("*", { count: "exact" })
          .eq("user_type", "customer");

        setStats({
          cakeCount: cakeCount || 0,
          categoryCount: categoryCount || 0,
          orderCount: orderCount || 0,
          customerCount: customerCount || 0,
        });

        // Fetch recent orders
        const { data: orders } = await supabase
          .from("orders")
          .select(
            `
            id,
            status,
            total_amount,
            created_at,
            users:user_id (full_name)
          `,
          )
          .order("created_at", { ascending: false })
          .limit(3);

        setRecentOrders(orders || []);

        // For now, we'll use static data for popular cakes
        // In a real app, you would calculate this from order_items
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffHours < 24) {
      return diffHours === 0
        ? "Just now"
        : `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cakes</CardTitle>
            <Cake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cakeCount}</div>
            <p className="text-xs text-muted-foreground">Total cake products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoryCount}</div>
            <p className="text-xs text-muted-foreground">Total categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orderCount}</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered customers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/admin/orders")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      ₱{order.total_amount.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent orders
                </p>
              )}

              {recentOrders.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  size="sm"
                  onClick={() => navigate("/admin/orders")}
                >
                  View All Orders
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Cakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-md overflow-hidden mr-3">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&q=80"
                    alt="Chocolate Cake"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Chocolate Delight Cake</p>
                  <p className="text-xs text-muted-foreground">
                    15 orders this month
                  </p>
                </div>
                <div className="text-sm font-medium">₱29.99</div>
              </div>

              <div className="flex items-center">
                <div className="h-9 w-9 rounded-md overflow-hidden mr-3">
                  <img
                    src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=100&q=80"
                    alt="Strawberry Cake"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Strawberry Shortcake</p>
                  <p className="text-xs text-muted-foreground">
                    12 orders this month
                  </p>
                </div>
                <div className="text-sm font-medium">₱24.99</div>
              </div>

              <div className="flex items-center">
                <div className="h-9 w-9 rounded-md overflow-hidden mr-3">
                  <img
                    src="https://images.unsplash.com/photo-1586788224331-947f68671cf1?w=100&q=80"
                    alt="Red Velvet Cake"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Red Velvet Dream</p>
                  <p className="text-xs text-muted-foreground">
                    10 orders this month
                  </p>
                </div>
                <div className="text-sm font-medium">₱32.99</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
