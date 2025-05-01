import { Suspense } from 'react';
import VehiclesList from './vehicleList';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center p-10">Loading vehicles...</div>}>
      <VehiclesList />
    </Suspense>
  );
}