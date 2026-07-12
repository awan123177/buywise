import { addDealDirectly, loadDatabase } from './src/server/gamificationDb';

loadDatabase();

addDealDirectly({
  title: "Woman's Yellow Lehenga Choli",
  category: "fashion",
  oldPrice: 17500,
  newPrice: 12075,
  discountPercent: 31,
  thumbnail: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcROnLRAd4DZUxG_FaW2ObrKYsmBwt30teuEkSwCkAhMuh5o_9CGq3PcORYZiZ8V63noKzdyp5B7hHt4_ILznQmZxpjhCJEImQXMZDx5sS9dDtb8pXUp-GXW",
  source: "Amazon.in",
  link: "https://www.amazon.in/gp/product/B0H7JS5HP2?smid=AUHUIAHGSR283&psc=1&linkCode=ll2&tag=buywiseind0f8-21&linkId=5446649d81e1fa2ea9f549a1783aad99&ref_=as_li_ss_tl",
  isBestSeller: true,
  isEditorPick: true,
  isFlashDeal: true,
  timeRemaining: "24h 00m"
});

console.log("Deal added!");
