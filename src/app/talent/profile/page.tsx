export default function TalentProfilePage() {
  return (
    <div className="flex-1 flex items-center justify-center px-8 text-center">
      <div>
        <div className="text-lg font-bold mb-2">Your profile</div>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          Edit your tagline, tags, rate range, portfolio links, and ID
          verification status here.
        </p>
      </div>
    </div>
  );
}
