import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <h1 className="text-heading-sm font-serif font-normal text-paper">Sign in</h1>
      <p className="mt-2 text-body-sm text-fog">
        No password needed, we&apos;ll email you a one-time link.
      </p>
      <LoginForm />
    </main>
  );
}
