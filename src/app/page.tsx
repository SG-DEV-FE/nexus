'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Vehicle } from './types';
import Modal from 'react-modal'; 
import { dataURL } from '@/public/dataURL';
export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openModal = (images: string[]) => {
    setModalImages(images);
    console.log('Modal Images:', images); // Log the images to be displayed in the modal
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImages([]);
  };

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
            <div className="relative">
              {/* Mobile View: Show all images inline, scrollable */}
              <div className="flex md:hidden overflow-x-auto space-x-2">
                {vehicle.media_urls?.map((media, index) => (
                  media.thumb ? ( // Only render if the image URL exists
                    <Image
                      key={index}
                      src={media.thumb}
                      alt={`${vehicle.make || 'Unknown'} ${vehicle.model || 'Unknown'}`}
                      width={113}
                      height={84}
                      className="object-cover rounded"
                      placeholder="blur"
                      blurDataURL={dataURL}
                    />
                  ) : null // Do not render anything if the image URL is missing
                ))}
              </div>

              {/* Above Mobile View: Show highest resolution image and enable modal */}
              {vehicle.media_urls?.[0]?.large && ( // Only render if the large image URL exists
                <Image
                  src={vehicle.media_urls[0].large}
                  alt={`${vehicle.make || 'Unknown'} ${vehicle.model || 'Unknown'}`}
                  width={300}
                  height={160}
                  className="hidden md:block w-full h-40 object-cover mb-2 cursor-pointer"
                  onClick={() => openModal(vehicle.media_urls?.map((media) => media.large) || [])}
                  placeholder="blur"
                  blurDataURL={dataURL}
                />
              )}
            </div>
            <h2 className="text-lg font-semibold">
              {vehicle.make || 'Unknown'} {vehicle.model || 'Unknown'}
            </h2>
            <p className="text-gray-600">Price: £{vehicle.price || 'N/A'}</p>
            <p className="text-gray-500 text-sm">{vehicle.body_type || 'Unknown Body Type'}</p>
          </div>
        ))}
      </div>

      {/* Modal for viewing all images */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Vehicle Images"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-4 rounded-lg max-w-3xl w-full relative overflow-y-auto max-h-[90vh]">
          {/* Close button styled as "X" */}
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modalImages.map((image, index) => (
              image ? ( // Only render if the image URL exists
                <Image
                  key={index}
                  src={image}
                  alt={`Vehicle Image ${index + 1}`}
                  width={300}
                  height={200}
                  className="object-cover rounded"
                  placeholder="blur"
                  blurDataURL={dataURL}
                />
              ) : null // Do not render anything if the image URL is missing
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}