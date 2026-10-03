"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, X, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TAG_OPTIONS = ["Photoshoot", "Event Promo", "Content Video", "Fitting", "Other"];
const RATE_UNITS: { value: string; label: string }[] = [
  { value: "hr", label: "Per hour" },
  { value: "flat", label: "Flat rate" },
  { value: "half_day", label: "Half day" },
  { value: "day", label: "Full day" },
];
const POPULAR_CITIES = [
  "Sydney, NSW",
  "Melbourne, VIC",
  "Brisbane, QLD",
  "Perth, WA",
  "Adelaide, SA",
  "Gold Coast, QLD",
  "Canberra, ACT",
  "Hobart, TAS",
];

const TALENT_STEPS = ["name", "dob", "location", "tags", "links", "rate", "about", "account"] as const;
const BRAND_STEPS = ["name", "dob", "location", "company", "website", "account"] as const;
type StepId = (typeof TALENT_STEPS)[number] | (typeof BRAND_STEPS)[number];

export default function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role") === "brand" ? "brand" : "talent";
  const steps: readonly StepId[] = role === "brand" ? BRAND_STEPS : TALENT_STEPS;

  const [stepIndex, setStepIndex] = useState(0);
  const stepId = steps[stepIndex];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [instagramHandle, setInstagramHandle] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [rateMin, setRateMin] = useState("");
  const [rateMax, setRateMax] = useState("");
  const [rateUnit, setRateUnit] = useState("hr");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [brandInstagram, setBrandInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function isAdult(value: string) {
    if (!value) return false;
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return new Date(value) <= eighteenYearsAgo;
  }

  function canAdvance(): boolean {
    switch (stepId) {
      case "name":
        return firstName.trim().length > 0 && lastName.trim().length > 0;
      case "dob":
        return isAdult(dob);
      case "location":
        return city.trim().length > 0;
      case "tags":
        return tags.length > 0;
      case "links":
        return instagramHandle.trim().length > 0 || portfolioUrl.trim().length > 0;
      case "rate":
        return rateMin.trim().length > 0 && rateMax.trim().length > 0;
      case "about":
        return tagline.trim().length > 0;
      case "company":
        return companyName.trim().length > 0;
      case "website":
        return true;
      case "account":
        return /\S+@\S+\.\S+/.test(email) && password.length >= 8;
      default:
        return false;
    }
  }

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function goBack() {
    setError(null);
    if (stepIndex === 0) router.push("/");
    else setStepIndex((i) => i - 1);
  }

  function goNext() {
    if (!canAdvance() || loading) return;
    setError(null);
    if (stepIndex === steps.length - 1) {
      handleSubmit();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && stepId !== "about") {
      e.preventDefault();
      goNext();
    }
  }

  async function handleSubmit() {
    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      role,
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      date_of_birth: dob,
      city: city.trim(),
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (role === "talent") {
      const portfolioUrls: string[] = [];
      const handle = instagramHandle.trim().replace(/^@/, "");
      if (handle) {
        portfolioUrls.push(handle.startsWith("http") ? handle : `https://instagram.com/${handle}`);
      }
      const site = portfolioUrl.trim();
      if (site) {
        portfolioUrls.push(site.startsWith("http") ? site : `https://${site}`);
      }

      await supabase.from("talent_profiles").insert({
        id: data.user.id,
        tagline: tagline.trim(),
        bio: bio.trim(),
        tags,
        portfolio_urls: portfolioUrls,
        rate_min: rateMin ? Number(rateMin) : null,
        rate_max: rateMax ? Number(rateMax) : null,
        rate_unit: rateUnit,
      });
      router.push("/talent/discover");
    } else {
      const brandHandle = brandInstagram.trim().replace(/^@/, "");
      const brandInstagramUrl = brandHandle
        ? brandHandle.startsWith("http")
          ? brandHandle
          : `https://instagram.com/${brandHandle}`
        : null;
      const brandWebsite = website.trim();

      await supabase.from("brand_profiles").insert({
        id: data.user.id,
        company_name: companyName.trim(),
        website: brandWebsite ? (brandWebsite.startsWith("http") ? brandWebsite : `https://${brandWebsite}`) : null,
        instagram_url: brandInstagramUrl,
      });
      router.push("/brand/gigs");
    }
  }

  const progress = steps.length > 1 ? stepIndex / (steps.length - 1) : 0;

  return (
    <div className="flex-1 flex flex-col px-6 pt-5 pb-8 max-w-md mx-auto w-full">
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={goBack}
          aria-label="Back"
          className="-ml-2 p-2 shrink-0"
          style={{ color: "var(--ink)" }}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "var(--fog-2)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${progress * 100}%`, background: "var(--ink)" }}
          />
        </div>
        <button
          onClick={() => router.push("/")}
          aria-label="Close"
          className="-mr-2 p-2 shrink-0"
          style={{ color: "var(--ink)" }}
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col" onKeyDown={handleKeyDown}>
        {stepId === "name" && (
          <Step heading="What's your name?" subtext="This will show up on your profile.">
            <BigInput label="First name" value={firstName} onChange={setFirstName} autoFocus />
            <BigInput label="Last name" value={lastName} onChange={setLastName} />
          </Step>
        )}

        {stepId === "dob" && (
          <Step
            heading="What's your birth date?"
            subtext={
              role === "talent"
                ? "We need to make sure you're eligible to work."
                : "We need to make sure you're eligible to post work."
            }
          >
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full text-2xl font-bold bg-transparent pb-3 border-b outline-none"
              style={{ borderColor: "var(--hairline)", color: "var(--ink)" }}
              autoFocus
            />
            {dob && !isAdult(dob) && (
              <p className="text-sm mt-3" style={{ color: "var(--red)" }}>
                You must be 18 or older to use Streetcast.
              </p>
            )}
          </Step>
        )}

        {stepId === "location" && (
          <Step heading="Where are you based?">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Type a location"
              className="w-full text-xl bg-transparent pb-3 mb-6 border-b outline-none"
              style={{ borderColor: "var(--hairline)", color: "var(--ink)" }}
              autoFocus
            />
            <div className="text-xs font-semibold tracking-wide mb-3" style={{ color: "var(--graphite)" }}>
              Popular locations
            </div>
            <div className="flex flex-col gap-2">
              {POPULAR_CITIES.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setCity(loc)}
                  className="text-left text-base font-medium px-4 py-3.5 rounded-[14px]"
                  style={
                    city === loc
                      ? { background: "var(--blue)", color: "white" }
                      : { background: "var(--fog)", color: "var(--ink)" }
                  }
                >
                  {loc}
                </button>
              ))}
            </div>
          </Step>
        )}

        {stepId === "tags" && (
          <Step heading="What type of gigs are you up for?" subtext="Choose as many as you like.">
            <div className="flex flex-col gap-2">
              {TAG_OPTIONS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="text-left text-base font-medium px-4 py-3.5 rounded-[14px]"
                    style={
                      active
                        ? { background: "var(--blue)", color: "white" }
                        : { background: "var(--fog)", color: "var(--ink)" }
                    }
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </Step>
        )}

        {stepId === "links" && (
          <Step heading="Where can we see your work?" subtext="At least one is required.">
            <BigInput
              label="Instagram"
              value={instagramHandle}
              onChange={setInstagramHandle}
              placeholder="@yourhandle"
              autoFocus
            />
            <BigInput
              label="Portfolio website (optional)"
              value={portfolioUrl}
              onChange={setPortfolioUrl}
              placeholder="www.yoursite.com"
            />
          </Step>
        )}

        {stepId === "rate" && (
          <Step heading="What's your rate?" subtext="You can always change this later.">
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--graphite)" }}>
                  Min ($)
                </div>
                <input
                  type="number"
                  min="0"
                  value={rateMin}
                  onChange={(e) => setRateMin(e.target.value)}
                  placeholder="40"
                  className="w-full text-xl font-bold bg-transparent pb-3 border-b outline-none"
                  style={{ borderColor: "var(--hairline)", color: "var(--ink)" }}
                  autoFocus
                />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--graphite)" }}>
                  Max ($)
                </div>
                <input
                  type="number"
                  min="0"
                  value={rateMax}
                  onChange={(e) => setRateMax(e.target.value)}
                  placeholder="90"
                  className="w-full text-xl font-bold bg-transparent pb-3 border-b outline-none"
                  style={{ borderColor: "var(--hairline)", color: "var(--ink)" }}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {RATE_UNITS.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => setRateUnit(u.value)}
                  className="text-sm font-semibold px-3.5 py-2 rounded-full"
                  style={
                    rateUnit === u.value
                      ? { background: "var(--blue)", color: "white" }
                      : { background: "var(--fog)", color: "var(--graphite)" }
                  }
                >
                  {u.label}
                </button>
              ))}
            </div>
          </Step>
        )}

        {stepId === "about" && (
          <Step heading="Tell us about yourself">
            <BigInput
              label="Tagline"
              value={tagline}
              onChange={setTagline}
              placeholder="Content creator & part-time model"
              autoFocus
            />
            <div className="text-xs font-semibold mb-1.5 mt-2" style={{ color: "var(--graphite)" }}>
              Anything else? (optional)
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Notable brands, experience, special skills…"
              rows={4}
              className="w-full text-base bg-transparent pb-3 border-b outline-none resize-none"
              style={{ borderColor: "var(--hairline)", color: "var(--ink)" }}
            />
          </Step>
        )}

        {stepId === "company" && (
          <Step heading="What's your company called?">
            <BigInput label="Company name" value={companyName} onChange={setCompanyName} autoFocus />
          </Step>
        )}

        {stepId === "website" && (
          <Step heading="Where can we find you?" subtext="Skip either field if it doesn't apply.">
            <BigInput
              label="Instagram"
              value={brandInstagram}
              onChange={setBrandInstagram}
              placeholder="@yourbrand"
              autoFocus
            />
            <BigInput
              label="Company website"
              value={website}
              onChange={setWebsite}
              placeholder="www.example.com"
            />
          </Step>
        )}

        {stepId === "account" && (
          <Step heading="Last step — create your login">
            <BigInput label="Email" value={email} onChange={setEmail} type="email" autoFocus />
            <BigInput label="Password" value={password} onChange={setPassword} type="password" />
            <p className="text-xs mt-1" style={{ color: "var(--graphite)" }}>
              At least 8 characters.
            </p>
          </Step>
        )}

        {error && (
          <p className="text-sm mt-4" style={{ color: "var(--red)" }}>
            {error}
          </p>
        )}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={goNext}
          disabled={!canAdvance() || loading}
          aria-label={stepIndex === steps.length - 1 ? "Create account" : "Next"}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white disabled:opacity-30 shadow-lg"
          style={{ background: "var(--ink)" }}
        >
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
}

function Step({
  heading,
  subtext,
  children,
}: {
  heading: string;
  subtext?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-tight">{heading}</h1>
        {subtext && (
          <p className="text-base mt-3" style={{ color: "var(--graphite)" }}>
            {subtext}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

function BigInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold" style={{ color: "var(--graphite)" }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full text-xl font-bold bg-transparent pb-3 border-b outline-none"
        style={{ borderColor: "var(--hairline)", color: "var(--ink)" }}
      />
    </label>
  );
}
