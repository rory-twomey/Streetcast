export default function BookingsPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-8 text-center">
      <div>
        <div className="text-lg font-bold mb-2">No bookings yet</div>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          Once a brand confirms you for a gig, it&apos;ll show up here with the
          contract, schedule, and payment status.
        </p>
      </div>
    </div>
  );
}
