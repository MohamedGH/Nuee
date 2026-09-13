import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl italic">Newsletter</h1>
        <p className="font-mono text-xs text-ink-soft">{subscribers.length} abonné(e)s</p>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-ink-soft text-sm">Aucun abonné pour le moment.</p>
      ) : (
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-left text-ink-soft text-xs tracking-tag uppercase border-b border-line">
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Inscrit(e) le</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-line">
                <td className="py-2 pr-4">{s.email}</td>
                <td className="py-2 pr-4">
                  {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
