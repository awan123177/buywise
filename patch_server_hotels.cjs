const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Update imports
const importStatement = 'import { searchFlights, FlightSearchQuery, searchTrains, searchHotels } from "./src/server/travelEngine.js";';
content = content.replace(/import { searchFlights, FlightSearchQuery, searchTrains } from '\.\/src\/server\/travelEngine\.js';/, importStatement);

const targetCode = `  app.get("/api/travel/hotels", async (req, res) => {
    const { city, checkIn, checkOut, guests, rooms, currency, country, language } = req.query;
    
    try {
      const cityName = (city as string)?.trim() || "Unknown City";`;

const endOfTry = `      console.log(\`Hotel Count: \${hotels.length}\`);
      return res.json({ hotels });
    } catch (error: any) {`;

const newCode = `  app.get("/api/travel/hotels", async (req, res) => {
    const { city, checkIn, checkOut, guests, rooms, currency, country, language } = req.query;
    
    try {
      const results = await searchHotels({
         city: city as string,
         checkIn: checkIn as string,
         checkOut: checkOut as string,
         guests: guests ? parseInt(guests as string) : 2,
         rooms: rooms ? parseInt(rooms as string) : 1,
         currency: currency as string,
         country: country as string,
         language: language as string
      });
      return res.json(results);
    } catch (error: any) {`;

const matchStart = content.indexOf(`  app.get("/api/travel/hotels"`);
if (matchStart !== -1) {
    const matchEnd = content.indexOf(`    } catch (error: any) {`, matchStart);
    if (matchEnd !== -1) {
         content = content.substring(0, matchStart) + newCode + content.substring(matchEnd + `    } catch (error: any) {`.length - `    } catch (error: any) {`.length);
    }
}

fs.writeFileSync('server.ts', content);
