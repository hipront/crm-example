"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  function goBack() {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.back();
  }

  return (
    <div
      className="min-h-screen bg-ink px-7 py-20 text-ink-foreground"
      onClick={goBack}
    >
      <div className="mx-auto max-w-[720px]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={goBack}
          className="text-sm text-ink-foreground/50 no-underline hover:text-ink-foreground"
        >
          ← Назад
        </button>

        <h1 className="mt-6 font-heading text-[clamp(26px,4vw,34px)] font-bold tracking-[-0.015em]">
          Политика конфиденциальности
        </h1>

        <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13.5px] leading-[1.6] text-ink-foreground/60">
          Это учебный/портфолио-проект: реальная продажа картин и оплата на сайте не осуществляются.
          Но форма заказа отправляет данные в настоящую базу данных, поэтому ниже — честное описание того,
          что происходит с этими данными.
        </p>

        <div className="mt-8 space-y-6 text-[15px] leading-[1.7] text-ink-foreground/75">
          <section>
            <h2 className="font-heading text-lg font-semibold text-ink-foreground">Какие данные собираются</h2>
            <p className="mt-2">
              При заполнении формы заказа на главной странице сохраняются: имя, указанный контакт (телефон
              или email), выбранная картина (если выбрана) и комментарий (если он оставлен).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-ink-foreground">Зачем</h2>
            <p className="mt-2">
              Эти данные используются только для демонстрации работы CRM — заявка попадает в панель
              администратора (`/admin`), где показывается, как выглядела бы обработка реального заказа.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-ink-foreground">Где хранится</h2>
            <p className="mt-2">
              Данные хранятся в базе данных Supabase, доступ к панели администратора защищён авторизацией
              и разграничением ролей.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-ink-foreground">Передача третьим лицам</h2>
            <p className="mt-2">Данные никому не передаются и не используются в маркетинговых целях.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
