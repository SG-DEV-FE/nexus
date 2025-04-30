export interface Vehicle {
    advert_classification: string;
    vehicle_id: string | number;
    make: string;
    model: string;
    price: string;
    body_type: string;
    media_urls: { thumb: string; large: string; medium: string }[];
    year: string;
    fuel_type: string;
    transmission: string;
    odometer_value: number;
    odometer_units: string;
    colour: string;
    seats: string;
    doors: string;
    location: string;
    reserved: string;
    [key: string]: string | number | string[] | { thumb: string; large: string; medium: string }[];
}

