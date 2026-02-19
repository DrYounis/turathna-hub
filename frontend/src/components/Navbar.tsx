import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-xl border-b border-border h-16 px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center text-lg shadow-lg shadow-gold/10">
                    🏺
                </div>
                <div>
                    <div className="text-[1.2rem] font-bold text-gold">تراثنا هب</div>
                    <div className="text-[0.7rem] text-text3 font-inter">Turathna Hub</div>
                </div>
            </div>

            <div className="hidden md:flex gap-6 items-center">
                <Link href="/" className="text-text2 hover:text-gold transition-colors text-sm font-medium">السوق</Link>
                <Link href="/artisans" className="text-text2 hover:text-gold transition-colors text-sm font-medium">للحرفيين</Link>
                <Link href="/pricing" className="text-text2 hover:text-gold transition-colors text-sm font-medium">الأسعار</Link>
                <Link href="/dashboard" className="text-text2 hover:text-gold transition-colors text-sm font-medium">لوحة التحكم</Link>
                <button className="bg-gradient-to-br from-gold to-gold-dark text-bg font-bold py-2 px-5 rounded-lg text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-gold/20">
                    انضم كحرفي
                </button>
            </div>
        </nav>
    );
}
