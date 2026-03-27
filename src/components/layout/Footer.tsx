export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} FindMeARace. All rights reserved.</p>
        <p className="mt-1">
          Helping runners discover races across India.
        </p>
      </div>
    </footer>
  );
}
