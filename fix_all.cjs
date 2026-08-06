const fs = require('fs');

// Fix server.ts
let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace('adults: parseInt(adults) || 1,', 'adults: parseInt(adults as string) || 1,');
fs.writeFileSync('server.ts', server);

// Fix FlightSearch and TrainSearch
let flight = fs.readFileSync('src/components/TravelSearch/FlightSearch.tsx', 'utf8');
if (!flight.includes('Star')) {
    flight = flight.replace('ChevronDown, AlertCircle } from', 'ChevronDown, AlertCircle, Star } from');
    fs.writeFileSync('src/components/TravelSearch/FlightSearch.tsx', flight);
}

let train = fs.readFileSync('src/components/TravelSearch/TrainSearch.tsx', 'utf8');
if (!train.includes('Star')) {
    train = train.replace('ChevronDown, AlertCircle } from', 'ChevronDown, AlertCircle, Star } from');
    fs.writeFileSync('src/components/TravelSearch/TrainSearch.tsx', train);
}

