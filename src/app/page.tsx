import OrderForm, { OrderTrustBadges } from "@/components/OrderForm";
import { getPaintings } from "@/lib/paintings";
import { OrderProvider } from "@/components/landing/OrderContext";
import { PrivacyModalProvider } from "@/components/landing/PrivacyModalContext";
import PrivacyModal from "@/components/landing/PrivacyModal";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import AboutArtist from "@/components/landing/AboutArtist";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import MaterialsDelivery from "@/components/landing/MaterialsDelivery";
import Catalog from "@/components/landing/Catalog";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import ScrollToTopButton from "@/components/landing/ScrollToTopButton";
import Reveal from "@/components/landing/Reveal";

export const revalidate = 60;

export default async function Home() {
  const paintings = await getPaintings();

  return (
    <div id="top" className="relative flex flex-1 flex-col bg-ink font-sans text-ink-foreground">
      <OrderProvider>
        <PrivacyModalProvider>
          <Header />
          <Hero />
          <Catalog paintings={paintings} />
          <AboutArtist />
          <HowItWorks />
          <MaterialsDelivery />
          <Testimonials />
          <Faq />

          <Reveal id="order" className="mx-auto w-full max-w-[640px] px-7 pt-24">
            <h2 className="text-center font-heading text-[clamp(26px,3.4vw,36px)] font-semibold tracking-[-0.015em] text-ink-foreground">
              Оформить заказ
            </h2>
            <p className="mt-3 text-center text-[14.5px] text-ink-foreground/50">
              Оставьте заявку — мы свяжемся с вами и поможем выбрать картину
            </p>
            <OrderTrustBadges />
            <OrderForm paintings={paintings} />
          </Reveal>

          <Footer />
          <ScrollToTopButton />
          <PrivacyModal />
        </PrivacyModalProvider>
      </OrderProvider>
    </div>
  );
}
