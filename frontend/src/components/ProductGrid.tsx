export default function ProductGrid() {
    return (
        <section className="py-12 px-8 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-bold">المنتجات المتاحة</h2>

                <div className="flex flex-wrap gap-3">
                    <select className="bg-bg3 border border-border text-text py-2 px-4 rounded-lg text-sm focus:border-gold focus:outline-none appearance-none">
                        <option value="">جميع الفئات</option>
                        <option value="pottery">فخار</option>
                        <option value="weaving">نسيج</option>
                        <option value="jewelry">مجوهرات</option>
                        <option value="leather">جلود</option>
                        <option value="wood">خشب</option>
                        <option value="calligraphy">خط عربي</option>
                    </select>

                    <select className="bg-bg3 border border-border text-text py-2 px-4 rounded-lg text-sm focus:border-gold focus:outline-none appearance-none">
                        <option value="">جميع المدن</option>
                        <option value="riyadh">الرياض</option>
                        <option value="jeddah">جدة</option>
                        <option value="dammam">الدمام</option>
                        <option value="abha">أبها</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
                {/* Placeholder for loading state */}
                <div className="col-span-full py-20 text-center text-text3 bg-surface/30 rounded-xl border border-dashed border-border">
                    <div className="text-5xl mb-4 grayscale opacity-50">🏺</div>
                    <p className="text-lg">جاري تحميل المنتجات...</p>
                </div>
            </div>
        </section>
    );
}
