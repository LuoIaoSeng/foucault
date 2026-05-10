import {
  BookOpen,
  EnvelopeOpen,
  GraduationCap,
  ShieldCheck,
} from "@gravity-ui/icons";

const features = [
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "Role-Based Management",
    description:
      "Seamlessly manage students, educators, employees, and administrators with dedicated dashboards tailored to each role.",
  },
  {
    icon: <EnvelopeOpen className="w-8 h-8" />,
    title: "Integrated Inbox",
    description:
      "Built-in messaging system connects the entire campus — send and receive messages with rich-text formatting and seamless delivery.",
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Centralized Administration",
    description:
      "Manage user accounts, reset passwords, and oversee campus operations from a single, secure admin panel.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Secure & Reliable",
    description:
      "JWT-based authentication, role-gated access control, and encrypted credentials keep your institution's data safe.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-(--tt-bg-color) text-(--foreground)">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-(--tt-border-color) bg-(--tt-bg-color)/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <span className="text-2xl font-bold tracking-tight">
            Foucault
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-(--tt-brand-color-50) via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-24 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            The Modern{" "}
            <span className="text-(--tt-brand-color-500)">
              University Management
            </span>{" "}
            Platform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-(--tt-color-text-gray) sm:text-xl">
            Foucault brings students, educators, and administrators together —
            streamlining communication, user management, and campus operations
            in one unified system.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to run your campus
          </h2>
          <p className="mt-4 text-(--tt-color-text-gray)">
            A complete platform designed for the way universities work.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-(--tt-card-border-color) bg-(--tt-card-bg-color) p-8 transition-shadow hover:shadow-(--tt-shadow-elevated-md)"
            >
              <div className="mb-4 inline-flex rounded-xl bg-(--tt-brand-color-50) p-3 text-(--tt-brand-color-600)">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-(--tt-color-text-gray)">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-(--tt-border-color)">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-(--tt-color-text-gray)">
          &copy; {new Date().getFullYear()} Foucault. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
