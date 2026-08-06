const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace("tripType: type || 'one-way'", "tripType: (type as string) || 'one-way'");
server = server.replace("cabinClass: cabin_class,", "cabinClass: cabin_class as string,");
server = server.replace("returnDate: return_date,", "returnDate: return_date as string,");
server = server.replace("departDate: depart_date,", "departDate: depart_date as string,");
server = server.replace("destination: destination,", "destination: destination as string,");
server = server.replace("origin: origin,", "origin: origin as string,");
fs.writeFileSync('server.ts', server);
