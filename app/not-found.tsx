import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-6xl font-bold text-gold mb-2">404</h1>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-muted text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="font-mono text-xs tracking-widest px-6 py-3 bg-gold text-background rounded hover:bg-gold/90 transition-colors inline-block"
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
