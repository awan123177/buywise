const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

const newFounderTab = `
      {activeTab === 'founder' && (
        <div className="space-y-6 max-w-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Upload className="text-[#FF3B30]" /> OWNER PROFILE
            </h2>
            <p className="text-sm text-white/50">Manage the owner photo displayed across the app.</p>
          </div>
          
          <div className="bg-[#111111]/90 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
            <div className="space-y-6">
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Current Photo:</p>
                 <img src="/founder.jpg?v=admin" alt="Current Owner" className="w-32 h-32 object-cover object-top rounded-xl border border-white/10 shadow-lg" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
               </div>
               
               <button 
                 onClick={() => founderInputRef.current?.click()}
                 className="px-6 py-3 border border-white/10 hover:border-white/30 text-white font-black uppercase tracking-widest text-xs rounded transition-all flex items-center gap-2"
               >
                 <Camera size={16} /> CHANGE PHOTO
               </button>
               
               <input 
                 type="file" 
                 ref={founderInputRef} 
                 className="hidden" 
                 accept="image/png, image/jpeg, image/jpg, image/webp" 
                 onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     const reader = new FileReader();
                     reader.onload = (event) => setFounderImage(event.target?.result as string);
                     reader.readAsDataURL(file);
                   }
                 }} 
               />

               {founderImage && (
                 <div className="pt-6 border-t border-white/10 space-y-4">
                   <p className="text-xs font-bold uppercase tracking-widest text-white/50">New Photo:</p>
                   <img src={founderImage} alt="New Preview" className="w-32 h-32 object-cover object-top rounded-xl border border-[#FF3B30]/50 shadow-lg" />
                   
                   <div className="flex gap-3">
                     <button 
                       onClick={async () => {
                          setIsUploadingFounder(true);
                          try {
                            const res = await api.post("/admin/upload-founder", { imageBase64: founderImage }, {
                              headers: { "X-Admin-Passcode": passcode, "X-User-Email": email }
                            });
                            if (res.data && res.data.success) {
                              toast.success("Owner photo updated successfully.");
                              setFounderImage(null);
                              // Force reload the current image
                              const img = document.querySelector('img[alt="Current Owner"]') as HTMLImageElement;
                              if (img) img.src = "/founder.jpg?v=" + Date.now();
                            } else {
                              toast.error(res.data?.error || "Failed to upload.");
                            }
                          } catch (err: any) {
                            toast.error("Upload error: " + (err.response?.data?.error || err.message));
                          } finally {
                            setIsUploadingFounder(false);
                          }
                       }}
                       disabled={isUploadingFounder}
                       className="px-6 py-3 bg-[#FF3B30] hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded transition-all disabled:opacity-50"
                     >
                       {isUploadingFounder ? 'SAVING...' : 'SAVE CHANGES'}
                     </button>
                     <button 
                       onClick={() => setFounderImage(null)}
                       className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-xs rounded transition-all"
                     >
                       REMOVE PHOTO
                     </button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  /\{activeTab === 'founder' && \([\s\S]*?className="text-xs font-bold uppercase tracking-widest text-white\/50"\s*>\s*Database Snapshot\s*<\/p>/,
  `${newFounderTab}\n      {activeTab === 'debug' && (\n        <div className="space-y-6">\n          <h2 className="text-2xl font-black uppercase tracking-widest text-[#FF3B30]">Debug Console</h2>\n          <div className="bg-[#111111]/90 border border-[#FF3B30]/20 p-6 rounded-2xl">\n            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Database Snapshot</p>`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
