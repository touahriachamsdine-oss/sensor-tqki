import CalibrationForm from '@/components/calibration/calibration-form';

export default async function CalibrationPage() {
  // Dictionary is provided by the root layout
  return (
    <div className="container mx-auto p-4 md:p-8">
      <CalibrationForm />
    </div>
  );
}
