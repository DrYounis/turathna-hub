'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { PRODUCTS, stripePromise } from '@/lib/stripe';
import { Check, Star } from 'lucide-react';

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (planName: string, priceId?: string) => {
        if (!priceId) return; // Free plan or contact
        setLoading(planName);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });
            const { sessionId } = await res.json();
            const stripe = await stripePromise;
            await (stripe as any)?.redirectToCheckout({ sessionId });
        } catch (err) {
            console.error('Subscription failed:', err);
        } finally {
            setLoading(null);
        }
    };

    const plans = [
        {
            name: "Basic (أساسي)",
            price: "0",
            period: "ريال / شهر",
            commission: "15%",
            products: "10 منتجات",
            features: ["دعم فني عبر الإيميل", "لوحة تحكم أساسية", "شحن SMSA مخفض"],
            cta: "ابدأ مجاناً",
            highlight: false,
            priceId: null
        },
        {
            name: "Standard (قياسي)",
            price: "49",
            period: "ريال / شهر",
            commission: "10%",
            products: "100 منتج",
            features: ["دعم فني عبر الواتساب", "تحليلات متقدمة", "شحن SMSA مجاني (لأول 5 طلبات)", "ظهور مميز في الصفحة الرئيسية"],
            cta: "اشترك الآن",
            highlight: true,
            priceId: PRODUCTS[0].id // Using the one product we defined for now
        },
        {
            name: "Premium (مميز)",
            price: "149",
            period: "ريال / شهر",
            commission: "5%",
            products: "منتجات غير محدودة",
            features: ["مدير حساب خاص", "دعم على مدار الساعة", "شحن SMSA مجاني (غير محدود)", "تصوير احترافي لمنتجاتك"],
            cta: "اشترك الآن",
            highlight: false,
            priceId: PRODUCTS[0].id // Placeholder
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-16 px-6">
            <Navbar />
            <div className="text-center mb-16 pt-20">
                <h1 className="text-4xl font-bold mb-4">خطط تناسب جميع الحرفيين</h1>
                <p className="text-stone-600 text-lg">اختر الخطة المناسبة لحجم إنتاجك وتطلعاتك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <div key={i} className={`relative rounded-2xl p-8 border ${plan.highlight ? 'border-amber-500 bg-amber-50 shadow-2xl shadow-amber-100 scale-105 z-10' : 'border-stone-200 bg-white'} transition-all hover:-translate-y-1`}>
                        {plan.highlight && (
                            <span className="absolute -top-4 right-1/2 translate-x-1/2 bg-amber-500 text-white font-bold px-4 py-1 rounded-full text-sm">
                                الأكثر شعبية
                            </span>
                        )}
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black text-amber-600">{plan.price}</span>
                            <span className="text-stone-500 text-sm">{plan.period}</span>
                        </div>

                        <div className="mb-6 pb-6 border-b border-stone-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-stone-500">العمولة</span>
                                <span className="font-bold">{plan.commission}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-stone-500">المنتجات</span>
                                <span className="font-bold">{plan.products}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature, j) => (
                                <li key={j} className="flex items-center gap-3 text-sm text-stone-600">
                                    <Check className="text-green-500 text-lg" size={18} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan.name, plan.priceId)}
                            disabled={loading === plan.name || !plan.priceId}
                            className={`w-full py-3 rounded-xl font-bold transition-colors disabled:opacity-50 ${plan.highlight ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-stone-100 text-stone-800 border border-stone-200 hover:border-amber-500 hover:text-amber-500'}`}
                        >
                            {loading === plan.name ? 'جاري المعالجة...' : plan.cta}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
