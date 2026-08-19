import LifeOsApp from "@/app/components/LifeOsApp";

const sources = [
  {
    name: "Sleep Foundation — Sleep Calculator & Positions",
    url: "https://www.sleepfoundation.org/sleep-calculator",
  },
  {
    name: "Harvard Division of Sleep Medicine — Sleep needs",
    url: "https://sleep.hms.harvard.edu/education-training/public-education/sleep-and-health-education-program/sleep-health-education-92",
  },
  {
    name: "Johns Hopkins Medicine — Choosing the best sleep position",
    url: "https://www.hopkinsmedicine.org/health/wellness-and-prevention/choosing-the-best-sleep-position",
  },
  {
    name: "Sleeping position & sleep quality (2022, PMC9416198)",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9416198/",
  },
  {
    name: "UCLA Health — Chronotypes and wellness",
    url: "https://www.uclahealth.org/news/article/early-bird-or-night-owl-how-your-chronotype-affects-your",
  },
  {
    name: "Habit formation meta-analysis (2024, PMC11641623)",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/",
  },
  {
    name: "Harvard T.H. Chan — Healthy Eating Plate",
    url: "https://nutritionsource.hsph.harvard.edu/healthy-eating-plate/",
  },
  {
    name: "Protein meta-analysis (2022, PMC8978023)",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8978023/",
  },
  {
    name: "Healthline — 6-pack abs: what it takes",
    url: "https://www.healthline.com/nutrition/best-ways-to-get-abs",
  },
  {
    name: "Built With Science — The best six-pack abs workout",
    url: "https://builtwithscience.com/fitness-tips/six-pack-abs-workout/",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950">
          <div className="absolute left-1/2 top-[-10rem] h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-200/60 to-teal-200/50 blur-3xl dark:from-emerald-900/30 dark:to-teal-900/30" />
        </div>

        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <a href="#" className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950">
              <img src="/icon.svg?v=2" alt="LifeOS" className="absolute h-[42px] w-[42px]" />
            </span>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              Life<span className="text-emerald-600 dark:text-emerald-400">OS</span>
            </span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-300">
            <a href="#app" className="transition hover:text-zinc-900 dark:hover:text-white">The tools</a>
            <a href="#evidence" className="transition hover:text-zinc-900 dark:hover:text-white">Science</a>
            <a
              href="#app"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Start today
            </a>
          </div>
        </nav>

        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10 text-center lg:pb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
            Free · No registration · Data stays in your browser
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
            Sleep better, eat right, and{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              get your day in order.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Evidence-based tools for the basics that quietly run your life: a sleep cycle calculator, a chronotype-based
            daily schedule, a habit tracker, daily nutrition numbers, and a science-backed six-pack plan — all in one
            place, private by design.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#app"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500"
            >
              Open the tools
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Backed by sleep, nutrition & exercise research
            </div>
          </div>
        </div>
      </header>

      {/* The app */}
      <main id="app" className="scroll-mt-20 px-6 pb-24">
        <LifeOsApp />
      </main>

      {/* Evidence */}
      <section id="evidence" className="scroll-mt-20 border-t border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              Built on research, not trends
            </h2>
            <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Every number and plan in LifeOS traces back to sleep, nutrition, and exercise science — not fads. Here are
              the primary sources:
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 3h7v7M21 3l-9 9M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium leading-5 text-zinc-700 group-hover:text-emerald-700 dark:text-zinc-300 dark:group-hover:text-emerald-300">
                  {s.name}
                </span>
              </a>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            Disclaimer: LifeOS provides general educational information, not medical advice. For health conditions,
            sleep disorders, or medical questions, consult a qualified professional.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950">
              <img src="/icon.svg?v=2" alt="LifeOS" className="absolute h-[42px] w-[42px]" />
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">LifeOS</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} LifeOS — Free forever. Everything you enter stays in your browser.
          </p>
        </div>
      </footer>
    </>
  );
}
