'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Vehicle } from './types';

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      const result = await response.json();
      console.log('API Response:', result); // Log the API response for debugging
      setVehicles(result.data || []); // Ensure `data` is an array or fallback to an empty array
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Fetch vehicles when the component mounts
  useEffect(() => {
    fetchVehicles();
  }, []); // Ensure this runs only once by passing an empty dependency array

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Vehicles List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.vehicle_id || Math.random()} // Fallback to a random key if `vehicle_id` is missing
            className="border rounded-lg p-4 shadow-md"
          >
            <Image
              src={
                vehicle.media_urls?.[0]?.thumb || 'https://via.placeholder.com/300x160.png?text=No+Image'
              } // Fallback to placeholder if no image
              alt={`${vehicle.make || 'Unknown'} ${vehicle.model || 'Unknown'}`} // Fallback for missing make/model
              width={300} // Set a fixed width
              height={160} // Set a fixed height
              className="w-full h-40 object-cover mb-2"
            />
            <h2 className="text-lg font-semibold">
              {vehicle.make || 'Unknown'} {vehicle.model || 'Unknown'}
            </h2>
            <p className="text-gray-600">Price: £{vehicle.price || 'N/A'}</p>
            <p className="text-gray-500 text-sm">{vehicle.body_type || 'Unknown Body Type'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}