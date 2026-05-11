import ExportClientPage from './client-page';

export default async function ExportPage() {
  // Dictionary is provided by the root layout
  return (
    <div className="container mx-auto p-4 md:p-8">
      <ExportClientPage />
    </div>
  );
}
