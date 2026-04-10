export type CategorySeed = {
  name: string;
  icon: string;
  color: string;
  kind: "expense" | "income" | "saving";
  groupName: string;
  sortOrder: number;
};

export const categoryCatalog: CategorySeed[] = [
  { name: "Makan & Minum", icon: "coffee", color: "#c2ebe3", kind: "expense", groupName: "Kebutuhan Pokok", sortOrder: 1 },
  { name: "Tagihan Rutin", icon: "receipt", color: "#dce9ff", kind: "expense", groupName: "Kebutuhan Pokok", sortOrder: 2 },
  { name: "Transportasi", icon: "car", color: "#c2ebe3", kind: "expense", groupName: "Kebutuhan Pokok", sortOrder: 3 },
  { name: "Tempat Tinggal", icon: "house", color: "#ffdbce", kind: "expense", groupName: "Kebutuhan Pokok", sortOrder: 4 },
  { name: "Komunikasi", icon: "smartphone", color: "#dce9ff", kind: "expense", groupName: "Kebutuhan Pokok", sortOrder: 5 },
  { name: "Hutang/Cicilan", icon: "credit-card", color: "#ffdbce", kind: "expense", groupName: "Kewajiban & Cicilan", sortOrder: 6 },
  { name: "Pajak", icon: "badge-dollar", color: "#dce9ff", kind: "expense", groupName: "Kewajiban & Cicilan", sortOrder: 7 },
  { name: "Asuransi", icon: "shield", color: "#c2ebe3", kind: "expense", groupName: "Kewajiban & Cicilan", sortOrder: 8 },
  { name: "Hiburan", icon: "tv", color: "#ffdbce", kind: "expense", groupName: "Gaya Hidup & Hiburan", sortOrder: 9 },
  { name: "Belanja", icon: "shopping-bag", color: "#dce9ff", kind: "expense", groupName: "Gaya Hidup & Hiburan", sortOrder: 10 },
  { name: "Self-care", icon: "heart", color: "#ffdfe6", kind: "expense", groupName: "Gaya Hidup & Hiburan", sortOrder: 11 },
  { name: "Sedekah/Zakat", icon: "hand-coins", color: "#fff1d6", kind: "expense", groupName: "Sosial & Keluarga", sortOrder: 12 },
  { name: "Hadiah", icon: "gift", color: "#ffdbce", kind: "expense", groupName: "Sosial & Keluarga", sortOrder: 13 },
  { name: "Keluarga", icon: "users", color: "#dce9ff", kind: "expense", groupName: "Sosial & Keluarga", sortOrder: 14 },
  { name: "Gaji Utama", icon: "briefcase", color: "#89f5e7", kind: "income", groupName: "Pemasukan", sortOrder: 15 },
  { name: "Bonus/Insentif", icon: "trend", color: "#c2ebe3", kind: "income", groupName: "Pemasukan", sortOrder: 16 },
  { name: "Sampingan", icon: "sparkles", color: "#dce9ff", kind: "income", groupName: "Pemasukan", sortOrder: 17 },
  { name: "Investasi", icon: "chart", color: "#fff1d6", kind: "income", groupName: "Pemasukan", sortOrder: 18 },
  { name: "Dana Darurat", icon: "piggy", color: "#c2ebe3", kind: "saving", groupName: "Masa Depan", sortOrder: 19 },
  { name: "Investasi Jangka Panjang", icon: "chart", color: "#ffdbce", kind: "saving", groupName: "Masa Depan", sortOrder: 20 },
  { name: "Tabungan Khusus", icon: "wallet", color: "#dce9ff", kind: "saving", groupName: "Masa Depan", sortOrder: 21 }
];
