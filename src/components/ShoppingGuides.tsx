import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, BookOpen, HelpCircle, Check, X, Star, ArrowRight, Tag, 
  ChevronRight, Sparkles, TrendingUp, Smartphone, Laptop, Headphones, 
  Tv, Waves, Wind, Database, Zap, Award, ShoppingCart, Info, Share2, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PremiumProductImage from './PremiumProductImage';

// Interfaces for shopping guide data
interface GuideProduct {
  id: string;
  name: string;
  price: string;
  rating: number;
  image: string;
  badge: string; // e.g. "Best Overall", "Best Budget", etc.
  bestFor: string;
  specs: { [key: string]: string };
  pros: string[];
  cons: string[];
  buyUrl: string;
}

interface GuideData {
  slug: string;
  title: string;
  category: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  aiRecommendation: string;
  products: GuideProduct[];
  buyingGuide: {
    title: string;
    sections: { heading: string; text: string }[];
  };
  faqs: { question: string; answer: string }[];
  relatedProducts: { name: string; price: string; link: string }[];
  internalLinks: { text: string; link: string }[];
}

// Full SEO Guided Data for 8 requested categories
const GUIDES_DATA: { [key: string]: GuideData } = {
  "best-phones-under-20000": {
    slug: "best-phones-under-20000",
    title: "Best Phones Under ₹20,000",
    category: "Smartphones",
    icon: "Smartphone",
    metaTitle: "Best Phones Under 20,000 in India (2026) - Expert AI Buying Guide & Recommendations",
    metaDescription: "Looking for the absolute best smartphone under ₹20,000? Read our comprehensive, expert AI reviews, detailed specs comparison, pros/cons, and FAQs to choose your next phone.",
    intro: "The sub-₹20,000 smartphone segment is the most competitive space in the Indian market today. Buyers no longer need to compromise on essentials: high-refresh-rate AMOLED displays, 5G capabilities, fast-charging batteries, and decent cameras are standard. Our AI model has aggregated performance specs, user ratings, and expert reviews to rank the absolute top models available right now.",
    aiRecommendation: "If you want a flawless all-rounder, the OnePlus Nord CE 4 Lite delivers the cleanest software and dependable battery charging. Gamers should straightaway look towards the iQOO Z9s 5G, which is an absolute performance beast under this price cap. For cinematic media consumption, the Moto G85's premium pOLED curved screen is unrivaled.",
    products: [
      {
        id: "phone-1",
        name: "OnePlus Nord CE 4 Lite 5G",
        price: "₹19,999",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
        badge: "Best Overall",
        bestFor: "Clean Software & Fast Charging",
        specs: {
          "Processor": "Snapdragon 695 5G",
          "Display": "6.67\" 120Hz AMOLED",
          "Camera": "50MP Sony LYT-600 + 2MP Depth",
          "Battery": "5110 mAh with 80W Charging",
          "OS": "OxygenOS based on Android 14"
        },
        pros: [
          "Super fast 80W charging out of the box",
          "Clean OxygenOS without annoying adware",
          "Bright 120Hz AMOLED screen with 2100 nits peak"
        ],
        cons: [
          "The Snapdragon 695 chipset is aging",
          "No ultra-wide angle lens included"
        ],
        buyUrl: "/search?q=OnePlus+Nord+CE+4+Lite"
      },
      {
        id: "phone-2",
        name: "Moto G85 5G",
        price: "₹17,999",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
        badge: "Best Display & Design",
        bestFor: "Premium aesthetics & curved display lovers",
        specs: {
          "Processor": "Snapdragon 6s Gen 3",
          "Display": "6.67\" 120Hz Curved pOLED",
          "Camera": "50MP Sony OIS + 8MP Ultra-wide",
          "Battery": "5000 mAh with 30W Charging",
          "OS": "Near-Stock Android 14"
        },
        pros: [
          "Beautiful premium vegan leather back panel",
          "Stunning curved 3D display that looks flagship grade",
          "8MP ultra-wide camera also acts as macro lens"
        ],
        cons: [
          "Processor feels sluggish for heavy gaming",
          "Charging speed is capped at 30W"
        ],
        buyUrl: "/search?q=Moto+G85+5G"
      },
      {
        id: "phone-3",
        name: "iQOO Z9s 5G",
        price: "₹19,999",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=600&q=80",
        badge: "Best Performance & Gaming",
        bestFor: "Mobile gamers and multitaskers",
        specs: {
          "Processor": "MediaTek Dimensity 7300",
          "Display": "6.77\" 120Hz AMOLED 3D Curved",
          "Camera": "50MP Sony IMX882 OIS + 2MP",
          "Battery": "5500 mAh with 44W Charging",
          "OS": "Funtouch OS 14"
        },
        pros: [
          "Extremely powerful processor (700K+ AnTuTu score)",
          "Massive 5500 mAh battery is incredibly thin",
          "Excellent sustained gaming without overheating"
        ],
        cons: [
          "UI comes with some bloatware pre-installed",
          "Plastic side frames"
        ],
        buyUrl: "/search?q=iQOO+Z9s+5G"
      },
      {
        id: "phone-4",
        name: "Samsung Galaxy M35 5G",
        price: "₹16,999",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
        badge: "Best Battery Life",
        bestFor: "Long lasting multi-day battery endurance",
        specs: {
          "Processor": "Exynos 1380",
          "Display": "6.6\" 120Hz Super AMOLED",
          "Camera": "50MP OIS + 8MP + 2MP Triple",
          "Battery": "6000 mAh with 25W Support",
          "OS": "One UI 6.1 (4 Years OS Updates)"
        },
        pros: [
          "Incredible 2-day backup with massive 6000mAh",
          "Assured 4 major Android version upgrades",
          "Gorilla Glass Victus+ screen protection"
        ],
        cons: [
          "No charger provided inside the retail box",
          "Device is quite heavy (222 grams)"
        ],
        buyUrl: "/search?q=Samsung+Galaxy+M35"
      }
    ],
    buyingGuide: {
      title: "How to Choose the Best Smartphone Under ₹20,000",
      sections: [
        {
          heading: "1. Processor (The Engine)",
          text: "Do not settle for less than a MediaTek Dimensity 7200/7300 or Snapdragon 6s Gen 3/695. Ensure the phone has at least 6GB or 8GB LPDDR4X RAM for future-proofing."
        },
        {
          heading: "2. Display Quality",
          text: "Always prioritize AMOLED panels over LCDs under ₹20,000. Look for a 120Hz refresh rate and at least 1000 nits of peak brightness so it remains easily readable under harsh sunlight."
        },
        {
          heading: "3. Camera Optimization",
          text: "Don't fall for high megapixel counts like 108MP if there's no OIS (Optical Image Stabilization). OIS helps in capturing sharp night shots and steady shake-free videos."
        }
      ]
    },
    faqs: [
      {
        question: "Is 5G standard in all phones under ₹20,000?",
        answer: "Yes, in 2026, almost all smartphones launched under 20,000 support robust 5G networks in India, supporting both Jio and Airtel SA/NSA networks."
      },
      {
        question: "Do these phones include chargers in the retail package?",
        answer: "Most brands like OnePlus, Moto, and iQOO include high-speed chargers. However, Samsung has stopped providing chargers inside the box; you will need to buy a 25W Type-C adapter separately."
      }
    ],
    relatedProducts: [
      { name: "Best Power Banks for Fast Charging", price: "Starting ₹1,299", link: "/guides/best-power-banks" },
      { name: "Premium Phone Cases", price: "₹499", link: "/search?q=premium+phone+cases" }
    ],
    internalLinks: [
      { text: "Best Laptops Under ₹50,000", link: "/guides/best-laptops-under-50000" },
      { text: "Best Gaming Headphones", link: "/guides/best-gaming-headphones" }
    ]
  },
  "best-laptops-under-50000": {
    slug: "best-laptops-under-50000",
    title: "Best Laptops Under ₹50,000",
    category: "Laptops",
    icon: "Laptop",
    metaTitle: "Best Laptops Under 50,000 in India (2026) - AI Buying Guide for Office & Study",
    metaDescription: "Find the absolute best value laptops under ₹50,000. Our AI analyzes and compares top-tier notebooks from HP, Lenovo, ASUS, and Acer based on battery life, CPU, and durability.",
    intro: "Finding a versatile laptop under ₹50,000 can be tricky. It needs to balance processing speed, solid build quality, comfortable keyboards, and decent battery life. Whether you are a college student writing research papers or a remote professional running multiple browser tabs and spreadsheets, our AI-evaluated lineup guides you straight to the best choices.",
    aiRecommendation: "For absolute raw processing power, the Acer Aspire Lite's Core i5 is stellar. If you prioritize stellar battery efficiency combined with a crisp display for productivity and study, go for the Lenovo IdeaPad Slim 3. HP 15s provides the absolute most comfortable keyboard for fast typists.",
    products: [
      {
        id: "laptop-1",
        name: "Lenovo IdeaPad Slim 3",
        price: "₹46,990",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        badge: "Best for Office & Study",
        bestFor: "Students and professional developers wanting reliable battery",
        specs: {
          "CPU": "Intel Core i3 12th Gen (1215U)",
          "RAM": "16GB LPDDR5 Dual Channel",
          "Storage": "512GB PCIe NVMe SSD",
          "Display": "15.6\" Full HD IPS anti-glare",
          "Battery Life": "Up to 7.5 hours"
        },
        pros: [
          "Generous 16GB high-speed RAM handles heavy multitasking",
          "Very thin (17.9mm) and lightweight frame (1.6 kg)",
          "Includes physical webcam privacy shutter"
        ],
        cons: [
          "Integrated graphics are not suited for modern games",
          "Plastic chassis feels slightly flexible under pressure"
        ],
        buyUrl: "/search?q=Lenovo+IdeaPad+Slim+3"
      },
      {
        id: "laptop-2",
        name: "HP 15s (Ryzen 5)",
        price: "₹48,499",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&w=600&q=80",
        badge: "Best Keyboard & Comfort",
        bestFor: "Content writers, bloggers, and long-form typing tasks",
        specs: {
          "CPU": "AMD Ryzen 5 5500U (6 Cores)",
          "RAM": "8GB DDR4 (Expandable)",
          "Storage": "512GB NVMe SSD",
          "Display": "15.6\" FHD Micro-edge screen",
          "Battery Life": "Up to 6 hours"
        },
        pros: [
          "Ryzen 5 hexacore CPU handles multicore processes elegantly",
          "Excellent full-sized tactile keyboard with numeric keypad",
          "Exceptional HP after-sales service network"
        ],
        cons: [
          "Only 8GB RAM is pre-installed (recommended to upgrade to 16GB)",
          "No Type-C charging support"
        ],
        buyUrl: "/search?q=HP+15s+Ryzen+5"
      },
      {
        id: "laptop-3",
        name: "ASUS Vivobook 15",
        price: "₹42,990",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
        badge: "Best Value",
        bestFor: "Budget-conscious buyers seeking balanced performance",
        specs: {
          "CPU": "AMD Ryzen 5 7520U",
          "RAM": "8GB LPDDR5 (Onboard)",
          "Storage": "512GB SSD",
          "Display": "15.6\" FHD 16:9 aspect ratio",
          "Battery Life": "Up to 8 hours"
        },
        pros: [
          "Incredible battery life with newer energy-efficient 7000 series Ryzen",
          "Very sturdy hinge with flat 180-degree lay-flat option",
          "Crisp audio tuning with ASUS SonicMaster"
        ],
        cons: [
          "Onboard LPDDR5 RAM cannot be expanded later",
          "Viewing angles are average on standard TN display panel"
        ],
        buyUrl: "/search?q=ASUS+Vivobook+15"
      },
      {
        id: "laptop-4",
        name: "Acer Aspire Lite (Core i5)",
        price: "₹49,990",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
        badge: "Best Performance",
        bestFor: "Power users, light photo editing and casual coding",
        specs: {
          "CPU": "Intel Core i5 12th Gen (1235U)",
          "RAM": "16GB DDR4",
          "Storage": "512GB PCIe Gen4 SSD",
          "Display": "15.6\" FHD slim bezel",
          "Battery Life": "Up to 5 hours"
        },
        pros: [
          "Super fast 12th Gen Intel i5 processor with 10 total cores",
          "PCIe Gen4 SSD is lightning fast for booting up programs",
          "Premium metallic lid cover styling"
        ],
        cons: [
          "Battery drains faster compared to Ryzen equivalents",
          "Generates slight fan noise under peak gaming load"
        ],
        buyUrl: "/search?q=Acer+Aspire+Lite+Core+i5"
      }
    ],
    buyingGuide: {
      title: "Essential Laptop Checklist Under ₹50,000",
      sections: [
        {
          heading: "RAM: Buy 16GB if possible",
          text: "Modern browsers and OS updates eat through 8GB RAM easily. Getting 16GB dual-channel ensures multiple programs run simultaneously without hanging."
        },
        {
          heading: "SSD over HDD is mandatory",
          text: "Never buy a laptop with a mechanical Hard Disk Drive (HDD). Standard Solid State Drives (SSDs) are at least 5 to 10 times faster, ensuring boots take under 10 seconds."
        },
        {
          heading: "Processor Choice",
          text: "Go for Intel 12th Gen (like 1235U or 1215U) or AMD Ryzen 5 (like 5500U or 7520U). Avoid Intel Celeron, Pentium, or older Core i3 configurations."
        }
      ]
    },
    faqs: [
      {
        question: "Can I play heavy games like GTA V or Cyberpunk on these laptops?",
        answer: "These laptops rely on integrated graphics (Intel Iris Xe or AMD Radeon). You can play casual games like Valorant, CS:GO, and GTA V at low-to-medium settings. Heavy titles like Cyberpunk 2077 are not playable."
      },
      {
        question: "Does it include MS Office?",
        answer: "Most premium configurations from Lenovo, HP, and ASUS come with lifetime MS Office Home & Student pre-activated. Always check retailer specifications."
      }
    ],
    relatedProducts: [
      { name: "Wireless Optical Mouse", price: "₹699", link: "/search?q=wireless+optical+mouse" },
      { name: "Laptop Cooling Pad", price: "₹1,199", link: "/search?q=laptop+cooling+pad" }
    ],
    internalLinks: [
      { text: "Best Power Banks (Highly Recommended)", link: "/guides/best-power-banks" },
      { text: "Best Gaming Headphones", link: "/guides/best-gaming-headphones" }
    ]
  },
  "best-gaming-headphones": {
    slug: "best-gaming-headphones",
    title: "Best Gaming Headphones",
    category: "Accessories",
    icon: "Headphones",
    metaTitle: "Best Gaming Headphones (2026) - Dynamic Sound & Mic Comparison",
    metaDescription: "Hear every footstep clearly. Find the best gaming headphones rated by our AI for spatial audio, comfort, microphone clarity, and pricing.",
    intro: "High-quality audio is the difference between victory and defeat in modern multiplayer gaming. Standard audiophile headphones don't isolate positional audio cues or footstep noises. Gaming headphones are engineered specifically for low-latency feedback, clear team communication, and long-session comfort.",
    aiRecommendation: "If you prioritize pure directional spatial audio, the HyperX Cloud Stinger is spectacular. Mobile gamers who play on both phone and laptop will find the Logitech G435's wireless Bluetooth versatility incredibly useful.",
    products: [
      {
        id: "headphone-1",
        name: "Razer BlackShark V2 X",
        price: "₹3,999",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
        badge: "Best Comfort & Mic",
        bestFor: "Competitive shooters and professional streamers",
        specs: {
          "Drivers": "Razer TriForce 50mm",
          "Microphone": "HyperClear Cardioid",
          "Weight": "240g (Ultra-light)",
          "Connectivity": "3.5mm Wired",
          "Surround Sound": "7.1 Surround Sound"
        },
        pros: [
          "Incredibly comfortable memory foam ear cushions with passive noise isolation",
          "Crystal clear noise-canceling bendable microphone",
          "TriForce 50mm driver separates lows, mids, and highs perfectly"
        ],
        cons: [
          "Wired-only connection with standard cable",
          "Requires registration on Razer's site to unlock 7.1 surround drivers"
        ],
        buyUrl: "/search?q=Razer+BlackShark+V2+X"
      },
      {
        id: "headphone-2",
        name: "Logitech G435 Lightspeed Wireless",
        price: "₹5,499",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80",
        badge: "Best Wireless",
        bestFor: "Wireless freedom and multi-device connection",
        specs: {
          "Drivers": "40mm Audio Drivers",
          "Microphone": "Dual embedded beamforming mics",
          "Weight": "165g (World's Lightest)",
          "Connectivity": "2.4GHz Lightspeed + Bluetooth",
          "Battery Life": "Up to 18 hours"
        },
        pros: [
          "Weighs only 165g, eliminating neck fatigue during long raids",
          "Dual wireless tech connects seamlessly to PS5, PC, Switch, and mobile",
          "Sustainable build made with recycled plastics"
        ],
        cons: [
          "Microphone is beamforming (no physical boom mic, picks up slight room noise)",
          "Earcups are relatively small for larger ears"
        ],
        buyUrl: "/search?q=Logitech+G435"
      },
      {
        id: "headphone-3",
        name: "HyperX Cloud Stinger 2",
        price: "₹3,499",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80",
        badge: "Best Budget Overall",
        bestFor: "Value hunters seeking legendary HyperX durability",
        specs: {
          "Drivers": "50mm Directional Drivers",
          "Microphone": "Swivel-to-mute microphone",
          "Weight": "275g",
          "Connectivity": "3.5mm Jack",
          "Surround Sound": "DTS Headphone:X Spatial Audio"
        },
        pros: [
          "Excellent robust frame can withstand rough twists and falls",
          "Brilliant DTS audio license key included in package",
          "Super easy swivel-to-mute physical microphone toggle"
        ],
        cons: [
          "Earcup padding is slightly stiff during the first week of use",
          "Earcups get slightly warm during summer season"
        ],
        buyUrl: "/search?q=HyperX+Cloud+Stinger+2"
      }
    ],
    buyingGuide: {
      title: "Audio Metrics: What Makes a Great Gaming Headset?",
      sections: [
        {
          heading: "1. Spatial Sound Alignment",
          text: "Positional accuracy is crucial. Look for software support like DTS Headphone:X, Dolby Atmos, or 7.1 surround sound which simulates 3D coordinate soundscapes."
        },
        {
          heading: "2. Wired vs. Wireless Latency",
          text: "Wired (3.5mm/USB) ensures absolute 0ms lag. If choosing wireless, make sure it has a high-speed 2.4GHz USB dongle. Standard Bluetooth is too slow and exhibits audio lag in intense gunfights."
        }
      ]
    },
    faqs: [
      {
        question: "Can I use these gaming headphones with my PlayStation 5 or Xbox?",
        answer: "Wired headphones with a 3.5mm jack connect directly to PS5 and Xbox controllers. For wireless, Logitech G435's USB dongle is fully compatible with PS5 and PC, but not Xbox."
      },
      {
        question: "Do these headphones block outside room noises?",
        answer: "Most options feature passive noise-canceling earcups which reduce high-frequency sounds like fan hums, but none in this price bracket have Active Noise Canceling (ANC)."
      }
    ],
    relatedProducts: [
      { name: "Gaming Headphone Stand", price: "₹499", link: "/search?q=headset+stand" },
      { name: "External Sound Card", price: "₹999", link: "/search?q=usb+sound+card" }
    ],
    internalLinks: [
      { text: "Best Laptops Under ₹50,000", link: "/guides/best-laptops-under-50000" },
      { text: "Best Phones Under ₹20,000", link: "/guides/best-phones-under-20000" }
    ]
  },
  "best-smart-tvs": {
    slug: "best-smart-tvs",
    title: "Best Smart TVs",
    category: "Entertainment",
    icon: "Tv",
    metaTitle: "Best Smart TVs (2026) - Top 4K TV Recommendations & Reviews",
    metaDescription: "Ready to upgrade your home theater? Compare the top smart TVs from Xiaomi, Samsung, OnePlus, and LG. Features, pricing, and AI recommendations.",
    intro: "Modern smart TVs are much more than screens. They are the hub of home entertainment, featuring fluid 4K HDR displays, smart voice assistants, high-end Dolby audio processors, and direct integration with streaming platforms like Netflix, Prime Video, and YouTube. Here is our expert AI-assessed lineup for mid-sized living rooms.",
    aiRecommendation: "Xiaomi X Series delivers unmatched value with beautiful 4K resolution and Google TV OS. If color accuracy and brand longevity are your highest priorities, the Samsung Crystal series is the ideal choice.",
    products: [
      {
        id: "tv-1",
        name: "Xiaomi Smart TV X 43\"",
        price: "₹25,999",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80",
        badge: "Best Budget 4K",
        bestFor: "Affordable premium home-theatre seekers",
        specs: {
          "Resolution": "4K Ultra HD (3840x2160)",
          "OS": "Google TV with PatchWall",
          "Sound": "30W Dolby Audio Speakers",
          "HDR Support": "Dolby Vision, HDR10, HLG",
          "Ports": "3 HDMI 2.1, 2 USB"
        },
        pros: [
          "Dolby Vision display panel has deep blacks and vibrant contrast",
          "Google TV provides smooth personal recommendations without lag",
          "Chassis has narrow premium metallic bezels"
        ],
        cons: [
          "Standard speakers need a soundbar for rich deep bass",
          "Boot up takes about 15 seconds"
        ],
        buyUrl: "/search?q=Xiaomi+Smart+TV+X"
      },
      {
        id: "tv-2",
        name: "Samsung Crystal 4K Vivid Pro",
        price: "₹31,990",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80",
        badge: "Best Display Colors",
        bestFor: "Viewers who demand realistic true-to-life colors",
        specs: {
          "Resolution": "4K Crystal Processor",
          "OS": "Tizen OS Smart Hub",
          "Sound": "20W OTS Lite (Object Tracking)",
          "HDR Support": "HDR10+, Mega Contrast",
          "Ports": "3 HDMI, 1 USB"
        },
        pros: [
          "Crystal processor scales 1080p content beautifully to 4K",
          "Tizen OS has very clean interface and zero system lag",
          "Includes free curated live TV channels out of the box via Samsung TV Plus"
        ],
        cons: [
          "Does not support Dolby Vision natively",
          "Only 1 USB port makes it hard to connect multiple drives"
        ],
        buyUrl: "/search?q=Samsung+Crystal+4K"
      }
    ],
    buyingGuide: {
      title: "Smart TV Buying Guide: Resolution & OS",
      sections: [
        {
          heading: "1. Resolution Criterias",
          text: "Never buy a Full HD (1080p) TV if you have a budget above 20,000. 4K Ultra HD has four times the detail, making text crisp and streaming breathtaking."
        },
        {
          heading: "2. Audio Power",
          text: "Most slim TVs pack 20W or 30W stereo speakers. While good for news and talk shows, consider getting an external soundbar connected via HDMI ARC/eARC for cinema-like sound effects."
        }
      ]
    },
    faqs: [
      {
        question: "What is Google TV vs Android TV?",
        answer: "Google TV is the modernized interface built on top of Android TV. It provides a more organized home screen that recommends movies based on your viewing history across Netflix, Prime, and Hotstar."
      }
    ],
    relatedProducts: [
      { name: "Dolby Atmos Soundbar", price: "₹7,999", link: "/search?q=dolby+atmos+soundbar" },
      { name: "Full Motion TV Wall Mount", price: "₹1,299", link: "/search?q=tv+wall+mount" }
    ],
    internalLinks: [
      { text: "Best Laptops Under ₹50,000", link: "/guides/best-laptops-under-50000" },
      { text: "Best Gaming Headphones", link: "/guides/best-gaming-headphones" }
    ]
  },
  "best-washing-machines": {
    slug: "best-washing-machines",
    title: "Best Washing Machines",
    category: "Appliances",
    icon: "Waves",
    metaTitle: "Best Fully Automatic Washing Machines (2026) - LG, Samsung, Bosch",
    metaDescription: "Save water and detergent. AI compares top-load and front-load washing machines based on energy ratings, load capabilities, and performance reviews.",
    intro: "Modern fully automatic washing machines have revolutionized laundry. Today's models feature intelligent sensors that detect laundry weight, wash with hot steam to kill 99.9% of bacteria, and utilize digital inverter motors that are exceptionally quiet and consume minimal power.",
    aiRecommendation: "Front-load washing machines clean better and use less water, and the LG fully-automatic model leads in raw efficiency. If you are on a tight budget, the Whirlpool Top Load option gives reliable multi-cycle cleaning.",
    products: [
      {
        id: "wash-1",
        name: "LG 7kg 5 Star Inverter Front Load",
        price: "₹28,990",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1582730147233-ac81111d044e?auto=format&fit=crop&w=600&q=80",
        badge: "Best Efficiency & Overall",
        bestFor: "Families looking for lowest water and electricity bills",
        specs: {
          "Type": "Fully Automatic Front Load",
          "Capacity": "7.0 kg (Ideal for 3-4 members)",
          "Motor Speed": "1200 RPM high-speed spin",
          "Special Features": "6 Motion DD Tech, Steam Wash",
          "Energy Rating": "5 Star BEE Certified"
        },
        pros: [
          "Direct Drive motor is mounted on the drum, leading to 0% belt noise",
          "Inbuilt heater heats water to 60°C for deep sanitization",
          "Smart diagnosis feature links with smartphone app"
        ],
        cons: [
          "Requires a higher water pressure to run efficiently",
          "Wash cycle times are longer compared to top load models"
        ],
        buyUrl: "/search?q=LG+7kg+Front+Load"
      },
      {
        id: "wash-2",
        name: "Whirlpool 7.5kg 5 Star Top Load",
        price: "₹16,490",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80",
        badge: "Best Budget",
        bestFor: "Budget-conscious buyers seeking large capacity",
        specs: {
          "Type": "Fully Automatic Top Load",
          "Capacity": "7.5 kg",
          "Motor Speed": "740 RPM",
          "Special Features": "Spirowash, Hard Water wash filter",
          "Energy Rating": "5 Star BEE"
        },
        pros: [
          "Very easy to load without bending down",
          "Includes express 15-minute quick wash mode",
          "Works perfectly even with hard ground water"
        ],
        cons: [
          "Uses more water than front-load options",
          "No built-in water heating mechanism"
        ],
        buyUrl: "/search?q=Whirlpool+7.5kg+Top+Load"
      }
    ],
    buyingGuide: {
      title: "Front Load vs Top Load: The Definitive Comparison",
      sections: [
        {
          heading: "Why Front Loaders Win",
          text: "Front load machines use gravity to tumble clothes. This process uses up to 50% less water, requires less detergent, and inflicts minimal wear-and-tear on delicate fabrics."
        },
        {
          heading: "Why Top Loaders Win",
          text: "Top loaders allow you to add forgotten clothes mid-cycle. They are cheaper to purchase, require less maintenance, and don't require you to bend down."
        }
      ]
    },
    faqs: [
      {
        question: "How often should I clean my washing machine drum?",
        answer: "We recommend running a 'Tub Clean' cycle once a month using descaling powder to prevent lime-scale buildup and musty odors."
      }
    ],
    relatedProducts: [
      { name: "Liquid Detergent for Front Load", price: "₹349", link: "/search?q=front+load+liquid+detergent" },
      { name: "Anti-Vibration Foot Pads", price: "₹299", link: "/search?q=anti+vibration+pads" }
    ],
    internalLinks: [
      { text: "Best Air Conditioners", link: "/guides/best-air-conditioners" },
      { text: "Best Refrigerators", link: "/guides/best-refrigerators" }
    ]
  },
  "best-air-conditioners": {
    slug: "best-air-conditioners",
    title: "Best Air Conditioners",
    category: "Appliances",
    icon: "Wind",
    metaTitle: "Best Air Conditioners (2026) - Energy-Saving 1.5 Ton 5 Star Split ACs",
    metaDescription: "Beat the summer heat. AI analyzes split air conditioners based on electricity savings, smart cooling features, and condenser durability.",
    intro: "Summers are getting harsher, and an efficient Air Conditioner is no longer a luxury. Modern split ACs feature intelligent inverter compressors that adapt speed to room temperature, ensuring consistent cooling while cutting down electricity consumption by up to 35%. Check out our AI evaluations of top 1.5 Ton models.",
    aiRecommendation: "Daikin is the undisputed king of build quality and silent operation. For smart features, including mobile app controls and voice command integration, Panasonic leads the pack.",
    products: [
      {
        id: "ac-1",
        name: "Daikin 1.5 Ton 5 Star Inverter Split AC",
        price: "₹45,490",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
        badge: "Best Quality & Silent Operation",
        bestFor: "Master bedrooms and office cabins demanding silent cooling",
        specs: {
          "Capacity": "1.5 Ton (Ideal for 111-150 sq ft)",
          "Energy Rating": "5 Star BEE (ISEER 5.2)",
          "Condenser": "100% Copper with Anti-Corrosion",
          "Noise Level": "Sublime 32 dB",
          "Gas Type": "Eco-friendly R32"
        },
        pros: [
          "Extremely quiet, ensuring perfect sleep",
          "Coanda airflow avoids blowing chilly air directly onto your face",
          "Power Chill mode cools rooms down in less than 5 minutes"
        ],
        cons: [
          "Lacks smart Wi-Fi controls in the base variant",
          "Installation charges are higher than other brands"
        ],
        buyUrl: "/search?q=Daikin+1.5+Ton+5+Star"
      },
      {
        id: "ac-2",
        name: "Panasonic 1.5 Ton 5 Star Smart AC",
        price: "₹44,990",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80",
        badge: "Best Smart Features",
        bestFor: "Tech-savvy users wanting remote mobile app access",
        specs: {
          "Capacity": "1.5 Ton",
          "Energy Rating": "5 Star BEE (ISEER 5.1)",
          "Condenser": "Copper with Shield Blu Technology",
          "Noise Level": "37 dB",
          "Connectivity": "Wi-Fi (Works with Alexa & Google)"
        },
        pros: [
          "Miraie App lets you set custom hourly sleep temperature curves",
          "Equipped with PM 0.1 air purification filter",
          "Convertible modes adapt capacity based on room occupancy"
        ],
        cons: [
          "Outdoor fan unit is slightly bulky",
          "Companion app requires stable home Wi-Fi"
        ],
        buyUrl: "/search?q=Panasonic+1.5+Ton+5+Star"
      }
    ],
    buyingGuide: {
      title: "Understanding ISEER Ratings & Energy Bills",
      sections: [
        {
          heading: "What is ISEER?",
          text: "ISEER stands for Indian Seasonal Energy Efficiency Ratio. The higher the ISEER number, the more efficient the AC. A 5-star AC typically has an ISEER of 5.0 or above, consuming nearly 20% less energy than a 3-star AC."
        },
        {
          heading: "Why Copper Condensers are non-negotiable",
          text: "Always select ACs with 100% copper coils. Aluminum coils are cheaper but prone to gas leakage and are highly expensive and difficult to repair."
        }
      ]
    },
    faqs: [
      {
        question: "Is 1.5 Ton sufficient for my living room?",
        answer: "A 1.5 Ton AC is perfect for rooms up to 150 square feet. If your room is larger, or has direct sunlight facing walls, consider a 2.0 Ton AC."
      }
    ],
    relatedProducts: [
      { name: "Digital Voltage Stabilizer", price: "₹1,999", link: "/search?q=voltage+stabilizer" },
      { name: "AC Dust Cover", price: "₹349", link: "/search?q=ac+cover" }
    ],
    internalLinks: [
      { text: "Best Washing Machines", link: "/guides/best-washing-machines" },
      { text: "Best Refrigerators", link: "/guides/best-refrigerators" }
    ]
  },
  "best-refrigerators": {
    slug: "best-refrigerators",
    title: "Best Refrigerators",
    category: "Appliances",
    icon: "Database",
    metaTitle: "Best Refrigerators (2026) - Dynamic Double Door Models compared",
    metaDescription: "Keep your food fresh. AI reviews the top double door refrigerators based on cooling efficiency, smart storage capacity, and electricity usage.",
    intro: "Refrigerators are the heart of the kitchen, running 24/7. Modern frost-free double door models offer advanced cooling technologies like all-around multi-airflow, convertible freezer modes, and long-lasting digital inverter compressors that operate on home solar power and stabilizers.",
    aiRecommendation: "Samsung leads in convertible space options, allowing you to turn your freezer into extra fridge storage at the push of a button. LG offers exceptionally silent smart inverter compressors.",
    products: [
      {
        id: "fridge-1",
        name: "Samsung 236L Inverter Double Door",
        price: "₹25,990",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1571175432247-5152a138c24f?auto=format&fit=crop&w=600&q=80",
        badge: "Best Overall & Convertible",
        bestFor: "Nuclear families looking for flexible storage capacity",
        specs: {
          "Capacity": "236 Liters (Ideal for 3-4 members)",
          "Defrost Type": "Frost-Free",
          "Compressor": "Digital Inverter (20 Years Warranty)",
          "Energy Rating": "3 Star BEE rating"
        },
        pros: [
          "Convertible 3-in-1 freezer lets you gain extra fresh food space",
          "Moist Fresh Zone preserves leafy greens for up to 15 days",
          "Runs smoothly on standard home solar power grids"
        ],
        cons: [
          "Freezer lacks an independent light bulb",
          "Only 3 Star rating (5 Star double doors are rare and expensive)"
        ],
        buyUrl: "/search?q=Samsung+236L+Refrigerator"
      },
      {
        id: "fridge-2",
        name: "LG 242L Smart Inverter Double Door",
        price: "₹26,490",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
        badge: "Best Silent Cooling",
        bestFor: "Buyers prioritizing durability and noise-free operation",
        specs: {
          "Capacity": "242 Liters",
          "Defrost Type": "Frost Free Smart Diagnostic",
          "Compressor": "Smart Inverter Compressor",
          "Energy Rating": "3 Star BEE"
        },
        pros: [
          "Door Cooling+ blows cold air from the front vents to cool beverages faster",
          "Smart Connect automatically switches to your home inverter during power cuts",
          "Exceptional scratch-resistant metallic finish"
        ],
        cons: [
          "Ice maker tray is not removable",
          "Shelves are not height adjustable"
        ],
        buyUrl: "/search?q=LG+242L+Refrigerator"
      }
    ],
    buyingGuide: {
      title: "How to Choose Refrigerator Capacity (Liters)",
      sections: [
        {
          heading: "Capacity Recommendations",
          text: "Single door (180L - 200L) is sufficient for singles and couples. Double door (230L - 300L) is perfect for nuclear families of 3-4 members. Side-by-side models (500L+) are necessary for large joint families."
        },
        {
          heading: "Convertible Freezers: A Must-Have Feature",
          text: "Convertible technology allows you to turn the freezer compartment into a regular fridge, increasing fresh food storage space by up to 30% during parties or festivals."
        }
      ]
    },
    faqs: [
      {
        question: "Does a double door refrigerator consume high electricity?",
        answer: "Double door refrigerators use slightly more power than single door models due to frost-free auto defrost heaters, but modern 3-star inverter models cost only about ₹1,800 to ₹2,200 per year in electricity."
      }
    ],
    relatedProducts: [
      { name: "Refrigerator Dust Cover", price: "₹299", link: "/search?q=fridge+cover" },
      { name: "Odor Remover Charcoal Pack", price: "₹399", link: "/search?q=fridge+deodorizer" }
    ],
    internalLinks: [
      { text: "Best Washing Machines", link: "/guides/best-washing-machines" },
      { text: "Best Air Conditioners", link: "/guides/best-air-conditioners" }
    ]
  },
  "best-power-banks": {
    slug: "best-power-banks",
    title: "Best Power Banks",
    category: "Accessories",
    icon: "Zap",
    metaTitle: "Best Power Banks (2026) - Fast Charging 10000 & 20000mAh",
    metaDescription: "Never run out of phone battery. AI evaluates power banks based on weight, charging standards, multi-port capabilities, and safety certifications.",
    intro: "With power-hungry 5G networks, dynamic screens, and constant navigation, mobile phone batteries rarely last a full day. A reliable power bank with fast Power Delivery (PD) ensures you stay connected. Here are the top-rated charging bricks evaluated by our AI.",
    aiRecommendation: "For long weekend trips or running multiple devices, the Mi 20000mAh is exceptionally durable and reliable. Commuters looking for an ultra-slim pocket friendly option should select the Ambrane 10000mAh.",
    products: [
      {
        id: "power-1",
        name: "Mi Power Bank 3i 20000mAh",
        price: "₹2,199",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1609592424109-dd08ffcf3e68?auto=format&fit=crop&w=600&q=80",
        badge: "Best Heavy Duty",
        bestFor: "Heavy users and long weekend camping trips",
        specs: {
          "Capacity": "20000 mAh Lithium Polymer",
          "Output Speed": "18W Fast Charging",
          "Ports": "Dual USB Output, Type-C Input/Output",
          "Safety": "12-Layer Circuit Protection"
        },
        pros: [
          "Huge capacity charges standard phones 4 to 5 times completely",
          "Triple port output lets you charge three devices simultaneously",
          "Advanced low current charging mode for fitness bands & earbuds"
        ],
        cons: [
          "Quite bulky and heavy (weighs 430 grams)",
          "Takes about 6.5 hours to recharge completely using 18W adapter"
        ],
        buyUrl: "/search?q=Mi+20000mAh+Power+Bank"
      },
      {
        id: "power-2",
        name: "Ambrane 10000mAh 22.5W Power Bank",
        price: "₹1,299",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80",
        badge: "Best Slim Portability",
        bestFor: "Daily office commuters wanting a pocket-sized backup",
        specs: {
          "Capacity": "10000 mAh",
          "Output Speed": "22.5W Ultra Fast Charge",
          "Ports": "USB-A & Type-C bi-directional PD",
          "Safety": "Overcharge & short circuit filters"
        },
        pros: [
          "Extremely thin and lightweight (weighs just 180 grams)",
          "Super fast 22.5W speed charges compatible phones up to 60% in 30 minutes",
          "Scratch resistant premium metallic body shell"
        ],
        cons: [
          "Only holds enough charge for about 1.5 to 2 smartphone recharges",
          "Metallic body gets slightly warm during ultra fast charging"
        ],
        buyUrl: "/search?q=Ambrane+10000mAh+Power+Bank"
      }
    ],
    buyingGuide: {
      title: "What to Look for in a Power Bank (2026)",
      sections: [
        {
          heading: "1. USB-C Power Delivery (PD)",
          text: "Always buy power banks that support bi-directional Power Delivery via Type-C. This ensures you can fast-charge your phone, and also fast-recharge the power bank itself using a Type-C adapter."
        },
        {
          heading: "2. 10000mAh vs 20000mAh Capacity",
          text: "10000mAh is lightweight, fits in jeans pockets, and is ideal for daily commutes. 20000mAh is bulky but essential for multi-day trips where power sockets are unavailable."
        }
      ]
    },
    faqs: [
      {
        question: "Are these power banks allowed on commercial airplane flights?",
        answer: "Yes, standard power banks under 27000mAh (100Wh) are allowed in airplane cabin hand-luggage, but they are strictly prohibited in checked-in baggage."
      }
    ],
    relatedProducts: [
      { name: "3-in-1 Fast Charging Braided Cable", price: "₹349", link: "/search?q=3+in+1+charging+cable" },
      { name: "Compact Carrying Pouch", price: "₹249", link: "/search?q=power+bank+pouch" }
    ],
    internalLinks: [
      { text: "Best Phones Under ₹20,000", link: "/guides/best-phones-under-20000" },
      { text: "Best Laptops Under ₹50,000", link: "/guides/best-laptops-under-50000" }
    ]
  }
};

