import { Suspense } from "react";
import { LoginView } from "./login-view";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 text-muted-foreground text-sm">
          Loading…
        </div>
      }
    >
      <LoginView />
    </Suspense>
  );
}
