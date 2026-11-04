export function SiteFooter({ storeName }: Readonly<{ storeName: string }>) {
  return (
    <footer className="bg-dark text-white-50 py-4 mt-5">
      <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
        <span>{storeName}</span>
        <span>Prices in US dollars</span>
      </div>
    </footer>
  );
}
