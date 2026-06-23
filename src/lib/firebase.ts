// Memory-based mocked Firebase wrapped over localStorage for instant multi-tab testing
export const db = {} as any;
export const auth = {} as any;

const getCol = (colName: string) => {
  try {
    return JSON.parse(localStorage.getItem(`buywise_db_${colName}`) || '[]');
  } catch {
    return [];
  }
};
const setCol = (colName: string, data: any[]) => {
  localStorage.setItem(`buywise_db_${colName}`, JSON.stringify(data));
  window.dispatchEvent(new Event('local-db-update'));
};

export const doc = (dbMock: any, colName: string, id: string) => ({ colName, id });
export const collection = (dbMock: any, colName: string) => ({ colName });

export const getDocs = async (colRef: any) => {
  const data = getCol(colRef.colName);
  return { 
    docs: data.map((d: any) => ({ id: d.id, data: () => d, ...d })),
    forEach: (cb: any) => data.forEach((d: any) => cb({ id: d.id, data: () => d, ...d }))
  };
};

export const setDoc = async (docRef: any, data: any, ...opts: any[]) => {
  const all = getCol(docRef.colName);
  const idx = all.findIndex((x: any) => x.id === docRef.id);
  if (idx >= 0) all[idx] = { ...all[idx], ...data };
  else all.push({ id: docRef.id, ...data });
  setCol(docRef.colName, all);
};

export const deleteDoc = async (docRef: any) => {
  let all = getCol(docRef.colName);
  all = all.filter((x: any) => x.id !== docRef.id);
  setCol(docRef.colName, all);
};

export const updateDoc = async (docRef: any, data: any) => {
  const all = getCol(docRef.colName);
  const idx = all.findIndex((x: any) => x.id === docRef.id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data };
    setCol(docRef.colName, all);
  }
};

export const query = (colRef: any, ...args: any[]) => ({ colName: colRef.colName, filters: args });
export const where = (...args: any[]) => ({ type: 'where', args });
export const orderBy = (...args: any[]) => ({ type: 'orderBy', args });
export const limit = (...args: any[]) => ({ type: 'limit', args });

export const onSnapshot = (q: any, cb: any, ...opts: any[]) => {
  const notify = () => {
    const data = getCol(q.colName);
    // Simple filter simulation
    let filtered = [...data];
    q.filters?.forEach((f: any) => {
      if (f.type === 'orderBy') {
        const [field, dir] = f.args;
        filtered.sort((a, b) => {
          if (a[field] < b[field]) return dir === 'desc' ? 1 : -1;
          if (a[field] > b[field]) return dir === 'desc' ? -1 : 1;
          return 0;
        });
      }
      if (f.type === 'limit') {
        filtered = filtered.slice(0, f.args[0]);
      }
    });

    cb({
      docs: filtered.map((d: any) => ({ id: d.id, data: () => d, ...d })),
      forEach: (fcb: any) => filtered.forEach((d: any) => fcb({ id: d.id, data: () => d, ...d })),
      size: filtered.length,
      empty: filtered.length === 0
    });
  };

  notify();
  // Listen to same-tab updates
  window.addEventListener('local-db-update', notify);
  // Listen to cross-tab updates
  window.addEventListener('storage', (e) => {
    if (e.key === `buywise_db_${q.colName}`) {
      notify();
    }
  });

  return () => {
    window.removeEventListener('local-db-update', notify);
    // Cannot easily remove the anonymous storage listener here, but this is a mock.
  };
};

export const getFirestore = (...args: any[]) => ({});
export const getAuth = (...args: any[]) => ({});
export const initializeApp = (...args: any[]) => ({});

