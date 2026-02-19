export default function ArtisansPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <section className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">انضم إلى تراثنا هب</h1>
                <p className="text-text2 text-lg mb-8">بيع منتجاتك الحرفية لعملاء في جميع أنحاء المملكة والعالم</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { icon: "🚀", title: "ابدأ مجاناً", desc: "سجّل حسابك وابدأ البيع بدون رسوم شهرية" },
                        { icon: "📦", title: "شحن SMSA", desc: "توصيل سريع لجميع مناطق المملكة" },
                        { icon: "💳", title: "دفع آمن", desc: "تحويل أرباحك مباشرة لحسابك البنكي" },
                        { icon: "📊", title: "تحليلات مفصلة", desc: "تتبع مبيعاتك وأداء منتجاتك" }
                    ].map((item, i) => (
                        <div key={i} className="bg-surface border border-border rounded-xl p-6 text-center hover:border-gold transition-colors">
                            <div className="text-4xl mb-3">{item.icon}</div>
                            <h3 className="text-gold font-bold mb-2">{item.title}</h3>
                            <p className="text-sm text-text2">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-surface border border-border rounded-xl p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-2">تسجيل حرفي جديد</h2>
                <p className="text-text2 mb-8">انضم لمجتمع الحرفيين السعوديين — مجاناً</p>

                <form className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text2">الاسم الكامل *</label>
                            <input type="text" placeholder="محمد العمري" className="w-full bg-bg3 border border-border rounded-lg px-4 py-2.5 focus:border-gold outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text2">البريد الإلكتروني *</label>
                            <input type="email" placeholder="artisan@example.com" dir="ltr" className="w-full bg-bg3 border border-border rounded-lg px-4 py-2.5 focus:border-gold outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text2">رقم الجوال *</label>
                            <input type="tel" placeholder="+966 5X XXX XXXX" dir="ltr" className="w-full bg-bg3 border border-border rounded-lg px-4 py-2.5 focus:border-gold outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text2">المدينة *</label>
                            <select className="w-full bg-bg3 border border-border rounded-lg px-4 py-2.5 focus:border-gold outline-none appearance-none">
                                <option value="">اختر مدينتك</option>
                                <option value="riyadh">الرياض</option>
                                <option value="jeddah">جدة</option>
                                <option value="dammam">الدمام</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text2">نبذة عنك وعن حرفتك *</label>
                        <textarea placeholder="أخبرنا عن تجربتك..." className="w-full bg-bg3 border border-border rounded-lg px-4 py-2.5 min-h-[100px] focus:border-gold outline-none"></textarea>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-br from-gold to-gold-dark text-bg font-bold py-3 rounded-lg hover:opacity-90 transition-opacity mt-4">
                        إنشاء حساب مجاني →
                    </button>
                </form>
            </section>
        </div>
    );
}
