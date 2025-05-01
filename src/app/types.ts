export interface Vehicle {
    advert_classification: string;
    vehicle_id: number;
    make: string;
    model: string;
    price: string;
    price_when_new: string;
    body_type: string;
    media_urls: { thumb: string; large: string; medium: string }[];
    fuel_type: string;
    transmission: string;
    odometer_value: number;
    odometer_units: string;
    colour: string;
    seats: string;
    doors: string;
    location: string;
    reserved: string;
    monthly_payment: string;
    year: string;
    plate: string;
    derivative: string;
    [key: string]: string | number | string[] | { thumb: string; large: string; medium: string }[];
}

