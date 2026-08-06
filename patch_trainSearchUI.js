import fs from 'fs';

let code = fs.readFileSync('src/components/TravelSearch/TrainSearch.tsx', 'utf8');

// Remove trainClass state
code = code.replace(
    "const [trainClass, setTrainClass] = useState('3A');",
    ""
);

// Update fetch
code = code.replace(
    "/api/travel/trains?origin=${origin}&destination=${destination}&date=${departDate}&adults=${adults}&class=${trainClass}&quota=${quota}",
    "/api/travel/trains?origin=${origin}&destination=${destination}&date=${departDate}&adults=${adults}&quota=${quota}"
);

// Remove trainClass select
const classSelect = `<div className="flex items-center gap-2 bg-[#111] rounded-lg p-1 px-4 border border-white/10 h-[40px]">
             <Star size={14} className="text-white/50" />
             <select 
               value={trainClass}
               onChange={(e) => setTrainClass(e.target.value)}
               className="bg-transparent text-white font-bold text-xs outline-none w-full appearance-none uppercase tracking-widest cursor-pointer"
             >
               <option value="1A" className="bg-[#111]">1A (First AC)</option>
               <option value="2A" className="bg-[#111]">2A (Second AC)</option>
               <option value="3A" className="bg-[#111]">3A (Third AC)</option>
               <option value="SL" className="bg-[#111]">SL (Sleeper)</option>
               <option value="CC" className="bg-[#111]">CC (Chair Car)</option>
             </select>
          </div>`;

code = code.replace(classSelect, "");
// If the precise string match fails, let's just do a regex replace
code = code.replace(/<div className="flex items-center gap-2 bg-\[#111\] rounded-lg p-1 px-4 border border-white\/10 h-\[40px\]">[\s\S]*?<option value="CC" className="bg-\[#111\]">CC \(Chair Car\)<\/option>\s*<\/select>\s*<\/div>/, "");

// Sort logic uses price, but now price is inside classes. We will sort by the cheapest class price in the train.
code = code.replace(
    "case 'lowest_price': return a.price - b.price;",
    "case 'lowest_price': return Math.min(...a.classes.map((c:any) => c.price)) - Math.min(...b.classes.map((c:any) => c.price));"
);

// UI generation for each train card. Currently it renders train.price and train.availability in a side column.
// We should replace the side column and bottom bar with a class list.
const oldUIBlock = `<div className="w-full md:w-56 flex flex-col items-end justify-center border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.05)] pt-4 md:pt-0 pl-0 md:pl-6 space-y-3">
                      <div className="text-right">
                         <div className="text-[10px] font-bold text-[#FFD700] uppercase tracking-widest mb-1">{train.availability}</div>
                         <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] font-mono drop-shadow-[0_0_8px_rgba(255,59,48,0.3)]">{formatPrice(train.price)}</div>
                      </div>
                      <button 
                         onClick={() => handleBook(train.booking_link)}
                        className="w-full bg-[#FF3B30] hover:bg-white text-black py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all text-center shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)]"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-white/50 relative z-10">
                    <span className="flex items-center gap-1.5 text-[#FF3B30]"><Shield size={14} /> IRCTC Authorized</span>
                    <span className="flex items-center gap-1.5 text-[#FF3B30]"><Zap size={14} /> Class: {train.travel_class}</span>
                    <span className="flex items-center gap-1.5 text-[#FFD700]"><Users size={14} /> Quota: {train.quota}</span>
                  </div>`;

const newUIBlock = `<div className="w-full md:w-56 flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.05)] pt-4 md:pt-0 pl-0 md:pl-6 space-y-3">
                      <div className="text-left md:text-right text-[10px] font-bold text-white/50 uppercase tracking-widest">
                         Starts from
                      </div>
                      <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] font-mono drop-shadow-[0_0_8px_rgba(255,59,48,0.3)]">
                         {formatPrice(Math.min(...train.classes.map((c:any) => c.price)))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Classes List */}
                  <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-3 relative z-10">
                    <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                       <span className="flex items-center gap-1.5 text-[#FF3B30]"><Shield size={14} /> IRCTC Authorized</span>
                       <span className="flex items-center gap-1.5 text-[#FFD700]"><Users size={14} /> Quota: {train.quota}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                       {train.classes.map((c:any, i:number) => (
                         <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                               <span className="font-black text-lg text-white">{c.travel_class}</span>
                               <span className="font-mono font-bold text-[#FF3B30]">{c.price ? formatPrice(c.price) : 'N/A'}</span>
                            </div>
                            
                            <div className="text-[10px] font-bold uppercase tracking-widest">
                               {c.availability !== "Fare unavailable for this class" ? (
                                 <span className={c.booking_status === 'AVAILABLE' ? 'text-[#34C759]' : (c.booking_status === 'RAC' ? 'text-[#FF9500]' : 'text-[#FFD700]')}>
                                    {c.availability}
                                 </span>
                               ) : (
                                 <span className="text-white/50">Fare unavailable for this class</span>
                               )}
                            </div>
                            
                            {c.price ? (
                              <button 
                                 onClick={() => handleBook(train.booking_link)}
                                 className="mt-2 w-full bg-[#FF3B30]/20 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-black py-2 rounded font-black uppercase tracking-widest text-[10px] transition-colors"
                              >
                                Book Now
                              </button>
                            ) : null}
                         </div>
                       ))}
                    </div>
                  </div>`;

code = code.replace(oldUIBlock, newUIBlock);

fs.writeFileSync('src/components/TravelSearch/TrainSearch.tsx', code);
