import HistoryClientPage from './client-page';

export default async function HistoryPage() {
  // Dictionary is provided by the root layout
  return (
    <div className="container mx-auto p-4 md:p-8">
      <HistoryClientPage />
    </div>
  );
}
