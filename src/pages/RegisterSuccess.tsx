import React from "react";
import RegisterSuccessComponent from "@/components/auth/RegisterSuccess";

const RegisterSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=cake"
            alt="Sweet Delights Bakery"
            className="h-16 w-16"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sweet Delights Bakery
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterSuccessComponent />
      </div>
    </div>
  );
};

export default RegisterSuccess;
