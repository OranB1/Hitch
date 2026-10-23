import Image from "next/image";
import { Reveal } from "@/components/Reveal";

// lucide-react v1 dropped brand icons, so the LinkedIn mark is inlined.
function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

// `photo` is a path under /public. Drop the headshots in as /team/<name>.jpg and fill it in.
// Until then each card falls back to the person's initials.
const FOUNDERS: {
  name: string;
  role: string;
  bio: string;
  linkedin: string;
  photo?: string;
}[] = [
  {
    name: "Oran Barak",
    role: "Co-founder",
    bio: "Medical student at Leeds, starting an MPhil in Translating Medical Device and Advanced Therapy Research at Cambridge. Led the clinical side of NeoTherm, a neonatal sepsis sensor that won MIT's healthcare hackathon and is now being piloted at Cohen Children's Medical Center in New York. Hitch came out of his own experience. He wanted to get into research but kept rotating onto a new specialty before he could build the relationship, and with no medics in the family, there was nobody to show him how it worked. Watching peers hit the same wall as training got more competitive made the problem obvious: it isn't appetite, it's access.",
    linkedin: "https://www.linkedin.com/in/oran-barak/",
  },
  {
    name: "Henry Goldsmith",
    role: "Co-founder",
    bio: "[A couple of sentences about background and why they're building Hitch.]",
    linkedin: "https://www.linkedin.com/in/henry-goldsmith-345354250/",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16">
      <section className="max-w-2xl">
        <h1 className="text-heading-sm font-serif font-normal text-paper">About Hitch</h1>
        <p className="mt-6 text-body text-fog">
          Clinical projects in the NHS start far more often than they finish. In one Foundation
          Programme study, only 30% of audits F1 doctors attempted were completed, and 58% of
          respondents hadn&apos;t completed a single one. The appetite isn&apos;t the problem. A
          survey of 1,774 medical students found 69% wanted to do more research, and the obstacle
          they named most often was simply not knowing what was available.
        </p>
        <p className="mt-4 text-body text-fog">
          Both sides are stuck in the same gap. Opportunities travel by word of mouth, so who you
          happen to know matters more than how keen you are. And because students and junior
          doctors rotate every few months, projects lose their people partway through and quietly
          stall, with the work rarely written down anywhere a successor could pick it up.
        </p>
        <p className="mt-4 text-body text-fog">
          Hitch is a structured place for clinical teams to post real QIP, audit and research
          opportunities, and for students and foundation doctors to find them on merit rather than
          proximity. Making ongoing work visible also means teams can see what is already running,
          build on it instead of repeating it, and hand a project on when the person running it
          rotates away.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-[17px] font-[510] text-paper">Who&apos;s behind it</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {FOUNDERS.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.08}>
              <div className="h-full rounded-cards bg-carbon p-6 shadow-subtle">
                {f.photo ? (
                  <Image
                    src={f.photo}
                    alt={f.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-pills object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-pills bg-black/[0.045] text-[15px] font-[510] text-fog">
                    {initials(f.name)}
                  </div>
                )}
                <h3 className="mt-4 text-[17px] font-[510] text-paper">{f.name}</h3>
                <p className="text-caption text-ash">{f.role}</p>
                <p className="mt-3 text-body-sm text-fog">{f.bio}</p>
                <a
                  href={f.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-[6px] text-[13px] font-[510] text-mist transition-colors hover:text-paper"
                >
                  <LinkedInIcon /> LinkedIn
                </a>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-body-sm text-fog">
          We have spoken to or surveyed around 150 doctors and medical students while building
          Hitch. The project is supported by Imperial, with a pilot in progress at Chelsea and
          Westminster Hospital.
        </p>
      </section>
    </main>
  );
}
