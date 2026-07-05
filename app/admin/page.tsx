export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
      <p className="text-slate-600 text-sm mb-8">
        Manage the public landing page. All edits revalidate the live site
        immediately.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Products", href: "/admin/products", description: "Manage the Best Sellers list" },
          { title: "Outlets", href: "/admin/outlets", description: "Physical store locations" },
          { title: "Testimonials", href: "/admin/testimonials", description: "Customer quotes" },
          { title: "Footer", href: "/admin/singletons/footer", description: "Contact details + social links" },
          { title: "Announcement", href: "/admin/singletons/announcement", description: "Marquee bar messages" },
          { title: "Gift Sets Banner", href: "/admin/singletons/giftSetsBanner", description: "Mid-page banner" },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-5 hover:border-forest transition"
          >
            <h3 className="font-medium text-slate-900">{card.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{card.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
