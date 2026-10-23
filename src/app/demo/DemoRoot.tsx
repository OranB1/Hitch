"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Stethoscope, ArrowRight } from "lucide-react";
import DoctorWalkthrough from "./DoctorWalkthrough";
import StudentWalkthrough from "./StudentWalkthrough";
import type { PostedOpportunity } from "./types";

type View = "chooser" | "doctor" | "student";

export default function DemoRoot() {
  const [view, setView] = useState<View>("chooser");
  const [postedOpportunity, setPostedOpportunity] = useState<PostedOpportunity | null>(null);

  if (view === "doctor") {
    return (
      <DoctorWalkthrough
        onExit={() => setView("chooser")}
        onPosted={setPostedOpportunity}
        onSeeStudentSide={() => setView("student")}
      />
    );
  }

  if (view === "student") {
    return <StudentWalkthrough onExit={() => setView("chooser")} postedOpportunity={postedOpportunity} />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="inline-flex items-center gap-2 rounded-pills bg-black/[0.045] px-3 py-[6px] text-label text-fog">
        <span className="h-1.5 w-1.5 rounded-full bg-iris-violet" />
        Demo: nothing you enter is saved, and no account is needed
      </div>

      <h1 className="mt-4 text-heading-sm font-serif font-normal text-paper">See Hitch in action</h1>
      <p className="mt-2 max-w-lg text-body-sm text-fog">
        Two sides of the same marketplace. Try one, or both. Whatever you post as a doctor shows
        up in the student view, so you can walk the whole loop end to end.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setView("doctor")}
          className="group rounded-cards border border-graphite bg-carbon p-6 text-left shadow-subtle transition-colors hover:border-smoke"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-pills bg-iris-violet/15 text-iris-violet">
            <Stethoscope size={20} />
          </div>
          <p className="mt-4 text-[17px] font-[510] text-paper">Post an opportunity</p>
          <p className="mt-1 text-body-sm text-fog">
            As a consultant, registrar, or QI lead: see the whole posting flow in under two
            minutes.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-[510] text-mist transition-colors group-hover:text-paper">
            Start here <ArrowRight size={14} />
          </span>
        </button>

        <button
          onClick={() => setView("student")}
          className="group rounded-cards border border-graphite bg-carbon p-6 text-left shadow-subtle transition-colors hover:border-smoke"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-pills bg-acid-lime/15 text-acid-lime">
            <GraduationCap size={20} />
          </div>
          <p className="mt-4 text-[17px] font-[510] text-paper">Find an opportunity</p>
          <p className="mt-1 text-body-sm text-fog">
            As a student or foundation doctor: browse, see your match score, and apply.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-[510] text-mist transition-colors group-hover:text-paper">
            Start here <ArrowRight size={14} />
          </span>
        </button>
      </div>

      <p className="mt-8 text-center text-caption text-ash">
        <Link href="/" className="underline hover:text-fog">
          Skip the demo, go to Hitch
        </Link>
      </p>
    </main>
  );
}
