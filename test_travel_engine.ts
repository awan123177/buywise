import { searchHotels } from './src/server/travelEngine';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        const results = await searchHotels({
             city: 'Agra',
             checkIn: '2026-10-15',
             checkOut: '2026-10-17',
             guests: 2,
             rooms: 1
        });
        console.log(JSON.stringify(results, null, 2));
    } catch(e: any) {
        console.log("Failed", e.message);
    }
}
run();
