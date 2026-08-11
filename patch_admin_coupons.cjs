const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

// Add coupons to activeTab type
code = code.replace(
  /'debug'\>\('overview'\);/,
  `'debug' | 'coupons'>('overview');
  
  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponSearch, setCouponSearch] = useState('');
  const [newCouponUser, setNewCouponUser] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [fetchingCoupons, setFetchingCoupons] = useState(false);

  const fetchAdminCoupons = async () => {
    setFetchingCoupons(true);
    try {
      const res = await api.get('/gamification/admin/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (e) {
      console.error(e);
    }
    setFetchingCoupons(false);
  };

  useEffect(() => {
    if (activeTab === 'coupons') {
      fetchAdminCoupons();
    }
  }, [activeTab]);

  const handleGenerateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/gamification/admin/coupons/generate', { userId: newCouponUser, discountPercent: newCouponDiscount });
      if (res.data.success) {
        toast.success('Coupon generated!');
        setNewCouponUser('');
        fetchAdminCoupons();
      }
    } catch (e) {
      toast.error('Failed to generate coupon');
    }
  };

  const handleUpdateCoupon = async (couponId: string, updates: any) => {
    try {
      const res = await api.post('/gamification/admin/coupons/update', { couponId, updates });
      if (res.data.success) {
        toast.success('Coupon updated');
        fetchAdminCoupons();
      }
    } catch (e) {
      toast.error('Update failed');
    }
  };
`
);

// Add Tab to sidebar
code = code.replace(
  /\{ id: 'premium', label: 'Premium', icon: ShieldCheck \},/,
  `{ id: 'premium', label: 'Premium', icon: ShieldCheck },
        { id: 'coupons', label: 'Coupons', icon: Gift },`
);

const renderCouponsJSX = `
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
             <h2 className="text-2xl font-black uppercase tracking-widest text-yellow-500 flex items-center gap-2">
               <Gift className="text-yellow-500" /> Coupon Management
             </h2>
             
             {/* Stats */}
             <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">Total Generated</p>
                  <p className="text-xl font-black text-white">{coupons.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">Redeemed</p>
                  <p className="text-xl font-black text-green-400">{coupons.filter((c: any) => c.status === 'redeemed').length}</p>
                </div>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Generate Coupon */}
            <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl space-y-4 h-fit">
              <h3 className="font-bold text-white uppercase tracking-widest text-xs border-b border-white/10 pb-2">Manual Generate</h3>
              <form onSubmit={handleGenerateCoupon} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-1">User ID</label>
                  <input type="text" required value={newCouponUser} onChange={e => setNewCouponUser(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-sm rounded outline-none focus:border-[#FF3B30] transition-colors text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-1">Discount %</label>
                  <select value={newCouponDiscount} onChange={e => setNewCouponDiscount(Number(e.target.value))} className="w-full bg-black border border-white/10 p-2 text-sm rounded outline-none focus:border-[#FF3B30] transition-colors text-white">
                    <option value={10}>10% OFF</option>
                    <option value={20}>20% OFF</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-bold uppercase tracking-widest text-[10px] py-3 rounded transition-colors">
                  Generate Coupon
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="font-bold text-white uppercase tracking-widest text-xs">Generated Coupons</h3>
                <input 
                  type="text" 
                  placeholder="Search User ID or Code..."
                  value={couponSearch}
                  onChange={e => setCouponSearch(e.target.value)}
                  className="bg-black border border-white/10 p-2 text-xs rounded outline-none focus:border-[#FF3B30] text-white w-64"
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40">
                      <th className="p-3 font-medium">Code</th>
                      <th className="p-3 font-medium">User ID</th>
                      <th className="p-3 font-medium">Discount</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {coupons.filter((c: any) => c.userId.includes(couponSearch) || c.code.includes(couponSearch.toUpperCase())).map((c: any) => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 font-mono font-bold">{c.code}</td>
                        <td className="p-3 text-white/60 truncate max-w-[100px]" title={c.userId}>{c.userId}</td>
                        <td className="p-3 font-bold text-yellow-500">{c.discountPercent}%</td>
                        <td className="p-3">
                          <span className={\`px-2 py-1 rounded text-[9px] font-black uppercase \${c.status === 'active' ? 'bg-green-500/20 text-green-400' : c.status === 'redeemed' ? 'bg-white/10 text-white/50' : c.status === 'disabled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}\`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2">
                          {c.status === 'active' && (
                            <button onClick={() => handleUpdateCoupon(c.id, { status: 'disabled' })} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider">
                              Disable
                            </button>
                          )}
                          {c.status === 'disabled' && (
                            <button onClick={() => handleUpdateCoupon(c.id, { status: 'active' })} className="text-[10px] text-green-400 hover:text-green-300 font-bold uppercase tracking-wider">
                              Enable
                            </button>
                          )}
                          <button onClick={() => {
                            const newExp = prompt("Enter new expiry (YYYY-MM-DD)", c.expiresAt.split('T')[0]);
                            if (newExp) handleUpdateCoupon(c.id, { expiresAt: new Date(newExp).toISOString() });
                          }} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider">
                            Extend
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && !fetchingCoupons && (
                      <tr><td colSpan={5} className="p-4 text-center text-white/50">No coupons found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  /\{activeTab === 'premium' && \(/,
  `${renderCouponsJSX}\n      {activeTab === 'premium' && (`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
