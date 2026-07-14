export type Painting = {
  id: string;
  title: string;
  price: number;
  image: string;
};

export const paintings: Painting[] = [
  { id: "catalog-1", title: "Расцвет", price: 18000, image: "/images/stock/catalog-1.jpg" },
  { id: "catalog-2", title: "Фиолетовый сон", price: 22000, image: "/images/stock/catalog-2.jpg" },
  { id: "catalog-3", title: "Изумрудный портал", price: 25000, image: "/images/stock/catalog-3.jpg" },
  { id: "catalog-4", title: "Спираль сознания", price: 27000, image: "/images/stock/catalog-4.jpg" },
  { id: "catalog-5", title: "Земля и цвет", price: 19500, image: "/images/stock/catalog-5.jpg" },
  { id: "catalog-6", title: "Внутренний свет", price: 21000, image: "/images/stock/catalog-6.jpg" },
];
