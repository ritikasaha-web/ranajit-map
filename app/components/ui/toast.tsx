"use client";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import React from "react";

const Toast = () => {
  return (
    <div>
      <Button
        variant="outline"
        onClick={() => {
          toast.promise<{ name: string }>(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ name: "Event" }), 2000),
              ),
            {
              loading: "Loading...",
              success: (data) => `${data.name} has been created`,
              error: "Error",
            },
          );
        }}
      >
        Promise
      </Button>
    </div>
  );
};

export default Toast;
