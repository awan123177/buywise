const fs = require('fs');

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Riyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Kabir', 'Aaryan', 'Dhruv', 'Darsh', 'Rudra', 'Devansh', 'Kiaan', 'Laksh', 'Ansh', 'Ranbir', 'Shivansh', 'Aarush', 'Shresth', 'Yuvan', 'Veer', 'Aryan', 'Reyansh', 'Aariz', 'Nirvaan', 'Aarav', 'Divyansh', 'Agastya', 'Avyaan', 'Pratyush', 'Yug', 'Aarav', 'Kian', 'Ivaan', 'Arham', 'Ridhaan', 'Aarav', 'Samar', 'Aarav', 'Rishi', 'Aarav', 'Shaurya'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Kapoor', 'Malhotra', 'Bhatia', 'Chopra', 'Sinha', 'Reddy', 'Patel', 'Joshi', 'Yadav', 'Rao', 'Nair', 'Menon', 'Iyer', 'Deshmukh', 'Kulkarni', 'Bose', 'Das', 'Sen', 'Banerjee', 'Chakraborty', 'Garg', 'Agarwal', 'Mehta', 'Jain', 'Shah', 'Mistry', 'Mody', 'Naidu', 'Chaudhary', 'Gowda', 'Shetty', 'Pillai', 'Rajan', 'Trivedi', 'Chaturvedi', 'Pandey', 'Dubey', 'Mishra', 'Tiwari', 'Shukla', 'Bhatt', 'Dixit', 'Srivastava', 'Saxena', 'Mathur'];

const comments = [
    "Amazing app, saved so much money!",
    "The best shopping companion.",
    "I use it every time I shop online.",
    "Highly recommended. The AI is so smart.",
    "Finally, a tool that actually finds deals.",
    "Helped me save on my flight bookings.",
    "Great interface, very easy to use.",
    "The barcode scanner is super fast.",
    "Love the premium features.",
    "Can't imagine shopping without it now.",
    "This app is a lifesaver for my budget.",
    "Awesome discounts and accurate price history.",
    "The UI is clean and fast.",
    "A must-have for all deal hunters out there.",
    "Saved me from buying an overpriced laptop.",
    "I love how it compares prices across all stores.",
    "It actually works. Highly impressed.",
    "Sleek design, fantastic AI capabilities.",
    "Good, but could use more store integrations.",
    "Best app for tracking deals on electronics.",
    "The travel radar is spot on with flight deals.",
    "Simply brilliant. I got 5 friends to join.",
    "The best cash-saving app I've downloaded.",
    "Super intuitive and the deals are genuine.",
    "Love the point system and rewards."
];

const data = JSON.parse(fs.readFileSync('data_store.json', 'utf-8'));
data.reviews = [];

for (let i = 0; i < 200; i++) {
    const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fname} ${lname}`;
    const email = `${fname.toLowerCase()}.${lname.toLowerCase()}${i}@example.com`;
    const rating = Math.random() > 0.1 ? 5 : 4; 
    const comment = comments[Math.floor(Math.random() * comments.length)];
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    
    data.reviews.push({
        id: `rev_auto_${i}`,
        userId: `user_auto_${i}`,
        userName: name,
        userEmail: email,
        rating,
        comment,
        coinsEarned: Math.floor(Math.random() * 10) + 5,
        timestamp: date.toISOString()
    });
}

fs.writeFileSync('data_store.json', JSON.stringify(data, null, 2));
console.log(`Added ${data.reviews.length} reviews`);
