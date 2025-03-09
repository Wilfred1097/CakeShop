import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const RegisterSuccess = () => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Registration Successful
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-6">
          Please check your email to verify your account. Once verified, you can
          log in to access the admin dashboard.
        </p>
        <Button onClick={() => navigate("/login")} className="w-full">
          Go to Login
        </Button>
      </CardContent>
    </Card>
  );
};

export default RegisterSuccess;
