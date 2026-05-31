import { Hero } from "../components/home/hero";
import { AvatarUploadForm } from "../components/upload/avatar-upload-form";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:px-10 lg:py-14">
        <Hero />
        <AvatarUploadForm />
      </div>
    </main>
  );
}
