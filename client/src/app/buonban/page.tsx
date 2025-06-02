"use client";
import CartIcon from "../../components/CartIcon";
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  title: string;
  price: number;
  description?: string;
  location?: string;
  imageUrl: string;
  sellerId?: number;
  sellerName?: string;
  sellerClerkId?: string;
  loaiID?: number;
  isFeatured?: boolean;
  rating?: number;
}

export default function MarketplacePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; ten: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetch("/api/sanPham/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Failed to fetch categories:", data.error);
        }
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  // Fetch products when selectedCategoryId changes
  useEffect(() => {
    let url = "/api/sanPham";
    if (selectedCategoryId !== null) {
      url += `?loaiID=${selectedCategoryId}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Add random isFeatured property for demo
          const productsWithFeatured = data.map((product) => ({
            ...product,
            isFeatured: Math.random() < 0.3, // 30% chance to be featured
            rating: 4, // static 4-star rating for demo
          }));
          setProducts(productsWithFeatured);
        } else {
          console.error("Failed to fetch products:", data.error);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, [selectedCategoryId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "price" || name === "loaiID" ? Number(value) : value,
    }));
  };

  const handlePostProduct = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.imageUrl || !newProduct.loaiID) {
      alert("Vui lòng nhập đầy đủ thông tin sản phẩm, bao gồm loại sản phẩm");
      return;
    }

    try {
      let response;
      if (editingProduct) {
        // Edit mode
        response = await fetch(`/api/sanPham?id=${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProduct),
        });
      } else {
        // Create mode
        response = await fetch("/api/sanPham", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProduct),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        alert("Lỗi khi " + (editingProduct ? "sửa" : "đăng") + " sản phẩm: " + (errorData.error || "Unknown error"));
        return;
      }

      // After successful post or edit, re-fetch product list to update UI
      const refreshedResponse = await fetch("/api/sanPham");
      const refreshedProducts = await refreshedResponse.json();
      if (Array.isArray(refreshedProducts)) {
        setProducts(refreshedProducts);
      }
      setNewProduct({});
      setShowPostForm(false);
      setEditingProduct(null);
    } catch (error) {
      alert("Lỗi khi gửi yêu cầu " + (editingProduct ? "sửa" : "đăng") + " sản phẩm");
      console.error(error);
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handleOrder = () => {
    alert(`Đặt hàng sản phẩm: ${selectedProduct?.title}`);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      loaiID: product.loaiID,
    });
    setShowPostForm(true);
  };

  const handleDeleteClick = async (productId: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      const response = await fetch(`/api/sanPham?id=${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert("Lỗi khi xóa sản phẩm: " + (errorData.error || "Unknown error"));
        return;
      }
      // Refresh product list after delete
      const refreshedResponse = await fetch("/api/sanPham");
      const refreshedProducts = await refreshedResponse.json();
      if (Array.isArray(refreshedProducts)) {
        setProducts(refreshedProducts);
      }
    } catch (error) {
      alert("Lỗi khi gửi yêu cầu xóa sản phẩm");
      console.error(error);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto flex gap-4">
      <div className="w-48 sticky top-4 self-start">
        <h2 className="font-bold mb-2">Chủ đề sản phẩm</h2>
        <ul className="space-y-1">
          <li
            className={`cursor-pointer px-3 py-1 rounded ${
              selectedCategoryId === null ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
            }`}
            onClick={() => setSelectedCategoryId(null)}
          >
            Tất cả
          </li>
          {categories.map((category) => (
            <li
              key={category.id}
              className={`cursor-pointer px-3 py-1 rounded ${
                selectedCategoryId === category.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
              }`}
              onMouseEnter={() => {
                // Optional: add delay to avoid flickering
                setSelectedCategoryId(category.id);
              }}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              {category.ten}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Buôn Bán</h1>
          <CartIcon />
        </div>

        <button
          onClick={() => {
            setShowPostForm(!showPostForm);
            if (showPostForm) {
              setEditingProduct(null);
              setNewProduct({});
            }
          }}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {showPostForm ? "Hủy" : editingProduct ? "Sửa sản phẩm" : "Đăng sản phẩm mới"}
        </button>

        {showPostForm && (
          <div className="mb-6 p-4 border rounded shadow-sm bg-white">
            <input
              type="text"
              name="title"
              placeholder="Tên sản phẩm"
              value={newProduct.title || ""}
              onChange={handleInputChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="number"
              name="price"
              placeholder="Giá (VNĐ)"
              value={newProduct.price || ""}
              onChange={handleInputChange}
              className="w-full mb-2 p-2 border rounded"
            />
             {/* LoaiID input hidden as per user request  */}
             <input
              type="number"
              name="loaiID"
              placeholder="Loại sản phẩm (ID)"
              value={newProduct.loaiID || ""}
              onChange={handleInputChange}
              className="w-full mb-2 p-2 border rounded"
            /> 
          
            <textarea
              name="description"
              placeholder="Mô tả sản phẩm"
              value={newProduct.description || ""}
              onChange={handleInputChange}
              className="w-full mb-2 p-2 border rounded resize-none"
              rows={4}
            />
            <div className="mb-2">
              <label htmlFor="imageFile" className="block mb-1 font-medium">
                Chọn file ảnh
              </label>
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("file", file);
                  try {
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });
                    if (!res.ok) {
                      alert("Lỗi khi tải ảnh lên");
                      return;
                    }
                    const data = await res.json();
                    setNewProduct((prev) => ({
                      ...prev,
                      imageUrl: data.url,
                    }));
                  } catch (error) {
                    alert("Lỗi khi tải ảnh lên");
                    console.error(error);
                  }
                }}
                className="w-full"
              />
              {newProduct.imageUrl && (
                <img
                  src={newProduct.imageUrl}
                  alt="Ảnh sản phẩm"
                  className="mt-2 max-h-40 object-contain"
                />
              )}
            </div>
            <button
              onClick={handlePostProduct}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              {editingProduct ? "Lưu thay đổi" : "Đăng sản phẩm"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded shadow-sm p-2 bg-white hover:shadow-lg transition-shadow relative">
              {product.isFeatured && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded z-10">
                  Nổi bật
                </div>
              )}
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-40 object-cover rounded mb-2 cursor-pointer"
                onClick={() => openModal(product)}
              />
              <div className="font-semibold text-lg">
                {(product.price ?? 0).toLocaleString("vi-VN")} đ
              </div>
              <div className="text-sm font-medium flex items-center">
                {product.title}
                <div className="ml-2 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      fill={star <= (product.rating ?? 0) ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 text-yellow-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.922-.755 1.688-1.54 1.118l-3.39-2.462a1 1 0 00-1.175 0l-3.39 2.462c-.784.57-1.838-.196-1.539-1.118l1.287-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z"
                      />
                    </svg>
                  ))}
                </div>
              </div>
              {product.location && (
                <div className="text-xs text-gray-500">{product.location}</div>
              )}
        <div className="flex justify-between mt-2">
          {isLoaded && user && (
            <>
              {console.log("User ID:", user.id, "Product sellerClerkId:", product.sellerClerkId)}
              {typeof user.id === "string" && typeof product.sellerClerkId === "string" && user.id === product.sellerClerkId && (
                <>
                  <button
                    onClick={() => handleEditClick(product)}
                    className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Xóa
                  </button>
                </>
              )}
            </>
          )}
        </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={closeModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.title}
              className="w-full h-64 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-bold mb-2">{selectedProduct.title}</h2>
            <p className="mb-1"><strong>Người bán:</strong> {selectedProduct.sellerName || "Chưa có thông tin"}</p>
            <p className="mb-1"><strong>Giá bán:</strong> {selectedProduct.price}</p>
          
            <p className="mb-4"><strong>Thông tin sản phẩm:</strong> {selectedProduct.description}</p>
            <button
              onClick={() => {
                if (!selectedProduct) {
                  alert("Lỗi: Không có sản phẩm được chọn để thêm vào giỏ hàng.");
                  return;
                }
                console.log("Selected product to add:", selectedProduct);
                // Add product to cart in localStorage
                const cartStr = localStorage.getItem("cart");
                let cart = cartStr ? JSON.parse(cartStr) : [];
                const existingIndex = cart.findIndex((item: any) => item.id === selectedProduct.id);
                if (existingIndex >= 0) {
                  cart[existingIndex].quantity += 1;
                } else {
                  // Ensure all required fields are present
                  const productToAdd = {
                    id: selectedProduct.id,
                    title: selectedProduct.title || "Không có tên",
                    price: selectedProduct.price || 0,
                    imageUrl: selectedProduct.imageUrl || "/default-image.png",
                    quantity: 1,
                  };
                  cart.push(productToAdd);
                }
                console.log("Cart before setItem:", cart);
                localStorage.setItem("cart", JSON.stringify(cart));
                console.log("Cart after setItem:", localStorage.getItem("cart"));
                // Dispatch custom event to notify other components
                window.dispatchEvent(new Event("cartUpdated"));
                alert("Đã thêm sản phẩm vào giỏ hàng");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Thêm vào giỏ hàng
            </button>
            {selectedProduct.sellerClerkId && selectedProduct.sellerClerkId !== user?.id && (
              <button
                onClick={() => router.push(`/tinnhan/t/${selectedProduct.sellerClerkId}`)}
                className="ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Liên hệ người bán
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
        
