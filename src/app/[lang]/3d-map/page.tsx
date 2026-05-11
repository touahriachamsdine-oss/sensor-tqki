import Map3DClientPage from './client-page';

export default async function Map3DPage() {
  // Dictionary is provided by the root layout
  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col h-[calc(100vh-4.5rem)]">
      <Map3DClientPage />
    </div>
  );
}
