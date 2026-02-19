export default function PricingPage() {
    const plans = [
        {
            name: "Basic (أساسي)",
            price: "0",
            period: "ريال / شهر",
            commission: "15%",
            products: "10 منتجات",
            features: ["دعم فني عبر الإيميل", "لوحة تحكم أساسية", "شحن SMSA مخفض"],
            cta: "ابدأ مجاناً",
            highlight: false
        },
        {
            name: "Standard (قياسي)",
            price: "49",
            period: "ريال / شهر",
            commission: "10%",
            products: "100 منتج",
            features: ["دعم فني عبر الواتساب", "تحليلات متقدمة", "شحن SMSA مجاني (لأول 5 طلبات)", "ظهور مميز في الصفحة الرئيسية"],
            cta: "اشترك الآن",
            highlight: true
        },
        {
            name: "Premium (مميز)",
            price: "149",
            period: "ريال / شهر",
            commission: "5%",
            products: "منتجات غير محدودة",
            features: ["مدير حساب خاص", "دعم على مدار الساعة", "شحن SMSA مجاني (غير محدود)", "تصوير احترافي لمنتجاتك"],
            cta: "اشترك الآن",
            highlight: false
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-16 px-6">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">خطط تناسب جميع الحرفيين</h1>
                <p className="text-text2 text-lg">اختر الخطة المناسبة لحجم إنتاجك وتطلعاتك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <div key={i} className={`relative rounded-2xl p-8 border ${plan.highlight ? 'border-gold bg-gold/5 shadow-2xl shadow-gold/10 scale-105 z-10' : 'border-border bg-surface'} transition-all hover:-translate-y-1`}>
                        {plan.highlight && (
                            <span className="absolute -top-4 right-1/2 translate-x-1/2 bg-gold text-bg font-bold px-4 py-1 rounded-full text-sm">
                                الأكثر شعبية
                            </span>
                        )}
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black text-gold">{plan.price}</span>
                            <span className="text-text3 text-sm">{plan.period}</span>
                        </div>

                        <div className="mb-6 pb-6 border-b border-border/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-text2">العمولة</span>
                                <span className="font-bold">{plan.commission}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text2">المنتجات</span>
                                <span className="font-bold">{plan.products}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature, j) => (
                                <li key={j} className="flex items-center gap-3 text-sm text-text2">
                                    <span className="text-green text-lg">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.highlight ? 'bg-gold text-bg hover:bg-gold-dark' : 'bg-bg3 text-text border border-border hover:border-gold hover:text-gold'}`}>
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
