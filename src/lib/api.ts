export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';

// Types
export interface Artisan {
    name: string;
    email: string;
    phone: string;
    city: string;
    craft_type: string;
    bio: string;
    plan: string;
    status: string;
    products_count: number;
    total_sales_sar: number;
    rating: number;
    joined_at: string;
}

export interface Product {
    product_id: string;
    artisan_key: string;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    price_sar: number;
    category: string;
    stock: number;
    images: string[];
    status: string;
    sales_count: number;
    views: number;
    created_at: string;
}

export interface Order {
    order_id: string;
    buyer_name: string;
    buyer_email: string;
    delivery_address: string;
    city: string;
    total_sar: number;
    status: string;
    created_at: string;
    products: Array<{
        product_id: string;
        name: string;
        qty: number;
        price_sar: number;
    }>;
}

// API Client
export const api = {
    // Artisan
    async registerArtisan(data: any) {
        const res = await fetch(`${API_BASE_URL}/artisans/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
    },

    async getMyProfile(apiKey: string) {
        const res = await fetch(`${API_BASE_URL}/artisans/me`, {
            headers: { 'x-api-key': apiKey },
        });
        if (!res.ok) throw new Error('Failed to fetch profile. Check API Key.');
        return res.json();
    },

    async getMyOrders(apiKey: string) {
        const res = await fetch(`${API_BASE_URL}/artisans/orders`, {
            headers: { 'x-api-key': apiKey },
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    },

    // Products
    async createProduct(apiKey: string, data: any) {
        const res = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create product');
        return res.json();
    },

    async listProducts(filters?: { category?: string; city?: string }) {
        const params = new URLSearchParams(filters as any);
        const res = await fetch(`${API_BASE_URL}/products?${params}`);
        return res.json();
    },
};
