export default function Hero() {
    return (
        <section className="relative py-20 px-8 text-center border-b border-border bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,162,39,0.12)_0%,transparent_70%)]">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-xs px-4 py-1.5 rounded-full mb-6 font-medium">
                <span>🇸🇦</span>
                <span>منصة الحرف اليدوية السعودية الأصيلة</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
                اكتشف <span className="text-transparent bg-clip-text bg-gradient-to-br from-gold to-gold-light">الحرف اليدوية</span>
                <br />
                السعودية الأصيلة
            </h1>

            <p className="text-text2 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                تواصل مع أمهر الحرفيين في المملكة — من الفخار والنسيج إلى المجوهرات والجلود. كل قطعة تحكي قصة.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-gradient-to-br from-gold to-gold-dark text-bg font-bold py-3 px-8 rounded-lg text-lg hover:-translate-y-1 transition-all shadow-lg shadow-gold/30">
                    تسوق الآن
                </button>
                <button className="bg-transparent text-gold border border-gold font-bold py-3 px-8 rounded-lg text-lg hover:bg-gold/10 transition-all">
                    انضم كحرفي
                </button>
            </div>

            <div className="flex flex-wrap justify-center gap-12 mt-16">
                {[
                    { num: "0", label: "حرفي مسجل" },
                    { num: "0", label: "منتج أصيل" },
                    { num: "0", label: "طلب مكتمل" },
                    { num: "12", label: "مدينة سعودية" },
                ].map((stat, i) => (
                    <div key={i} className="text-center">
                        <div className="text-3xl font-black text-gold">{stat.num}</div>
                        <div className="text-xs text-text3 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
