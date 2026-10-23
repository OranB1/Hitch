import ProfileForm from "./ProfileForm";

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-heading-sm font-serif font-normal text-paper">Your profile</h1>
      <p className="mt-2 text-body-sm text-fog">
        Photo, bio, and CV, shown to posters when you apply to an opportunity.
      </p>
      <ProfileForm />
    </main>
  );
}
