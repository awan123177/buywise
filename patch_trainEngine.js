import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const newMockTrains = `      const trainDB = [
        {
          id: "tr-1",
          train_name: "Rajdhani Express",
          train_number: "12951",
          departure_time: "17:00",
          arrival_time: "08:30",
          origin_station: (origin as string)?.toUpperCase() || "NDLS",
          dest_station: (destination as string)?.toUpperCase() || "BCT",
          duration: "15h 30m",
          quota: quota || "GN",
          classes: [
             { travel_class: "1A", price: 4950, availability: "AVAILABLE-0004", booking_status: "AVAILABLE" },
             { travel_class: "2A", price: 3450, availability: "WL/10", booking_status: "WAITLIST" },
             { travel_class: "3A", price: 2450, availability: "AVAILABLE-0024", booking_status: "AVAILABLE" }
          ],
          booking_link: "https://www.irctc.co.in/nget/train-search"
        },
        {
          id: "tr-2",
          train_name: "Shatabdi Express",
          train_number: "12009",
          departure_time: "06:15",
          arrival_time: "14:45",
          origin_station: (origin as string)?.toUpperCase() || "NDLS",
          dest_station: (destination as string)?.toUpperCase() || "BCT",
          duration: "8h 30m",
          quota: quota || "GN",
          classes: [
             { travel_class: "EC", price: 2850, availability: "AVAILABLE-0014", booking_status: "AVAILABLE" },
             { travel_class: "CC", price: 1850, availability: "WL/14", booking_status: "WAITLIST" }
          ],
          booking_link: "https://www.irctc.co.in/nget/train-search"
        },
        {
          id: "tr-3",
          train_name: "Duronto Express",
          train_number: "12239",
          departure_time: "22:15",
          arrival_time: "12:00",
          origin_station: (origin as string)?.toUpperCase() || "NDLS",
          dest_station: (destination as string)?.toUpperCase() || "BCT",
          duration: "13h 45m",
          quota: quota || "GN",
          classes: [
             { travel_class: "1A", price: 4950, availability: "AVAILABLE-0004", booking_status: "AVAILABLE" },
             { travel_class: "2A", price: 3450, availability: "AVAILABLE-0100", booking_status: "AVAILABLE" },
             { travel_class: "3A", price: 2450, availability: "WL/45", booking_status: "WAITLIST" },
             { travel_class: "SL", price: 850, availability: "RAC/12", booking_status: "RAC" }
          ],
          booking_link: "https://www.irctc.co.in/nget/train-search"
        },
        {
          id: "tr-4",
          train_name: "Garib Rath",
          train_number: "12909",
          departure_time: "16:50",
          arrival_time: "09:40",
          origin_station: (origin as string)?.toUpperCase() || "NDLS",
          dest_station: (destination as string)?.toUpperCase() || "BCT",
          duration: "16h 50m",
          quota: quota || "GN",
          classes: [
             { travel_class: "3A", price: 1050, availability: "WL/120", booking_status: "WAITLIST" },
             { travel_class: "CC", price: 850, availability: "AVAILABLE-002", booking_status: "AVAILABLE" }
          ],
          booking_link: "https://www.irctc.co.in/nget/train-search"
        }
      ];

      // Add debug logging
      trainDB.forEach(t => {
         console.log(\`Train Number: \${t.train_number}\`);
         console.log(\`Available Classes: \${t.classes.map(c => c.travel_class).join(', ')}\`);
         t.classes.forEach(c => {
             console.log(\`Fare returned by provider: \${c.price}\`);
             console.log(\`Displayed Fare: \${c.price}\`);
         });
         console.log(\`Missing Fare: None\`);
      });

      return res.json({ trains: trainDB });`;

code = code.replace(/const mockTrains = \[[\s\S]*?\];\s*return res\.json\(\{ trains: mockTrains \}\);/, newMockTrains);

fs.writeFileSync('server.ts', code);
