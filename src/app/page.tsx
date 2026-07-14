import Image from "next/image";
import OrderForm from "@/components/OrderForm";
import { paintings } from "@/lib/paintings";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">Psychedelic Art</span>
          <div className="flex gap-6 text-sm text-white/70">
            <a href="#catalog" className="transition-colors hover:text-white">
              Каталог
            </a>
            <a href="#order" className="transition-colors hover:text-white">
              Заказать
            </a>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <Image
          src="/images/stock/hero-1.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Психоделические картины, которые меняют пространство
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            Авторские работы ручной работы — яркие, живые, для тех, кто ищет не просто декор,
            а настроение в каждой детали интерьера.
          </p>
          <a
            href="#catalog"
            className="mt-10 inline-block rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-8 py-3.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            Смотреть картины
          </a>
        </div>
      </section>

      <section id="catalog" className="mx-auto w-full max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Каталог картин</h2>
        <p className="mt-3 text-white/60">Каждая картина — в единственном экземпляре.</p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {paintings.map((painting) => (
            <div
              key={painting.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={painting.image}
                  alt={painting.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-medium">{painting.title}</span>
                <span className="text-white/60">{painting.price.toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="order" className="mx-auto w-full max-w-2xl px-6 py-24">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Оформить заказ</h2>
        <p className="mt-3 text-white/60">
          Оставьте заявку — мы свяжемся с вами и поможем выбрать картину.
        </p>
        <div className="mt-10">
          <OrderForm />
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40">
        © {new Date().getFullYear()} Psychedelic Art
      </footer>
    </div>
  );
}
