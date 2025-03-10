import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, ShoppingCart, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CartDrawer from "@/components/cart/CartDrawer";

interface HeaderProps {
  shopName?: string;
  isLoggedIn?: boolean;
  userInitials?: string;
  userAvatar?: string;
  cartItemCount?: number;
}

const Header = ({
  shopName = "Sweet Delights Bakery",
  isLoggedIn = false,
  userInitials = "JD",
  userAvatar = "",
  cartItemCount = 0,
}: HeaderProps) => {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [localCartCount, setLocalCartCount] = useState(cartItemCount);

  // Function to refresh cart count
  const refreshCartCount = async () => {
    if (user?.id) {
      const { count } = await supabase
        .from("cart_items")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

      setLocalCartCount(count || 0);
    }
  };

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Get user type
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        if (!userError) {
          setUser({
            ...data.session.user,
            user_type: userData.user_type,
          });
        } else {
          setUser(data.session.user);
        }

        // Fetch cart count
        if (data.session.user.id) {
          const { count } = await supabase
            .from("cart_items")
            .select("*", { count: "exact" })
            .eq("user_id", data.session.user.id);

          setLocalCartCount(count || 0);
        }
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Get user type
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!userError) {
            setUser({
              ...session.user,
              user_type: userData.user_type,
            });
          } else {
            setUser(session.user);
          }

          // Fetch cart count
          const { count } = await supabase
            .from("cart_items")
            .select("*", { count: "exact" })
            .eq("user_id", session.user.id);

          setLocalCartCount(count || 0);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLocalCartCount(0);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Update local cart count when prop changes
  useEffect(() => {
    if (cartItemCount !== localCartCount) {
      setLocalCartCount(cartItemCount);
    }
  }, [cartItemCount]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleCartClick = () => {
    if (user) {
      setIsCartOpen(true);
    } else {
      navigate("/login");
    }
  };

  const actuallyLoggedIn = !!user;

  return (
    <header className="w-full h-20 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo and Shop Name */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=cake"
              alt="Logo"
              className="h-10 w-10 mr-2"
            />
            <h1 className="text-xl font-bold text-primary">{shopName}</h1>
          </Link>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-primary font-medium">
            Home
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-primary font-medium"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-primary font-medium"
          >
            Contact
          </Link>
        </nav>

        {/* Right Side - Cart, User, Admin */}
        <div className="flex items-center space-x-4">
          {/* Shopping Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleCartClick}
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {localCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {localCartCount}
              </span>
            )}
          </Button>

          {/* User Account / Login */}
          {actuallyLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    {userAvatar ? (
                      <AvatarImage src={userAvatar} alt="User" />
                    ) : (
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || userInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link to="/profile" className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/orders" className="w-full">
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    to={
                      user?.user_type === "admin"
                        ? "/admin"
                        : "/customer/dashboard"
                    }
                    className="w-full"
                  >
                    {user?.user_type === "admin"
                      ? "Admin Dashboard"
                      : "My Dashboard"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={handleLoginClick}
            >
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link to="/" className="w-full">
                    Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/about" className="w-full">
                    About Us
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/contact" className="w-full">
                    Contact
                  </Link>
                </DropdownMenuItem>
                {actuallyLoggedIn ? (
                  <>
                    <DropdownMenuItem>
                      <Link to="/profile" className="w-full">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/orders" className="w-full">
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        to={
                          user?.user_type === "admin"
                            ? "/admin"
                            : "/customer/dashboard"
                        }
                        className="w-full"
                      >
                        {user?.user_type === "admin"
                          ? "Admin Dashboard"
                          : "My Dashboard"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={handleLoginClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        userId={user?.id}
      />
    </header>
  );
};

export default Header;
