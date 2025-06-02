import axios from 'axios';

interface ProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  location?: string;
  sellerId: number;
}

const API_BASE_URL = '/api/products';

export async function getProducts(): Promise<any> {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

export async function createProduct(productData: ProductData): Promise<any> {
  try {
    const response = await axios.post(API_BASE_URL, productData);
    return response.data;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}
