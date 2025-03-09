import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const [shopName, setShopName] = useState("Sweet Delights Bakery");
  const [shopLogo, setShopLogo] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=cake",
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/admin");
      }
    };

    const fetchShopProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("shop_profile")
          .select("shop_name, logo_url")
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching shop profile:", error);
          return;
        }

        if (data) {
          setShopName(data.shop_name);
          if (data.logo_url) {
            setShopLogo(data.logo_url);
          }
        }
      } catch (error) {
        console.error("Error fetching shop profile:", error);
      }
    };

    checkUser();
    fetchShopProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src={shopLogo} alt={shopName} className="h-16 w-16" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {shopName}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to manage your cake shop
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
