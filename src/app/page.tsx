'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Vehicle } from './types';
import Modal from 'react-modal'; 
import { dataURL } from '@/public/dataURL';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const vehiclesPerPage = 6;
  const [sortOption, setSortOption] = useState<string>('Highest Price'); // Default to Highest Price

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      const result = await response.json();
      setVehicles(result.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const filterVehicles = () => {
    // Always work with a new array to avoid mutating state
    let filtered = [...vehicles];

    // Apply top filter (All, Used, New, Offers)
    if (selectedFilter === 'Used') {
      filtered = filtered.filter((vehicle) => vehicle.advert_classification === 'Used');
    } else if (selectedFilter === 'New') {
      filtered = filtered.filter((vehicle) => vehicle.advert_classification === 'New');
    } else if (selectedFilter === 'Offers') {
      filtered = filtered.filter((vehicle) => vehicle.advert_classification === 'Offers');
    }

    // Apply sorting logic
    if (sortOption === 'Lowest Price') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOption === 'Highest Price') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortOption === 'Lowest PCM') {
      filtered.sort((a, b) => parseFloat(a.monthly_payment) - parseFloat(b.monthly_payment));
    } else if (sortOption === 'Highest PCM') {
      filtered.sort((a, b) => parseFloat(b.monthly_payment) - parseFloat(a.monthly_payment));
    }

    setFilteredVehicles(filtered);
  };

  const priceTags = [
    {label: 'Lowest Price', value: 'Lowest Price'},
    {label: 'Highest Price', value: 'Highest Price'},
    {label: 'Lowest PCM', value: 'Lowest PCM'},
    {label: 'Highest PCM', value: 'Highest PCM'},
  ];

  const openModal = (images: string[]) => {
    setModalImages(images);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImages([]);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
    setCurrentPage(1); // Reset to the first page when filter changes
  }, [vehicles, selectedFilter, sortOption]);

  // Pagination logic
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
    {/* top filter */}
      <div className="grid grid-cols-4 text-center mb-4 gap-4 nav">
        {['All', 'Used', 'New', 'Offers'].map((filter) => (
          <p
            key={filter}
            className={`
              cursor-pointer 
              ${selectedFilter === filter ? 'border-b-[4px] border-[#7572FF]' : 'text-black-400'}
            `}
            onClick={() => {
              setSelectedFilter(filter);
              setSortOption('Highest Price'); // Reset sort to Highest Price on filter change
            }}
          >
            {filter}
          </p>
        ))}
      </div>
      {/* sub filter */}
      <div className='px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 grid-rows-1'>
        <p className='text-[14px] col-span-1'>Showing {currentVehicles.length} of {filteredVehicles.length} cars</p>
        <Menu as="div" className="relative inline-block text-left col-span-1 justify-end">
          <div>
            <MenuButton
              as="button"
              className="inline-flex justify-center w-full text-[14px] text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
            >
              {sortOption} {/* Update button text to reflect selected sort option */}
              <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
            </MenuButton>
          </div>

          <MenuItems
            as="div"
            className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            {priceTags.map((option) => (
              <MenuItem key={option.label}>
                {({ active }) => (
                  <button
                    onClick={() => setSortOption(option.value)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } group flex rounded-md items-center w-full px-4 py-2 text-sm text-gray-700`}
                  >
                    {option.value}
                  </button>
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
      </div>
      {/* main */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentVehicles.map((vehicle, index) => (
            <div
              key={vehicle.vehicle_id || Math.random()}
              className="shadow-md"
            >
              <div className="relative">
                <div className="flex md:hidden overflow-x-auto space-x-2">
                  {vehicle.media_urls?.map((media, idx) => (
                    media.thumb ? (
                      <Image
                        key={idx}
                        src={media.thumb}
                        alt={`${vehicle.make || 'Unknown'} ${vehicle.model || 'Unknown'}`}
                        width={113}
                        height={84}
                        className="object-cover rounded-[16px]"
                        placeholder="blur"
                        blurDataURL={dataURL}
                      />
                    ) : null
                  ))}
                </div>
                {vehicle.media_urls?.[0]?.large && (
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

        {/* Pagination */}
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : ''
              }`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Vehicle Images"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-4 rounded-lg max-w-3xl w-full relative overflow-y-auto max-h-[90vh]">
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modalImages.map((image, index) => (
              image ? (
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
              ) : null
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}