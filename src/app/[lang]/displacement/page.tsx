import DisplacementClientPage from './client-page';

export default async function DisplacementPage() {
  // Dictionary is provided by the root layout
  return (
    <div className="container mx-auto p-4 md:p-8">
      <DisplacementClientPage />
    </div>
  );
}
