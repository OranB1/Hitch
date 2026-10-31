import LoginForm from "./LoginForm";

const POSTING_STEPS = [
  { lead: "Describe the project", rest: "and the skills it needs." },
  { lead: "See a ranked shortlist", rest: "of applicants, with the reasons each one matches." },
  {
    lead: "You choose",
    rest: "who to work with. Your post shows your department and hospital, never your name.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Only the post gate sends people here with intent; a plain /login keeps the generic page.
  const forPosting = (await searchParams).next === "post";

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <h1 className="text-heading-sm font-serif font-normal text-paper">
        {forPosting ? "Sign in to post an opportunity" : "Sign in"}
      </h1>
      <p className="mt-2 text-body-sm text-fog">
        {forPosting
          ? "We'll email you a one-time link. No password."
          : "No password needed, we'll email you a one-time link."}
      </p>
      {forPosting && (
        <ul className="mt-4 grid gap-[10px]">
          {POSTING_STEPS.map((s) => (
            <li key={s.lead} className="flex gap-[10px] text-body-sm text-fog">
              <span aria-hidden="true" className="mt-[10px] size-[6px] flex-none rounded-full bg-acid-lime" />
              <span>
                <span className="font-[510] text-paper">{s.lead}</span> {s.rest}
              </span>
            </li>
          ))}
        </ul>
      )}
      <LoginForm forPosting={forPosting} />
    </main>
  );
}