// Map string icon names to corresponding Lucide icons
const IconRenderer = ({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) => {
  switch (name) {
    case "Smartphone": return <Smartphone size={size} className={className} />;
    case "Laptop": return <Laptop size={size} className={className} />;
    case "Headphones": return <Headphones size={size} className={className} />;
    case "Tv": return <Tv size={size} className={className} />;
    case "Waves": return <Waves size={size} className={className} />;
    case "Wind": return <Wind size={size} className={className} />;
    case "Database": return <Database size={size} className={className} />;
    case "Zap": return <Zap size={size} className={className} />;
    default: return <BookOpen size={size} className={className} />;
  }
};

export default function ShoppingGuides() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reviews' | 'comparison' | 'buying-guide' | 'faqs'>('reviews');
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [quizRecommendation, setQuizRecommendation] = useState<string | null>(null);

  // Scroll to top when view or slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuizAnswers({});
    setQuizRecommendation(null);
  }, [slug]);

  // Handle individual guide schema generation
  const activeGuide = slug ? GUIDES_DATA[slug] : null;

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: activeGuide?.metaTitle || "BuyWise Shopping Guides",
        text: activeGuide?.metaDescription || "Check out these AI-powered buying guides!",
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Guide link copied to clipboard!");
    }
  };

  const runRecommendationQuiz = (criteriaKey: string, productVal: string) => {
    setQuizAnswers(prev => ({ ...prev, [criteriaKey]: productVal }));
  };

  useEffect(() => {
    if (activeGuide) {
      // Very simple interactive logic based on budget/intent
      if (activeGuide.slug === 'best-phones-under-20000') {
        const pref = quizAnswers['priority'];
        if (pref === 'gaming') setQuizRecommendation('iQOO Z9s 5G');
        else if (pref === 'display') setQuizRecommendation('Moto G85 5G');
        else if (pref === 'battery') setQuizRecommendation('Samsung Galaxy M35 5G');
        else if (pref === 'software') setQuizRecommendation('OnePlus Nord CE 4 Lite 5G');
      } else if (activeGuide.slug === 'best-laptops-under-50000') {
        const pref = quizAnswers['priority'];
        if (pref === 'gaming') setQuizRecommendation('Acer Aspire Lite (Core i5)');
        else if (pref === 'battery') setQuizRecommendation('Lenovo IdeaPad Slim 3');
        else if (pref === 'typing') setQuizRecommendation('HP 15s (Ryzen 5)');
        else if (pref === 'value') setQuizRecommendation('ASUS Vivobook 15');
      } else {
        // Fallback to highest rated first product
        if (activeGuide.products.length > 0) {
          setQuizRecommendation(activeGuide.products[0].name);
        }
      }
    }
  }, [quizAnswers, activeGuide]);

  // 1. LISTING VIEW (All Guides)
  if (!activeGuide) {
    const defaultMetaTitle = "BuyWise Shopping Guides - SEO Optimized Product Recommendations";
    const defaultMetaDescription = "Discover AI-curated shopping guides for phones, laptops, smart TVs, home appliances, and accessories with detailed price tracking, comparisons, pros & cons, and buying tips.";
    const canonicalListingUrl = "https://buywiser.store/guides";

    // Structured graph schema for listing page
    const listingSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "BuyWise Shopping Guides",
      "description": defaultMetaDescription,
      "url": canonicalListingUrl,
      "about": {
        "@type": "Thing",
        "name": "Consumer Electronics & Appliances Buying Guides"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BuyWise",
        "logo": "https://buywiser.store/icon.png"
      }
    };

    return (
      <div className="min-h-screen bg-[#000000] text-white pt-24 md:pt-32 pb-16 px-4 md:px-16 relative overflow-hidden">
        <Helmet>
          <title>{defaultMetaTitle}</title>
          <meta name="description" content={defaultMetaDescription} />
          <link rel="canonical" href={canonicalListingUrl} />
          <script type="application/ld+json">
            {JSON.stringify(listingSchema)}
          </script>
        </Helmet>

        {/* Ambient Grid Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="grid-lines-anim absolute inset-0"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-white/40 mb-6">
            <Link to="/" className="hover:text-white transition-colors">HOME</Link>
            <ChevronRight size={12} />
            <span className="text-[#FF3B30] font-black">SHOPPING GUIDES</span>
          </div>

          {/* Heading */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5 text-xs text-white/60 mb-4 uppercase tracking-widest font-mono">
              <Sparkles size={12} className="text-[#FF3B30] animate-pulse" /> AI-powered comparisons
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight uppercase leading-tight mb-4">
              SHOPPING <span className="text-[#FF3B30]">GUIDES</span>
            </h1>
            <p className="text-white/60 max-w-2xl leading-relaxed text-sm md:text-base">
              Say goodbye to marketing fluff. Our neural analysis engine parses tens of thousands of actual customer reviews, specifications, and genuine pricing vectors to build fully optimized recommendations.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(GUIDES_DATA).map((guide) => (
              <motion.div
                key={guide.slug}
                whileHover={{ y: -4, borderColor: "rgba(255,59,48,0.4)" }}
                className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/5 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF3B30] mb-6 group-hover:bg-[#FF3B30]/10 transition-colors">
                    <IconRenderer name={guide.icon} size={22} />
                  </div>
                  <span className="text-[10px] font-black font-mono text-white/40 uppercase tracking-widest block mb-2">{guide.category}</span>
                  <h2 className="text-xl font-black font-display text-white uppercase group-hover:text-[#FF3B30] transition-colors mb-3 leading-snug">
                    {guide.title}
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed mb-6">
                    {guide.metaDescription.replace(/^Looking for the\s+/i, '').substring(0, 120)}...
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/guides/${guide.slug}`)}
                  className="w-full py-2.5 rounded-xl border border-white/10 hover:border-[#FF3B30] bg-white/5 hover:bg-[#FF3B30] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-white"
                >
                  View Full Guide <ArrowRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. INDIVIDUAL GUIDE DETAIL VIEW
  const canonicalUrl = `https://buywiser.store/guides/${activeGuide.slug}`;
  
  // JSON-LD dynamic schemas for Product comparison and FAQ page
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://buywiser.store/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shopping Guides",
        "item": "https://buywiser.store/guides"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": activeGuide.title,
        "item": canonicalUrl
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": activeGuide.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": activeGuide.metaTitle,
    "description": activeGuide.metaDescription,
    "image": activeGuide.products[0]?.image,
    "datePublished": "2026-07-10T12:00:00Z",
    "dateModified": "2026-07-10T12:00:00Z",
    "author": {
      "@type": "Person",
      "name": "Awan Warsi",
      "jobTitle": "CEO & Founder of BuyWise"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BuyWise",
      "logo": {
        "@type": "ImageObject",
        "url": "https://buywiser.store/icon.png"
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 md:pt-32 pb-20 px-4 md:px-12 relative overflow-hidden">
      <Helmet>
        <title>{activeGuide.metaTitle}</title>
        <meta name="description" content={activeGuide.metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 right-[-10%] w-[400px] h-[400px] rounded-full bg-[#FF3B30]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-40 left-[-10%] w-[350px] h-[350px] rounded-full bg-white/3 blur-[100px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back Link and Sharing bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-white/40">
            <Link to="/" className="hover:text-white transition-colors">HOME</Link>
            <ChevronRight size={12} />
            <Link to="/guides" className="hover:text-white transition-colors uppercase">GUIDES</Link>
            <ChevronRight size={12} />
            <span className="text-[#FF3B30] font-black uppercase">{activeGuide.slug.replace(/-/g, " ")}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/guides')}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Guides
            </button>
            <span className="text-white/10">|</span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer"
            >
              <Share2 size={12} /> Share
            </button>
          </div>
        </div>

        {/* Intro Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <span className="text-xs font-black font-mono text-[#FF3B30] uppercase tracking-widest block mb-2">
              {activeGuide.category} Comparison Node
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-display text-white uppercase tracking-tight mb-6 leading-tight">
              {activeGuide.title}
            </h1>
            <p className="text-white/70 leading-relaxed text-sm md:text-base mb-8">
              {activeGuide.intro}
            </p>

            {/* AI Recommendation Box */}
            <div className="bg-gradient-to-r from-red-900/10 to-transparent border-l-2 border-[#FF3B30] p-6 rounded-r-2xl mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-[#FF3B30] animate-pulse" />
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white">AI Engine Verdict</h4>
              </div>
              <p className="text-xs md:text-sm text-white/80 leading-relaxed italic">
                "{activeGuide.aiRecommendation}"
              </p>
            </div>
          </div>

          {/* Quick interactive Selector Widget */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 self-start">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Award size={16} className="text-[#FF3B30]" /> Interactive Advisor
            </h3>
            <p className="text-xs text-white/50 leading-relaxed mb-6">
              Choose your single biggest priority and our neural module will instantly recommend the ultimate fit.
            </p>
            
            <div className="space-y-2 mb-6">
              {activeGuide.slug.includes("phone") ? (
                <>
                  {[
                    { key: 'gaming', label: 'Gaming Performance' },
                    { key: 'display', label: 'Display & Media' },
                    { key: 'battery', label: 'Battery Capacity' },
                    { key: 'software', label: 'Clean Software OS' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => runRecommendationQuiz('priority', opt.key)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-medium transition-all flex items-center justify-between border ${
                        quizAnswers['priority'] === opt.key 
                          ? 'bg-[#FF3B30] text-white border-[#FF3B30]' 
                          : 'bg-white/5 text-white/70 border-white/5 hover:border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                      <ChevronRight size={12} className={quizAnswers['priority'] === opt.key ? "text-white" : "text-white/40"} />
                    </button>
                  ))}
                </>
              ) : activeGuide.slug.includes("laptop") ? (
                <>
                  {[
                    { key: 'gaming', label: 'Multitasking Core i5' },
                    { key: 'battery', label: 'Sustained Office Battery' },
                    { key: 'typing', label: 'Typing Comfort' },
                    { key: 'value', label: 'Pure Budget Value' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => runRecommendationQuiz('priority', opt.key)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-medium transition-all flex items-center justify-between border ${
                        quizAnswers['priority'] === opt.key 
                          ? 'bg-[#FF3B30] text-white border-[#FF3B30]' 
                          : 'bg-white/5 text-white/70 border-white/5 hover:border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                      <ChevronRight size={12} className={quizAnswers['priority'] === opt.key ? "text-white" : "text-white/40"} />
                    </button>
                  ))}
                </>
              ) : (
                <div className="p-3 bg-white/5 border border-white/5 rounded-lg text-center text-xs text-white/50 font-mono">
                  Advisor active for smartphones and laptops.
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {quizRecommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl"
                >
                  <div className="text-[9px] font-black text-[#FF3B30] uppercase tracking-widest mb-1">Recommended Match</div>
                  <div className="text-sm font-black uppercase text-white">{quizRecommendation}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content Tabs (Reviews, Comparison Matrix, Buying Guide, FAQs) */}
        <div className="flex border-b border-white/5 mb-8 overflow-x-auto scrollbar-none">
          {[
            { id: 'reviews', label: 'Expert Reviews' },
            { id: 'comparison', label: 'Comparison Matrix' },
            { id: 'buying-guide', label: 'Buying Guide' },
            { id: 'faqs', label: 'FAQs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-[#FF3B30] text-[#FF3B30]' 
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="mb-16">
          {activeTab === 'reviews' && (
            <div className="space-y-12">
              {activeGuide.products.map((prod, index) => (
                <div 
                  key={prod.id}
                  className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 hover:border-white/10 transition-all"
                >
                  {/* Left Column: Image and Badges */}
                  <div className="flex flex-col gap-4">
                    <div className="aspect-square w-full rounded-2xl border border-white/10 overflow-hidden relative bg-[#111]">
                      <PremiumProductImage 
                        src={prod.image} 
                        alt={prod.name} 
                        className="w-full h-full p-2"
                      />
                      <div className="absolute top-4 left-4 z-10 bg-[#FF3B30] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        {prod.badge}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-black text-lg mb-1">{prod.price}</h4>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              fill={i < Math.floor(prod.rating) ? "currentColor" : "none"} 
                              className={i < Math.floor(prod.rating) ? "text-yellow-500" : "text-white/20"} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-white/40">{prod.rating} / 5</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-green-400 block mb-3">Best for: {prod.bestFor}</span>
                    </div>
                  </div>

                  {/* Middle Column: Specs & Technical data */}
                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h3 className="text-xl md:text-2xl font-black font-display text-white uppercase">{prod.name}</h3>
                        <span className="font-mono text-xs text-white/30">#{index + 1} PICK</span>
                      </div>

                      {/* Spec Badges Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {Object.entries(prod.specs).map(([key, value]) => (
                          <div key={key} className="bg-white/3 border border-white/5 rounded-xl p-3">
                            <span className="text-[9px] font-mono font-black text-white/40 uppercase tracking-wider block mb-0.5">{key}</span>
                            <span className="text-xs text-white/80 font-medium">{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pros and Cons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-[#FF3B30] mb-3 flex items-center gap-1.5">
                            <Check size={12} className="text-green-400" /> Key Differentiators
                          </h4>
                          <ul className="space-y-2">
                            {prod.pros.map((pro, i) => (
                              <li key={i} className="text-xs text-white/70 leading-relaxed flex items-start gap-2">
                                <span className="text-green-400 shrink-0 mt-1">•</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1.5">
                            <X size={12} className="text-red-400" /> Drawbacks
                          </h4>
                          <ul className="space-y-2">
                            {prod.cons.map((con, i) => (
                              <li key={i} className="text-xs text-white/60 leading-relaxed flex items-start gap-2">
                                <span className="text-red-400 shrink-0 mt-1">•</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link 
                        to={prod.buyUrl}
                        className="flex-1 py-3 bg-[#FF3B30] hover:bg-[#FF3B30]/80 text-white text-xs font-black uppercase tracking-widest text-center rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={14} /> Shop at lowest price
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-black uppercase font-display text-white">Comparison Matrix</h3>
                <p className="text-xs text-white/50 leading-relaxed mt-1">
                  Side-by-side performance audit based on key specification vectors.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/3 font-mono text-[10px] text-white/50 uppercase tracking-wider">
                      <th className="p-4">Product name</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">AI Rating</th>
                      <th className="p-4">Differentiator</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeGuide.products.map(prod => (
                      <tr key={prod.id} className="border-b border-white/5 hover:bg-white/2 transition-colors text-xs text-white/80">
                        <td className="p-4 font-black text-white">{prod.name}</td>
                        <td className="p-4 font-mono font-bold text-[#FF3B30]">{prod.price}</td>
                        <td className="p-4 font-mono">{prod.rating} ★</td>
                        <td className="p-4 text-white/60">{prod.bestFor}</td>
                        <td className="p-4">
                          <Link 
                            to={prod.buyUrl}
                            className="px-4 py-2 bg-white/5 hover:bg-[#FF3B30] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors inline-block"
                          >
                            Select
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'buying-guide' && (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-8">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-2xl font-black font-display text-white uppercase mb-2">{activeGuide.buyingGuide.title}</h3>
                <p className="text-xs text-white/40 font-mono">NEURAL DATA VERIFIED PURCHASE TIPS</p>
              </div>
              
              <div className="space-y-6">
                {activeGuide.buyingGuide.sections.map((sect, i) => (
                  <div key={i} className="bg-white/2 border border-white/5 p-5 rounded-2xl">
                    <h4 className="text-base font-black text-white mb-2 font-display">{sect.heading}</h4>
                    <p className="text-xs md:text-sm text-white/70 leading-relaxed">{sect.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-white/5 pb-4 mb-6">
                <h3 className="text-xl font-black font-display text-white uppercase flex items-center gap-2">
                  <HelpCircle size={20} className="text-[#FF3B30]" /> Frequently Asked Questions
                </h3>
              </div>
              <div className="space-y-4">
                {activeGuide.faqs.map((faq, i) => (
                  <div key={i} className="bg-white/2 border border-white/5 p-5 rounded-2xl">
                    <h4 className="text-sm font-black text-white mb-2 leading-snug">{faq.question}</h4>
                    <p className="text-xs md:text-sm text-white/60 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Internal Links / Cross references */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-12">
          {/* Related Products */}
          <div className="bg-white/2 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Related Deals</h4>
            <div className="space-y-3">
              {activeGuide.relatedProducts.map((rel, i) => (
                <Link 
                  key={i} 
                  to={rel.link} 
                  className="flex justify-between items-center p-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl transition-colors"
                >
                  <span className="text-xs text-white/80 font-bold">{rel.name}</span>
                  <span className="text-[10px] font-mono text-[#FF3B30] uppercase font-black">{rel.price} →</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Internal Links */}
          <div className="bg-white/2 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Other SEO Guides</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeGuide.internalLinks.map((il, i) => (
                <Link 
                  key={i} 
                  to={il.link}
                  className="p-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl text-xs text-white/70 hover:text-white transition-colors block"
                >
                  {il.text}
                </Link>
              ))}
              <Link 
                to="/guides"
                className="p-3 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20 rounded-xl text-xs text-[#FF3B30] hover:text-[#FF3B30]/80 transition-colors block font-black text-center uppercase tracking-wider col-span-1 sm:col-span-2"
              >
                All Shopping Guides
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
