export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-black">
              F
            </span>
            <span>
              Find<span className="text-primary">Me</span>aRace
            </span>
          </div>
          <p className="text-sm text-muted">
            Helping runners discover races across India
          </p>
        </div>
        <div className="mt-6 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Find Me a Race. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
