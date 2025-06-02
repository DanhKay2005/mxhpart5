"use client";
import React, { useState, useEffect, useRef } from "react";

interface CartItem {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Function to load cart items from localStorage
  const loadCartItems = () => {
    const storedCartRaw = localStorage.getItem("cart");
    console.log("Raw localStorage cart data:", storedCartRaw);
    if (storedCartRaw) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCartRaw);
        console.log("Loaded cart items from localStorage:", parsedCart);
        setCartItems(parsedCart);
        console.log("cartItems state updated with length:", parsedCart.length);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
      console.log("No cart data in localStorage, cartItems set to empty array");
    }
  };

  // Load cart items on component mount
  useEffect(() => {
    loadCartItems();

    // Listen for localStorage changes in other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cart") {
        console.log("Storage event detected for 'cart', reloading cart items");
        loadCartItems();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom cartUpdated event in same tab
    const handleCartUpdated = () => {
      console.log("Custom 'cartUpdated' event detected, reloading cart items");
      loadCartItems();
    };
    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  // Update localStorage whenever cartItems state changes, but skip first run to avoid overwriting localStorage on mount
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Handle quantity change for a cart item
  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Handle deleting an item from cart
  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) return;
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate total quantity and total price
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle checkout button click
  const handleCheckout = () => {
    alert("Chúc Mừng Bạn Đã Hàng Thành Công!!!!!.");
  };

  // Handle "Chi tiết" click (for now just alert)
  const handleDetails = (item: CartItem) => {
    alert(`Chi tiết sản phẩm:\nTên: ${item.title}\nGiá: ${item.price.toLocaleString("vi-VN")} đ`);
  };

  // Handle "Cập Nhật" click (for now just reload cart to simulate update)
  const handleUpdate = () => {
    alert("Cập nhật giỏ hàng thành công.");
    loadCartItems();
  };

  // Handle clearing the entire cart
  const handleClearCart = () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;
    setCartItems([]);
  };

  console.log("Rendering CartPage with cartItems length:", cartItems.length);
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Thông tin giỏ hàng</h1>
      {cartItems.length === 0 ? (
        <p>Giỏ hàng của bạn đang trống.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border border-gray-300 p-2">Tên sách</th>
              <th className="border border-gray-300 p-2">Ảnh bìa</th>
              <th className="border border-gray-300 p-2">Số lượng</th>
              <th className="border border-gray-300 p-2">Đơn giá</th>
              <th className="border border-gray-300 p-2">Thành tiền</th>
              <th className="border border-gray-300 p-2">Chi tiết</th>
              <th className="border border-gray-300 p-2">Xóa</th>
              <th className="border border-gray-300 p-2">Cập Nhật</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} className="text-center">
                <td className="border border-gray-300 p-2">{item.title}</td>
                <td className="border border-gray-300 p-2">
                  <img src={item.imageUrl} alt={item.title} className="h-20 mx-auto" />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                    className="w-16 text-center border rounded"
                  />
                </td>
                <td className="border border-gray-300 p-2">{item.price.toLocaleString("vi-VN")} đ</td>
                <td className="border border-gray-300 p-2">{(item.price * item.quantity).toLocaleString("vi-VN")} đ</td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => handleDetails(item)}
                    className="text-yellow-600 hover:underline"
                  >
                    Chi tiết
                  </button>
                </td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={handleUpdate}
                    className="text-blue-600 hover:underline"
                  >
                    Cập Nhật
                  </button>
                </td>
              </tr>
            ))}
            <tr className="font-bold text-red-600"> 
              <td className="border border-gray-300 p-2"></td>
              <td colSpan={2} className="border border-gray-300 p-2 text-right">Số lượng sách: {totalQuantity}</td>
              <tr className="font-bold text-red-600"></tr>
              <td className="border border-gray-300 p-2">Tổng tiền: {totalPrice.toLocaleString("vi-VN")} đ</td>
              
              <td colSpan={4} className="border border-gray-300 p-2 text-center">
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:underline"
                >
                  Xóa Giỏ Hàng
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {cartItems.length > 0 && (
        <button
          onClick={handleCheckout}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          ĐẶT HÀNG
        </button>
      )}
    </div>
  );
}
