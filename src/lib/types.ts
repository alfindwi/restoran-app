export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string 
  category: string
  is_available: boolean
  created_at: string
  updated_at: string
}


export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  total_amount: number
  status: string
  order_items: OrderItem[];
  payment_status: string
  payment_id: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product : Product
  quantity: number
  price: number
  created_at: string
}

  export interface CartItem {
    product: Product
    quantity: number
  }

  