import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Mail,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader, tableClass, tdClass, thClass } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("dashboard");
  const sp = await searchParams;
  const forbidden = sp.error === "forbidden";

  const [
    strategies,
    posts,
    publishedPosts,
    pendingInvestments,
    pendingDeposits,
    pendingWithdrawals,
    testimonials,
    faqs,
    newMessages,
    users,
    media,
    recentMessages,
    recentAudit,
  ] = await Promise.all([
    prisma.strategy.count(),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.investment.count({ where: { status: "PENDING" } }),
    prisma.deposit.count({ where: { status: "PENDING" } }),
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
    prisma.testimonial.count(),
    prisma.faq.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.user.count(),
    prisma.media.count(),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { admin: { select: { name: true } } },
    }),
  ]);

  const cards = [
    { label: "Strategies", value: strategies, hint: "offered", href: "/admin/strategies", icon: TrendingUp },
    { label: "Blog posts", value: `${publishedPosts}/${posts}`, hint: "published / total", href: "/admin/blog", icon: FileText },
    { label: "Pending investments", value: pendingInvestments, hint: "awaiting review", href: "/admin/investments", icon: Wallet },
    { label: "Pending deposits", value: pendingDeposits, hint: "awaiting review", href: "/admin/deposits", icon: ArrowDownToLine },
    { label: "Pending withdrawals", value: pendingWithdrawals, hint: "awaiting review", href: "/admin/withdrawals", icon: ArrowUpFromLine },
    { label: "New messages", value: newMessages, hint: "unread enquiries", href: "/admin/messages", icon: Mail },
    { label: "Users", value: users, hint: "registered accounts", href: "/admin/users", icon: Users },
    { label: "Media", value: media, hint: "uploaded files", href: "/admin/media", icon: ImageIcon },
    { label: "Testimonials", value: testimonials, hint: "shown on site", href: "/admin/testimonials", icon: Star },
    { label: "FAQs", value: faqs, hint: "published", href: "/admin/faqs", icon: HelpCircle },
  ];

  return (
    <>
      <AdminHeader
        title="Overview"
        description="Operate the platform: content, strategies, client finance, and support in one place."
      />

      {forbidden && (
        <div className="mb-6 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          You don&apos;t have permission to access that module. If you need it, ask a Super Admin to
          change your role.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-faint">
                  {card.label}
                </span>
                <Icon className="h-4 w-4 text-gold/70" />
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-foreground">
                {card.value}
              </p>
              <p className="mt-0.5 text-xs text-faint">{card.hint}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">
              Recent messages
            </h2>
            <Link href="/admin/messages" className="text-xs text-gold hover:underline">
              View all
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-faint">No messages yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentMessages.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {m.name}
                    </p>
                    <p className="truncate text-xs text-muted">{m.subject ?? m.message}</p>
                  </div>
                  <Badge tone={m.status === "NEW" ? "gold" : "neutral"}>
                    {m.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-foreground">
            Recent activity
          </h2>
          {recentAudit.length === 0 ? (
            <p className="text-sm text-faint">No activity yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Action</th>
                    <th className={thClass}>Entity</th>
                    <th className={thClass}>By</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAudit.map((log) => (
                    <tr key={log.id}>
                      <td className={tdClass}>
                        <span className="text-foreground">{log.action}</span>
                      </td>
                      <td className={tdClass}>{log.entity}</td>
                      <td className={tdClass}>{log.admin?.name ?? "system"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
