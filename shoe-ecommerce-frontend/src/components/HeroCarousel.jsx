import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const photo = (id) => `/products/${id}.jpg`;

const SLIDES = [
  {
    eyebrow: 'New season',
    title: 'Run faster. Look sharper.',
    text: 'Lightweight performance trainers from the brands you trust.',
    cta: 'Shop sports shoes',
    to: '/products?category=sports',
    image: photo('1542291026-7eec264c27ff'),
    gradient: 'from-[#7f1d1d] via-[#b91c1c] to-[#dc2626]',
  },
  {
    eyebrow: "Today's deals",
    title: 'Up to 30% off top sneakers',
    text: 'Limited-time prices on casual favourites. Free delivery over $50.',
    cta: 'See all deals',
    to: '/products?deals=true',
    image: photo('1525966222134-fcfa99b8ae77'),
    gradient: 'from-[#92400e] via-[#d97706] to-[#f59e0b]',
  },
  {
    eyebrow: 'Back to school',
    title: 'Fresh kicks for little feet',
    text: 'Durable, comfortable and easy to lace, built for playground speed.',
    cta: 'Shop kids',
    to: '/products?category=kids',
    image: photo('1560769629-975ec94e6a86'),
    gradient: 'from-[#134e4a] via-[#0f766e] to-[#14b8a6]',
  },
  {
    eyebrow: 'Dressed to impress',
    title: 'Formal shoes, finished by hand',
    text: 'Leather oxfords and elegant heels for work, weddings and every occasion.',
    cta: 'Shop formal',
    to: '/products?category=formal',
    image: photo('1614252235316-8c857d38b5f4'),
    gradient: 'from-[#1e1b4b] via-[#3730a3] to-[#4f46e5]',
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const go = (direction) => setIndex((i) => (i + direction + SLIDES.length) % SLIDES.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {SLIDES.map((slide, i) => (
          <div
            key={slide.title}
            aria-hidden={i !== index}
            className={`relative flex min-h-[300px] w-full shrink-0 items-center bg-gradient-to-r ${slide.gradient} sm:min-h-[380px] lg:min-h-[420px]`}
          >
            <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-6 px-6 pb-24 pt-8 sm:px-12 lg:pb-32">
              <div className="max-w-xl text-white">
                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-white/80">{slide.eyebrow}</p>
                <h2 className="text-3xl font-bold leading-tight sm:text-5xl">{slide.title}</h2>
                <p className="mt-3 max-w-md text-sm text-white/90 sm:text-lg">{slide.text}</p>
                <Link
                  to={slide.to}
                  tabIndex={i === index ? 0 : -1}
                  className="btn-cta mt-6 px-6 py-2.5 text-base font-medium"
                >
                  {slide.cta}
                </Link>
              </div>
              <img
                src={slide.image}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                className="hidden h-64 w-64 rotate-3 rounded-3xl object-cover shadow-2xl ring-4 ring-white/20 md:block lg:h-80 lg:w-80"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#eaeded] to-transparent" />

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-0 top-[35%] hidden h-24 w-14 items-center justify-center text-white/90 hover:bg-black/20 hover:text-white md:flex"
      >
        <ChevronLeftIcon className="h-9 w-9" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-0 top-[35%] hidden h-24 w-14 items-center justify-center text-white/90 hover:bg-black/20 hover:text-white md:flex"
      >
        <ChevronRightIcon className="h-9 w-9" />
      </button>

      <div className="absolute inset-x-0 top-[78%] hidden justify-center gap-2 sm:flex lg:top-[74%]">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}
