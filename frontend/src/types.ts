export interface User {
  id: number;
  email: string;
  username: string;
  userType: 'admin' | 'user';
  isAccountVerified: boolean;
  profileImage?: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
  reviews?: Review[];
  user?: User;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
  user?: User | { id: number; username: string } | number;
  product?: Product | { id: number } | number;
}

export interface Favorite {
  id: number;
  createdAt?: string;
  product: Product;
  user?: User;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  productName: string;
  productPrice: number;
  quantity: number;
  product?: Product | null;
}

export interface Order {
  id: number;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  user?: User;
}
