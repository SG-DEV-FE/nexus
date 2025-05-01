'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Vehicle } from './types';
import Modal from 'react-modal'; 
import { dataURL } from '@/public/dataURL';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon as SolidStarIcon} from '@heroicons/react/16/solid';
import { StarIcon as OutlineStarIcon} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import React from 'react';

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOption, setSortOption] = useState<string>('Highest Price'); // Default to Highest Price
  const [starred, setStarred] = useState<{ [id: string]: boolean }>({});

  const getVehiclesPerPage = () => {
    // This will run on the client side after component mounts
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) {
        return 12; // 12 total slots with valuation card
      } else if (window.innerWidth >= 768) {
        return 8; // 8 total slots with valuation card
      }
    }
    return 6; // 6 total slots with valuation card for mobile
  };

  const [vehiclesPerPage, setVehiclesPerPage] = useState<number>(6);

  // Add this useEffect to update the vehiclesPerPage when window resizes
  useEffect(() => {
    const handleResize = () => {
      setVehiclesPerPage(getVehiclesPerPage());
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      filtered.sort((a, b) => parseFloat(String(a.price)) - parseFloat(String(b.price)));
    } else if (sortOption === 'Highest Price') {
      filtered.sort((a, b) => parseFloat(String(b.price)) - parseFloat(String(a.price)));
    } else if (sortOption === 'Lowest PCM') {
      filtered.sort((a, b) => parseFloat(String(a.monthly_payment)) - parseFloat(String(b.monthly_payment)));
    } else if (sortOption === 'Highest PCM') {
      filtered.sort((a, b) => parseFloat(String(b.monthly_payment)) - parseFloat(String(a.monthly_payment)));
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

  const toggleStar = (vehicleId: string) => {
    setStarred((prev) => ({
      ...prev,
      [vehicleId]: !prev[vehicleId],
    }));
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

  // Add this to your component to track screen width
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    // Set initial width
    setScreenWidth(window.innerWidth);
    
    // Update width on resize
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When calculating pagination
  const calculateVehiclesPerPage = () => {
    if (screenWidth >= 1024) {
      return 11; // 11 vehicle cards + 1 valuation card = 12 items per page
    } else if (screenWidth >= 768) {
      return 7; // 7 vehicle cards + 1 valuation card = 8 items per page  
    }
    return 5; // 5 vehicle cards + 1 valuation card = 6 items per mobile page
  };

  // Update whenever screen size changes
  useEffect(() => {
    setVehiclesPerPage(calculateVehiclesPerPage());
  }, [screenWidth]);

  return (
    <>
    {/* top filter */}
    <main className='md:w-[700px] lg:w-[1030px] m-auto'>
      <div className="grid grid-cols-4 md:flex md:gap-3 text-center mb-4 gap-4 nav md:mt-6 md:mb-4 md:justify-normal md:items-center">
        <p className='sm-hidden text-[18px] font-bold text-black md:mr-5 md:mb-0 mb-2 col-span-4 md:col-auto md:w-[80px] md:text-left'>{filteredVehicles.length} cars</p>
        {['All', 'Used', 'New', 'Offers'].map((filter) => (
          <p
            key={filter}
            className={`cursor-pointer text-[14px] md:px-[25px] md:py-[8px] md:rounded-[12px] md:h-[30px] md:font-[400] md:border md:leading-none md:mr-[-7px] hover:md:border-[#7572FF] hover:md:bg-[#7572FF] hover:md:text-white ${selectedFilter === filter ? 'border-b-[4px] border-[#7572FF] md:bg-[#7572FF] md:text-white ' : 'text-black-400 md:border-[#D1D6E0] md:bg-white'}
            `}
            onClick={() => {
              setSelectedFilter(filter);
              setSortOption('Highest Price'); // Reset sort to Highest Price on filter change
            }}
          >
            {filter}
          </p>
        ))}
        <Menu as="div" className="text-left col-span-1 justify-end sm-hidden ml-auto w-[160px]">
          <div>
            <MenuButton
              as="button"
              className="cursor-pointer inline-flex justify-center w-full text-[14px] text-[#55595D] bg-[#F6F7FB] rounded-[16px] px-4 py-2 font-medium hover:bg-[#7572ff] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:bg-[#7572FF] focus:text-white"
            >
              {sortOption}
              <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
            </MenuButton>
          </div>
          <MenuItems
            as="div"
            className="absolute right-8 z-10 mt-2 w-[160px] origin-top-right bg-[#F6F7FB] divide-y divide-gray-100 rounded-[16px] focus:outline-none"
          >
            {priceTags.map((option) => (
              <MenuItem key={option.label}>
                  <button
                    onClick={() => setSortOption(option.value)}
                    className='group cursor-pointer flex rounded-md items-center w-full px-4 py-2 text-sm text-[#55595D] hover:bg-[#7572FF] hover:text-white focus:bg-[]#7572FF] focus:text-white'
                  >
                    {option.value}
                  </button>
                
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
      </div>
      {/* sub filter */}
      <div className='px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 grid-rows-1 md:hidden'>
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
            className="absolute right-0 z-10 mt-2 w-[160px] origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none"
          >
            {priceTags.map((option) => (
              <MenuItem key={option.label}>
                {({ active }) => (
                  <button
                    onClick={() => setSortOption(option.value)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } group cursor-pointer flex rounded-md items-center w-full px-4 py-2 text-sm text-[#55595D] hover:bg-[#7572FF] hover:text-white focus:bg-[]#7572FF] focus:text-white`}
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
      <div className="px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentVehicles.map((vehicle, index) => {
            // Calculate the actual position in the full dataset
            const actualIndex = indexOfFirstVehicle + index;
            
            // Determine if valuation cards should be shown
            const isMobile = screenWidth > 0 && screenWidth < 768;
            const isMedium = screenWidth >= 768 && screenWidth < 1024;
            const isLarge = screenWidth >= 1024;
            
            return (
              <React.Fragment key={vehicle.vehicle_id || Math.random()}>
                {/* Vehicle Card */}
                <div className="bg-white rounded-[16px] shadow-[0_6px_25px_0_rgba(0,0,0,0.15)] overflow-hidden md:h-[364px] md:w-[327px]">
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
                            className="object-cover rounded-[16px] w-[113px] h-[84px]"
                            placeholder="blur"
                            blurDataURL={dataURL}
                          />
                          
                        ) : null
                      ))}
                    </div>
                    <div className='hidden md:block lg:hidden releative'>
                    {vehicle.media_urls?.[0]?.medium && (
                      <>
                      <Image
                        src={vehicle.media_urls[0].medium}
                        alt={`${vehicle.make || 'Unknown'} ${vehicle.model || 'Unknown'}`}
                        width={327}
                        height={250}
                        className="md:h-[250px] md:w-[327px] object-cover mb-2 cursor-pointer"
                        onClick={() => openModal(vehicle.media_urls?.map((media) => media.large) || [])}
                        placeholder="blur"
                        blurDataURL={dataURL}
                        />
                      {vehicle.advert_classification && (
                        <span className='hidden md:block absolute px-[10px] py-[1px] text-white text-[16px] font-[600] rounded-[8px] bg-[#3F3A50] border border[rgba(255, 255, 255, 0.2)] top-[10px] left-[10px] backdrop-blur[10px]'>{vehicle.advert_classification}</span>
                      )}
                      <div className='absolute bottom-[10px] left-[10px] hidden md:flex gap-1  '>
                        <span className='px-[10px] py-[1px] text-white text-[12px] font-[400] rounded-[8px] bg-[#3F3A50] border border[rgba(255, 255, 255, 0.2)] top-[10px] left-[10px] backdrop-blur[10px]'>{vehicle.odometer_value >= 10000 ? `${Math.round(vehicle.odometer_value / 1000)}k` : `${Math.round(vehicle.odometer_value / 5) * 5} `} miles</span>
                        <span className='px-[10px] py-[1px] text-white text-[12px] font-[400] rounded-[8px] bg-[#3F3A50] border border[rgba(255, 255, 255, 0.2)] top-[10px] left-[10px] backdrop-blur[10px]'>{vehicle.fuel_type}</span>
                        <span className='px-[10px] py-[1px] text-white text-[12px] font-[400] rounded-[8px] bg-[#3F3A50] border border[rgba(255, 255, 255, 0.2)] top-[10px] left-[10px] backdrop-blur[10px]'>{vehicle.transmission ? vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1).toLowerCase() : ''}</span>
                        <span className='px-[10px] py-[1px] text-white text-[12px] font-[400] rounded-[8px] bg-[#3F3A50] border border[rgba(255, 255, 255, 0.2)] top-[10px] left-[10px] backdrop-blur[10px]'>{vehicle.body_type}</span>
                      </div>
                      </>
                    )}
                    </div>
                    <div className='hidden md:hidden lg:block'>
                    {vehicle.media_urls?.[0]?.large && (
                      <>
                      <Image
                        src={vehicle.media_urls[0].large}
                        alt={`${vehicle.make || 'Unknown'} ${vehicle.model || 'Unknown'}`}
                        width={333}
                        height={250}
                        className="lg:h-[250px] lg:w-[333px] object-cover mb-2 cursor-pointer"
                        onClick={() => openModal(vehicle.media_urls?.map((media) => media.large) || [])}
                        placeholder="blur"
                        blurDataURL={dataURL}
                      />
                      {vehicle.advert_classification && (
                        <span className='hidden md:block absolute px-[10px] py-[1px] text-white text-[16px] font-[600] rounded-[8px] bg-[#3F3A50] border border[rgba(255, 255, 255, 0.2)] top-[10px] left-[10px] backdrop-blur[10px]'>{vehicle.advert_classification}</span>
                      )}
                      <div className='absolute bottom-[10px] left-[10px] hidden md:flex gap-1  '>
                        <span className='px-[10px] py-[1px] text-white text-[12px] font-[400] rounded-[8px] bg-[#3F3A50] border border[rgba(255, 255, 255, 0.2)] top-[10px] left-[10px] backdrop-blur[10px]'>{vehicle.odometer_value >= 10000 ? `${Math.round(vehicle.odometer_value / 1000)}k` : `${Math.round(vehicle.odometer_value / 5) * 5} `} miles</span>
                        <span className='px-[10px] py-[1px] text-white text-[12px] font-[400] rounded-[8px] bg-[#3F3A50] border border[rgba(255, 255, 255, 0.2)] top-[10px] left-[10px] backdrop-blur[10px]'>{vehicle.fuel_type}</span>
                        <span className='px-[10px] py-[1px] text-white text-[12px] font-[400] rounded-[8px] bg-[#3F3A50] border border[rgba(255, 255, 255, 0.2)] top-[10px] left-[10px] backdrop-blur[10px]'>{vehicle.transmission ? vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1).toLowerCase() : ''}</span>
                        <span className='px-[10px] py-[1px] text-white text-[12px] font-[400] rounded-[8px] bg-[#3F3A50] border border[rgba(255, 255, 255, 0.2)] top-[10px] left-[10px] backdrop-blur[10px]'>{vehicle.body_type}</span>
                      </div>
                      </>
                    )}
                    </div>
                  </div>
                  <div className='flex justify-between items-center px-2 pt-2'>
                    <p className='text-[14px]-400 text-[#000000]'>{vehicle.plate} {vehicle.make} {vehicle.model}</p>
                    <div className='flex justify-between items-center px-2'>
                      {vehicle.advert_classification === 'New' && <p className='bg-[#3F3A50] px-[10px] rounded-[8px] text-[12px] text-white w-[46px] h-[22px] pt-0.5 text-center md:hidden'>New</p>}
                      <button
                        onClick={() => toggleStar(String(vehicle.vehicle_id))}
                        className="focus:outline-none ml-2"
                        aria-label="Toggle favorite"
                        type="button"
                      >
                        {starred[String(vehicle.vehicle_id)] ? (
                          <SolidStarIcon className='w-[22px] h-[22px]' style={{ color: '#7572FF' }} />
                        ) : (
                          <OutlineStarIcon className='w-[22px] h-[22px]' />
                        )}
                      </button>
                    </div>
                  </div>              
                  <div className='flex justify-between items-center px-2 pb-2'>
                    <p className='text-[12px]'>{vehicle.derivative}</p>
                  </div>

                  {/* Details Specs */}
                  <div className='pb-2 '>
                    <div className='grid grid-cols-2 gap-2 px-2'>                
                      <p className='text-[12px] md:hidden'>{vehicle.odometer_value >= 10000 ? `${Math.round(vehicle.odometer_value / 1000)}k` : `${Math.round(vehicle.odometer_value / 5) * 5} `} miles | {vehicle.fuel_type}</p>
                      <p className='tex-[14px]'><span className='font-[600]'>£{vehicle.monthly_payment}</span> /mo ({vehicle.monthly_finance_type})</p>
                    </div>
                    <div className='grid grid-cols-2 gap-2 px-2'>
                      <p className='text-[12px] md:hidden'>{vehicle.transmission ? vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1).toLowerCase() : ''} | {vehicle.body_type}</p>
                      <p className='text-[12px] col-span-2'><span className='text-[#F87B7B]'>£{vehicle.price}</span> <span className='line-through'>£{vehicle.original_price}</span> <span className='hidden md:inline text-[#7572FF]'>Calculate finance</span></p>
                    </div>
                  </div>
                  <div className=''></div>
                </div>
                
                {/* Insert valuation card at specific positions */}
                {/* For mobile: after 3rd card on the page */}
                {isMobile && index === 3 && (
                  <div className="col-span-1 flex md:hidden justify-center mb-6">
                    <div className="flex items-center justify-between bg-[#F6F7FB] border border-[#D1D6E0] rounded-[16px] p-[13px] w-full max-w-md shadow-sm">
                      <div>
                        <div className="font-bold text-[18px] text-black">Value your car</div>
                        <div className="text-[12px] text-black mt-1">Find out in just a few minutes</div>
                      </div>
                      <button className="ml-4 px-[25px] py-[12px] bg-[#7572FF] text-white rounded-[16px] text-[16px]">
                        Get valuation
                      </button>
                    </div>
                  </div>
                )}
                
                {/* For medium screens: after 3rd card */}
                {isMedium && index === 2 && (
                  <div className="hidden md:flex lg:hidden md:col-span-1 justify-center mb-6">
                    <div className="flex flex-col bg-[#F6F7FB] border border-[#D1D6E0] rounded-[16px] p-6 h-[364px] w-[327px] shadow-[0_6px_25px_0_rgba(0,0,0,0.15)]">
                      <h3 className="font-bold text-[24px] text-center mb-1">Value your car</h3>
                      <p className="text-[14px] text-center mb-6">Find out the value of your car in just a few minutes.</p>
                      
                      <div className="space-y-4 mb-6">
                        <div className='relative'>
                          <label htmlFor="vrm-lg" className="absolute top-[-9px] left-[7px] text-[12px] font-medium mb-1 bg-[#F6F7FB] px-[6px] rounded-[100px]">
                            VRM <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text"
                            id="vrm-lg"
                            placeholder="Enter VRM"
                            className="w-full p-3 border border-[#D1D6E0] rounded-[16px] text-[14px]"
                          />
                        </div>
                        <div className='relative'>
                          <label htmlFor="mileage-lg" className="absolute top-[-9px] left-[7px] text-[12px] font-medium mb-1 bg-[#F6F7FB] px-[6px] rounded-[100px]">
                            Mileage <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text"
                            id="mileage-lg"
                            placeholder="Enter mileage"
                            className="w-full p-3 border border-[#D1D6E0] rounded-[16px] text-[14px]"
                          />
                        </div>
                      </div>
                      
                      <button className="w-full py-3 bg-[#7572FF] text-white rounded-[8px] text-[16px] font-medium">
                        Value my car
                      </button>
                    </div>
                  </div>
                )}
                
                {/* For large screens: after 4th card */}
                {isLarge && index === 3 && (
                  <div className="hidden lg:flex lg:col-span-1 justify-center mb-6">
                    <div className="flex flex-col bg-[#F6F7FB] border border-[#D1D6E0] rounded-[16px] p-6 h-[364px] w-full shadow-[0_6px_25px_0_rgba(0,0,0,0.15)]">
                      <h3 className="font-[600] text-[24px] text-center mb-1">Value your car</h3>
                      <p className="text-[16px] text-center mb-6">Find out the value of your car in just a few minutes.</p>
                      
                      <div className="space-y-4 mb-6">
                        <div className='relative'>
                          <label htmlFor="vrm-lg" className="absolute top-[-9px] left-[7px] text-[12px] font-medium mb-1 bg-[#F6F7FB] px-[6px] rounded-[100px]">
                            VRM <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text"
                            id="vrm-lg"
                            placeholder="Enter VRM"
                            className="w-full p-3 border border-[#D1D6E0] rounded-[16px] text-[14px]"
                          />
                        </div>
                        <div className='relative'>
                          <label htmlFor="mileage-lg" className="absolute top-[-9px] left-[7px] text-[12px] font-medium mb-1 bg-[#F6F7FB] px-[6px] rounded-[100px]">
                            Mileage <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text"
                            id="mileage-lg"
                            placeholder="Enter mileage"
                            className="w-full p-3 border border-[#D1D6E0] rounded-[16px] text-[14px]"
                          />
                        </div>
                      </div>
                      
                      <button className="w-full py-3 bg-[#7572FF] text-white rounded-[8px] text-[16px] font-medium">
                        Value my car
                      </button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Pagination and back to top - Mobile view */}
        <div className="md:hidden">
          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 space-x-1">
            <button
              className="px-3 py-1 w-[54px] h-[30px] border rounded disabled:opacity-50 border-[#D1D6E0]"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className='w-[27px] h-[22px] text-black' />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 w-[54px] h-[30px] py-1 border rounded border-[#D1D6E0] ${
                  currentPage === i + 1 ? 'bg-[#7572FF] text-white' : ''
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 w-[54px] h-[30px] border rounded disabled:opacity-50 border-[#D1D6E0]"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className='w-[27px] h-[22px] text-black' />
            </button>
            <button
              className="px-3 py-1 w-[54px] h-[30px] border rounded disabled:opacity-50 border-[#D1D6E0]"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <div className="flex">
                <ChevronRightIcon className='w-[27px] h-[22px] text-black' />
                <ChevronRightIcon className='w-[27px] h-[22px] text-black -ml-1' />
              </div>
            </button>
          </div>

          {/* Back to top button - Mobile */}
          <div className='flex justify-center items-center mt-5'>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-black underline cursor-pointer bg-transparent border-none p-0"
              type="button"
            >
              Back to top
            </button>
          </div>
        </div>

        {/* Combined layout for md and above */}
        <div className="hidden md:flex justify-between items-center mt-6 mb-4">
          {/* Back to top button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-black underline cursor-pointer bg-transparent border-none p-0"
            type="button"
          >
            Back to top
          </button>

          {/* Pagination */}
          <div className="flex items-center space-x-1">
            <button
              className="px-3 py-1 w-[54px] h-[30px] border rounded disabled:opacity-50 border-[#D1D6E0]"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className='w-[27px] h-[22px] text-black' />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 w-[54px] h-[30px] py-1 border rounded border-[#D1D6E0] ${
                  currentPage === i + 1 ? 'bg-[#7572FF] text-white' : ''
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 w-[54px] h-[30px] border rounded disabled:opacity-50 border-[#D1D6E0]"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className='w-[27px] h-[22px] text-black' />
            </button>
            <button
              className="px-3 py-1 w-[54px] h-[30px] border rounded disabled:opacity-50 border-[#D1D6E0]"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <div className="flex">
                <ChevronRightIcon className='w-[27px] h-[22px] text-black' />
                <ChevronRightIcon className='w-[27px] h-[22px] text-black -ml-1' />
              </div>
            </button>
          </div>

          {/* Sort dropdown */}
          <Menu as="div" className="relative text-left">
            <div>
              <MenuButton
                as="button"
                className="cursor-pointer inline-flex justify-center w-full text-[14px] text-[#55595D] bg-[#F6F7FB] rounded-[16px] px-4 py-2 font-medium hover:bg-[#7572ff] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:bg-[#7572FF] focus:text-white"
              >
                {sortOption}
                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
              </MenuButton>
            </div>
            <MenuItems
              as="div"
              className="absolute right-0 z-10 mt-2 w-[160px] origin-top-right bg-[#F6F7FB] divide-y divide-gray-100 rounded-[16px] shadow-lg focus:outline-none"
            >
              {priceTags.map((option) => (
                <MenuItem key={option.label}>
                  <button
                    onClick={() => setSortOption(option.value)}
                    className='group cursor-pointer flex rounded-md items-center w-full px-4 py-2 text-sm text-[#55595D] hover:bg-[#7572FF] hover:text-white focus:bg-[#7572FF] focus:text-white'
                  >
                    {option.value}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </div>
      

      {/* Modal for images when at tablet or above */}
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
    </main>
    </>
  );
}