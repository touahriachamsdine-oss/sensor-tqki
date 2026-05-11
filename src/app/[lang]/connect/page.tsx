import ConnectClientPage from './client-page';

export default async function ConnectPage() {
  // Dictionary is provided by the root layout
  return (
    <div className="container mx-auto p-4 md:p-8">
      <ConnectClientPage />
    </div>
  );
}
