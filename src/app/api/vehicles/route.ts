import { NextResponse } from 'next/server';

export async function GET() {
  const apiEndpoint = process.env.API_ENDPOINT;
  const vehiclesPath = process.env.VEHICLES_PATH;
  
  try {
    const response = await fetch(`${apiEndpoint}${vehiclesPath}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}