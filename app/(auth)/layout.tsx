import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in | ZAPD",
  description: "Sign in to ZAPD — P2P EV Charging Marketplace",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center p-12 bg-surface border-r border-border">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Charge anywhere.
            <br />
            <span className="text-accent">Earn from home.</span>
          </h2>
          <p className="text-text-secondary text-lg">
            Find nearby EV charging stations in real-time. Book slots, pay
            seamlessly, and get live session updates. The frictionless way to
            charge.
          </p>
          <div className="mt-12 p-6 rounded-xl bg-surface-2 border border-border">
            <div className="h-48 rounded-lg bg-gradient-to-br from-accent/20 to-accent-green/10 flex items-center justify-center">
              <div className="text-6xl opacity-30">⚡</div>
            </div>
            <p className="mt-4 text-sm text-text-muted">
              Real-time map. Instant booking. Live charging stats.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-12">
        {children}
      </div>
    </div>
  )
}
