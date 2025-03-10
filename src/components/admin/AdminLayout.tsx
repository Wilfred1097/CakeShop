import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cake, Settings, LogOut, User, ShoppingBag } from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
        return;
      }

      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_type, email")
        .eq("id", data.session.user.id)
        .single();

      if (userError || userData.user_type !== "admin") {
        // Not an admin, redirect to customer dashboard
        navigate("/customer/dashboard");
        return;
      }

      setUser(data.session.user);
      setIsLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/login");
        } else if (session) {
          setUser(session.user);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=cake"
              alt="Logo"
              className="h-8 w-8"
            />
            <h1 className="text-xl font-bold">Sweet Delights Admin</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              View Shop
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {user?.email}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="container mx-auto px-4 pb-2">
          <Tabs defaultValue="cakes" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger
                value="cakes"
                onClick={() => navigate("/admin/cakes")}
                className="flex items-center"
              >
                <Cake className="mr-2 h-4 w-4" />
                <span>Cakes</span>
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                onClick={() => navigate("/admin/categories")}
                className="flex items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Categories</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                onClick={() => navigate("/admin/orders")}
                className="flex items-center"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>Orders</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                onClick={() => navigate("/admin/profile")}
                className="flex items-center"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Shop Profile</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
