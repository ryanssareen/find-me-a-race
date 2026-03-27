import Link from "next/link";
import { HeroSearch } from "@/components/home/HeroSearch";

export default function Home() {
  return (
    <div>
      {/* Hero — search-first */}
      <section className="bg-zinc-50 px-4 pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-600">
            India&apos;s Race Directory
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            Find your next{" "}
            <span className="text-blue-600">race.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-zinc-500 sm:text-lg">
            200+ races across India. Marathons, trail runs, ultras, 5Ks
            — search by city and register in one click.
          </p>
        </div>

        <div className="mt-10">
          <HeroSearch />
        </div>
      </section>

      {/* Browse by Distance */}
      <section className="border-t border-zinc-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-bold text-zinc-900">
            Browse by Distance
          </h2>
          <div className="mt-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
            {[
              { type: "5K", label: "5K", desc: "Great for beginners" },
              { type: "Half Marathon", label: "Half Marathon", desc: "The classic 21.1K" },
              { type: "Full Marathon", label: "Marathon", desc: "The full 42.2K" },
              { type: "Ultra", label: "Ultra & Trail", desc: "Beyond the marathon" },
            ].map(({ type, label, desc }) => (
              <Link
                key={type}
                href={`/races?type=${encodeURIComponent(type)}`}
                className="group rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
              >
                <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600">{label}</h3>
                <p className="mt-0.5 text-xs text-zinc-400">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
