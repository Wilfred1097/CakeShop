import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, Tag, ShoppingCart, Users } from "lucide-react";

const AdminDashboard = () => {
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Order #1234</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <div className="text-sm font-medium">₱89.99</div>
              </div>

              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Order #1233</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
                <div className="text-sm font-medium">₱54.99</div>
              </div>

              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Order #1232</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
                <div className="text-sm font-medium">₱124.99</div>
              </div>
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
