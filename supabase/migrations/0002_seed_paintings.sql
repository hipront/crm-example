-- Сид: заполняем каталог теми же 6 картинами, что были в моках

insert into public.paintings (title, description, price, image_url, is_available)
values
  ('Расцвет', null, 18000, '/images/stock/catalog-1.jpg', true),
  ('Фиолетовый сон', null, 22000, '/images/stock/catalog-2.jpg', true),
  ('Изумрудный портал', null, 25000, '/images/stock/catalog-3.jpg', true),
  ('Спираль сознания', null, 27000, '/images/stock/catalog-4.jpg', true),
  ('Земля и цвет', null, 19500, '/images/stock/catalog-5.jpg', true),
  ('Внутренний свет', null, 21000, '/images/stock/catalog-6.jpg', true);
