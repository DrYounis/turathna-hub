'use client';

import { useEffect, useState } from 'react';
import { api, Artisan, Order } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [apiKey, setApiKey] = useState('');
    const [artisan, setArtisan] = useState<Artisan | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check for stored API key
        const storedKey = localStorage.getItem('turathna_api_key');
        if (storedKey) {
            setApiKey(storedKey);
            fetchData(storedKey);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchData = async (key: string) => {
        setLoading(true);
        setError('');
        try {
            const [profileData, ordersData] = await Promise.all([
                api.getMyProfile(key),
                api.getMyOrders(key)
            ]);
            setArtisan(profileData);
            setOrders(ordersData.orders || []);
        } catch (err) {
            setError('Failed to load dashboard. check API Key.');
            localStorage.removeItem('turathna_api_key');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('turathna_api_key', apiKey);
        fetchData(apiKey);
    };

    if (!artisan && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-surface border border-border p-8 rounded-xl w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-6 text-center">Artist Login</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-2">API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2"
                                placeholder="Enter your Turathna API Key"
                                required
                            />
                        </div>
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                        <button type="submit" className="w-full bg-gold text-bg font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">لوحة التحكم</h1>
                    <p className="text-secondary">Welcome back, {artisan?.name}</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            localStorage.removeItem('turathna_api_key');
                            setArtisan(null);
                        }}
                        className="text-secondary hover:text-red-400 transition-colors"
                    >
                        Logout
                    </button>
                    <button className="bg-gold text-bg font-bold py-2 px-6 rounded-lg hover:bg-gold-dark transition-colors flex items-center gap-2">
                        <span>+</span> إضافة منتج
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    label="إجمالي المبيعات"
                    value={`${artisan?.total_sales_sar || 0} ر.س`}
                    sub="Total Revenue"
                />
                <StatCard
                    label="الطلبات"
                    value={String(artisan?.products_count || 0)}
                    sub="Total Products"
                />
                <StatCard
                    label="تقييم المتجر"
                    value={String(artisan?.rating || 0)}
                    sub="Customer Rating"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="font-bold">آخر الطلبات (Recent Orders)</h2>
                        <span className="text-sm text-secondary">{orders.length} orders</span>
                    </div>
                    <div className="p-6">
                        {orders.length === 0 ? (
                            <div className="text-center text-text2 py-8">
                                <div className="text-4xl mb-3 opacity-50">📦</div>
                                <p>لا توجد طلبات حتى الآن</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.slice(0, 5).map(order => (
                                    <div key={order.order_id} className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                                        <div>
                                            <div className="font-bold text-sm">{order.buyer_name}</div>
                                            <div className="text-xs text-secondary">{order.city}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-400">{order.total_sar} SAR</div>
                                            <div className="text-[10px] text-secondary">{new Date(order.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h2 className="font-bold">حالة الحساب (Account Status)</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <StatusRow label="Plan" value={artisan?.plan.toUpperCase()} />
                        <StatusRow label="Status" value={artisan?.status} active={artisan?.status === 'active'} />
                        <StatusRow label="Member Since" value={new Date(artisan?.joined_at || '').toLocaleDateString()} />
                        <StatusRow label="Location" value={artisan?.city} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, sub }: any) {
    return (
        <div className="bg-surface border border-border p-6 rounded-xl">
            <div className="text-text2 text-sm mb-2">{label}</div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-secondary text-xs font-medium">{sub}</div>
        </div>
    );
}

function StatusRow({ label, value, active }: any) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
            <span className="text-secondary">{label}</span>
            <span className={`font-medium ${active ? 'text-green-500' : 'text-foreground'}`}>
                {value || '-'}
            </span>
        </div>
    );
}
