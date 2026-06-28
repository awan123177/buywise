import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/server/gamificationDb.ts');
let code = fs.readFileSync(file, 'utf8');

const regex = /const INITIAL_REVIEWS: UserReview\[\] = \[\s*\{[\s\S]*?\];/m;

const replacement = `const INITIAL_REVIEWS: UserReview[] = (() => {
  const base: UserReview[] = [];
  const firstNames = ["Rahul", "Sneha", "Vikram", "Pooja", "Arjun", "Tanya", "Rohan", "Meera", "Kavya", "Deepika", "Suresh", "Aditya", "Nisha", "Aman", "Priya"];
  const lastNames = ["Sharma", "Verma", "Patel", "Singh", "Reddy", "Nair", "Das", "Rao", "Iyer", "Chawla", "Kapoor"];
  const comments = [
    "Absolutely game-changing shopping app! I saved nearly ₹4,500 on my iPhone 15 using the real-time competitor price comparison. Highly recommended!",
    "The interactive 3D product viewer is incredible! It let me inspect the camera bump and port alignments of the phone before purchasing. Unbelievably high fidelity.",
    "Using the flight tracking tool, I planned my trip from Delhi to Mumbai and snagged flights at the lowest rate in INR. Excellent utility integrations.",
    "The interface is gorgeous! Extremely seamless search engine. Love how the gamified system rewards coins for just scanning barcodes of local groceries.",
    "A magnificent super app! Handled my trip route building from Bengaluru to Goa with custom hotel trackers. Fully offline-capable database is so fast.",
    "The barcode scanner works instantly! Scanned a detergent bottle and saved ₹80 comparing Amazon and Reliance Digital prices. Fantastic stuff.",
    "Excellent deal updates in the trending feed. Secured a kettle for ₹650 less than the standard market retail price.",
    "I used the dynamic price history tracker to see if the Sony headphones discount was genuine or inflated. Turns out, it's at its lowest-ever price!",
    "Redeemed the Coins Legend custom profile badge today! It looks exceptionally clean next to my name. Incredible UI work.",
    "As a budget traveler, the integrated route finder combined with smart local price scanner saves me hours of manual search. Highly efficient app.",
    "The dark mode slate theme is so comfortable for night-time comparison shopping. Found an amazing tablet discount within 2 minutes.",
    "Highly interactive! Sending coins to my friend was instant. Looking forward to hitting a 30-day streak to claim the major coin bonus.",
    "BuyWise has replaced multiple shopping apps on my phone. The real-time flight tracking comparison operates very fast and accurately.",
    "Amazing super-app that does it all. Sourcing real-time prices makes sure I am never overpaying at retail counters ever again.",
    "Using the price drop alerts has been a lifesaver. Saved ₹1,200 on an air purifier. Truly a masterpiece of utility design.",
    "Very accurate barcode scanner database. Instantly detects most FMCG goods sold in supermarkets. Saves serious money.",
    "I love the clean typography, intuitive menus, and instantaneous response. The best price-tracking ecosystem available in India.",
    "Verified prices at three physical malls versus this app and saved thousands. Real-time sourcing operates accurately.",
    "The support assistant resolved my query immediately. Love the premium membership features, totally ads-free, elite performance.",
    "Dynamic price tracker is extremely reliable. Got automated alerts on telegram/discord setup, very well thought-out developer API.",
    "Premium service at its best! Sourcing prices from Amazon, Flipkart, and Croma simultaneously in milliseconds is an incredible engineering feat.",
    "Saved money on standard electronics easily. The clean UX makes comparison a pleasure rather than a chore.",
    "Excellent gamification logic! Daily login rewards are exciting and encourage regular price Sniping.",
    "The offline capability was handy during my trip. Truly robust architecture and lightning-fast searching.",
    "Splendid experience! The customer support works extremely fast. Totally recommended."
  ];

  for (let i = 1; i <= 200; i++) {
    const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    const rating = Math.random() > 0.85 ? 4 : 5;
    base.push({
      id: "rev_" + i,
      userId: "user_rev_" + i,
      userName: fname + " " + lname,
      userEmail: fname.toLowerCase() + "." + lname.toLowerCase() + "@gmail.com",
      rating,
      comment,
      coinsEarned: 15,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
    });
  }
  return base;
})();`;

code = code.replace(regex, replacement);
fs.writeFileSync(file, code);
console.log('Successfully updated reviews');
