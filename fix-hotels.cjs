const fs = require('fs');
let code = fs.readFileSync('src/components/TravelSearch/HotelSearch.tsx', 'utf8');
code = code.replace("place.price.toLocaleString()", "Number(place.price || 0).toLocaleString()");
fs.writeFileSync('src/components/TravelSearch/HotelSearch.tsx', code);
