import PostForm from "./PostForm";

export default function PostOpportunityPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-heading-sm font-serif font-normal text-paper">Post an opportunity</h1>
      <p className="mt-2 text-body-sm text-fog">
        QIP, audit, research, presentation, or teaching help. You decide how much detail to add.
      </p>
      <PostForm />
    </main>
  );
}
