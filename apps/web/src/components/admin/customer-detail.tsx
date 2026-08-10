import { formatCents } from '@laxvaletcare/shared';
import { Card, StatusBadge } from '@/components/ui';

interface BookingRow { id: string; bookingCode: string; status: string; totalCents: number; date: string; kind: 'Valet' | 'Rental' }

type Verification = {
  fullLegalName: string; dlNumber: string; dlState: string; dlExpiry: string; faceMatchStatus: string; verifiedAt: string | null;
} | null;

interface ChatThread { id: string; status: string; lastMessageAt: string }

interface Customer { id: string; fullName: string; email: string; phone: string | null; createdAt: string }

export function CustomerDetail({ customer, bookings, verification, chatThreads }: {
  customer: Customer; bookings: BookingRow[]; verification: Verification; chatThreads: ChatThread[];
}) {
  const lifetimeValueCents = bookings.reduce((s, b) => s + b.totalCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{customer.fullName}</h1>
        <p className="text-sm text-medium-gray">Customer since {new Date(customer.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><span className="text-xs uppercase text-medium-gray">Lifetime value</span><div className="font-display text-2xl font-bold text-white">{formatCents(lifetimeValueCents)}</div></Card>
        <Card><span className="text-xs uppercase text-medium-gray">Total bookings</span><div className="font-display text-2xl font-bold text-white">{bookings.length}</div></Card>
        <Card><span className="text-xs uppercase text-medium-gray">Verification</span><div className="font-display text-2xl font-bold text-white">{verification ? verification.faceMatchStatus : 'None on file'}</div></Card>
      </div>

      <Card className="flex flex-col gap-2 text-sm">
        <h2 className="font-display text-lg font-bold text-white">Contact</h2>
        <a href={`mailto:${customer.email}`} className="text-medium-gray hover:text-white">{customer.email}</a>
        {customer.phone && (
          <div className="flex flex-wrap gap-2 pt-1">
            <a href={`tel:${customer.phone}`} className="rounded-card border border-light-gray/30 px-3 py-2 text-xs text-white hover:bg-white/5">📞 Call</a>
            <a href={`sms:${customer.phone}`} className="rounded-card border border-light-gray/30 px-3 py-2 text-xs text-white hover:bg-white/5">💬 Text</a>
          </div>
        )}
      </Card>

      {verification && (
        <Card className="flex flex-col gap-2 text-sm">
          <h2 className="font-display text-lg font-bold text-white">Rental verification</h2>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-medium-gray">Legal name</span><span className="text-white">{verification.fullLegalName}</span>
            <span className="text-medium-gray">DL number</span><span className="text-white">{verification.dlNumber} ({verification.dlState})</span>
            <span className="text-medium-gray">DL expiry</span><span className="text-white">{new Date(verification.dlExpiry).toLocaleDateString()}</span>
            <span className="text-medium-gray">Face match</span><span className="text-white">{verification.faceMatchStatus}</span>
            <span className="text-medium-gray">Verified at</span><span className="text-white">{verification.verifiedAt ? new Date(verification.verifiedAt).toLocaleString() : 'not yet'}</span>
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-white">Booking history</h2>
        <div className="flex flex-col divide-y divide-light-gray/10 text-sm">
          {bookings.length === 0 && <p className="py-2 text-medium-gray">No bookings yet.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2">
              <span className="text-white">{b.bookingCode} <span className="text-medium-gray">({b.kind})</span></span>
              <div className="flex items-center gap-3">
                <span className="text-medium-gray">{new Date(b.date).toLocaleDateString()}</span>
                <span className="text-white">{formatCents(b.totalCents)}</span>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-white">Chat history</h2>
        {chatThreads.length === 0 && <p className="text-sm text-medium-gray">No chat threads.</p>}
        <div className="flex flex-col divide-y divide-light-gray/10 text-sm">
          {chatThreads.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2">
              <span className="text-white">Thread {t.id.slice(0, 8)}</span>
              <div className="flex items-center gap-3">
                <span className="text-medium-gray">{new Date(t.lastMessageAt).toLocaleString()}</span>
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
