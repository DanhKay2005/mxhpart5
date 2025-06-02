"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartIcon() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const cart = localStorage.getItem("cart");
    if (cart) {
      try {
        const cartItems = JSON.parse(cart);
        const totalCount = cartItems.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );
        setCartCount(totalCount);
      } catch {
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();

    // Listen for storage event to update cart count when localStorage changes in other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cart") {
        updateCartCount();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom event to update cart count in same tab
    const handleCartUpdate = () => {
      updateCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  return (
    <Link href="/giohang" aria-label="Giỏ hàng" className="relative inline-block">
      <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-gray-900" />
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </Link>
  );
}
