// Denah Gedung Halimun, digambar ulang dari denah evakuasi sebagai SVG (bukan gambar).
export type Room = { floor: number; id: string; name: string; x: number; y: number; w: number; h: number; c: string; stairs?: boolean }
export const FLOORS: Record<number, { label: string; vb: string }> = {
  1: { label: 'Lantai 1', vb: '100 60 720 300' },
  2: { label: 'Lantai 2', vb: '950 60 760 280' },
  3: { label: 'Lantai 3', vb: '100 570 700 200' },
  4: { label: 'Lantai 4', vb: '980 570 720 190' },
}
const G = '#C9CCD6', R = '#E0463F', CR = '#F5E6B8', Y = '#F7E23B', T = '#34C4C4', P = '#7A5CC0', LB = '#7CC6F0', B = '#2F8FE0', GR = '#7CC242', PK = '#F29AB5', O = '#F7C531', LM = '#C5E86A', S = '#3DAA4A'
// [lantai, id, nama, x, y, w, h, warna]
const raw: [number, string, string, number, number, number, number, string][] = [
  [1,'1','R. Tamu Admisi',128,163,56,40,G],[1,'2','R. Admisi',128,203,56,48,T],[1,'3','R. Rapat',186,187,54,64,R],[1,'4','R. LAAK',240,187,52,64,CR],[1,'5','R. Klinik',292,187,52,64,Y],
  [1,'6','R. Sekpim, Purel & Legal',345,187,56,36,T],[1,'7','R. Koord. Kesekretariatan & Penjaminan Mutu',345,223,56,28,P],[1,'8','R. Direktur',400,211,52,52,LB],
  [1,'9','Toilet Wanita',502,211,36,52,B],[1,'10','Toilet Laki-Laki',538,211,40,52,B],[1,'11','R. Rapat',610,165,104,90,GR],[1,'12','Provider XL',610,82,100,82,PK],
  [1,'13','Kantin',712,82,82,82,O],[1,'14','Rumah Security',720,288,78,56,LM],[1,'15','Trafo PLN',627,288,92,56,'#BDEBF0'],[1,'16','Mushola',503,308,88,34,G],
  [1,'17','Gudang',437,310,48,36,P],[1,'18','Gudang',385,310,50,36,P],[1,'19','Pantry',333,310,50,36,PK],[1,'20','HIMA',575,82,34,40,S],
  [2,'1','R. Dosen Sistem Informasi',967,217,136,52,G],[2,'2','R. Kaprodi',967,269,136,51,G],[2,'3','R. Kuliah 201',1103,217,125,103,R],[2,'4','R. Lab Komputer 01',1228,217,125,103,B],
  [2,'5','Toilet Wanita',1420,243,50,77,T],[2,'6','Toilet Laki-Laki',1470,243,52,77,Y],[2,'7','Perpustakaan',1520,75,168,205,'#2BA6A6'],
  [3,'1','R. Dosen Teknologi Informasi',120,673,115,39,G],[3,'2','R. Kaprodi',120,712,115,39,G],[3,'3','R. Kuliah 304',235,673,112,78,R],[3,'4','R. Kuliah 303',347,673,112,78,CR],
  [3,'5','Toilet Wanita',520,693,50,58,B],[3,'6','Toilet Laki-Laki',570,693,52,58,Y],[3,'7','Gudang',620,680,28,40,PK],[3,'8','R. Kuliah 302',650,649,122,66,T],[3,'9','R. Kuliah 301',650,588,122,60,B],
  [4,'1','Lab DKV 01',995,665,57,80,G],[4,'2','R. Dosen DKV',1053,665,110,40,T],[4,'3','R. Kaprodi',1053,705,110,40,T],[4,'4','R. Kuliah 401',1165,665,107,80,R],[4,'5','Lab DKV 02',1272,665,78,80,CR],
  [4,'6','Toilet Wanita',1410,685,50,60,B],[4,'7','Toilet Laki-Laki',1460,685,52,60,LB],[4,'8','R. Server',1512,685,28,40,PK],[4,'9','Lab Komputer 02',1550,642,130,75,Y],[4,'10','R. Kuliah 402',1550,583,130,58,B],
]
export const ROOMS: Room[] = [
  ...raw.map(([floor, id, name, x, y, w, h, c]) => ({ floor, id, name, x, y, w, h, c })),
  { floor: 1, id: 'T', name: 'Tangga Darurat', x: 455, y: 211, w: 46, h: 52, c: S, stairs: true },
  { floor: 2, id: 'T', name: 'Tangga Darurat', x: 1353, y: 217, w: 66, h: 103, c: S, stairs: true },
  { floor: 3, id: 'T', name: 'Tangga Darurat', x: 460, y: 693, w: 58, h: 58, c: S, stairs: true },
  { floor: 4, id: 'T', name: 'Tangga Darurat', x: 1352, y: 685, w: 58, h: 60, c: S, stairs: true },
]
export const getRoom = (floor: number, id: string) => ROOMS.find(r => r.floor === floor && r.id === id)
export const roomLabel = (floor: number, id: string) => { const r = getRoom(floor, id); return r ? `Gedung Halimun, Lantai ${floor}, ${r.name}` : `Lantai ${floor}` }
