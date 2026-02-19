export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto py-8 px-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">لوحة التحكم</h1>
                <button className="bg-gold text-bg font-bold py-2 px-6 rounded-lg hover:bg-gold-dark transition-colors flex items-center gap-2">
                    <span>+</span> إضافة منتج
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: "إجمالي المبيعات", value: "0 ر.س", trend: "+0%" },
                    { label: "الطلبات الجديدة", value: "0", trend: "+0%" },
                    { label: "زيارات المتجر", value: "0", trend: "+0%" },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface border border-border p-6 rounded-xl">
                        <div className="text-text2 text-sm mb-2">{stat.label}</div>
                        <div className="text-3xl font-bold mb-1">{stat.value}</div>
                        <div className="text-green text-xs font-medium">{stat.trend} هذا الشهر</div>
                    </div>
                ))}
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="font-bold">آخر الطلبات</h2>
                </div>
                <div className="p-12 text-center text-text2">
                    <div className="text-4xl mb-3 opacity-50">📦</div>
                    <p>لا توجد طلبات حتى الآن</p>
                </div>
            </div>
        </div>
    );
}
