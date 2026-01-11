import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const HeroSlider = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      mobileImage: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800",
      desktopImage: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "EcoTrade - Real-Time Auction Platform",
      subtitle: "Participate in live auctions for e-waste, metals, plastics, paper, and FMGC materials. Bid in real-time and get the best deals.",
      cta: "Browse Auctions"
    },
    {
      mobileImage: "https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=800",
      desktopImage: "https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "Live Bidding & Real-Time Updates",
      subtitle: "Experience real-time auction bidding with instant updates. Track your bids, see rankings, and win the best materials.",
      cta: "Browse Auctions"
    },
    {
      mobileImage: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800",
      desktopImage: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "Sustainable Circular Economy",
      subtitle: "Connect buyers and sellers through transparent auctions. Transform waste into value. Build a greener future together.",
      cta: "Get Started"
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <>
      <section className="relative grid overflow-hidden h-[50vh] md:h-[60vh]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`col-start-1 row-start-1 transition-opacity duration-1000 ${
              activeSlide === index ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10"></div>

            <picture>
              <source media="(min-width: 1024px)" srcSet={slide.desktopImage} />

              <img
                src={slide.mobileImage}
                alt={`Hero slide ${index + 1}`}
                className="w-full h-full object-cover"
                style={{
                  transition: "transform 10s ease-out",
                  transform: activeSlide === index ? "scale(1)" : "scale(1.05)",
                }}
              />
            </picture>

            {/* Text Overlay */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-4 md:px-8 lg:px-12">
                <div className="max-w-2xl">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-xl lg:text-2xl text-gray-100 mb-6 md:mb-8 animate-fade-in">
                    {slide.subtitle}
                  </p>
                  <Link
                    to={slide.cta === "Browse Auctions" ? "/auctions" : slide.cta === "Get Started" ? "/register" : "/auctions"}
                    className="inline-block px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>

          </div>
        ))}

        {/* Slider Controls */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-8 rounded-full transition-all ${
                activeSlide === index ? "bg-emerald-500 w-12" : "bg-white/50"
              }`}
              onClick={() => setActiveSlide(index)}
            ></button>
          ))}
        </div>

        {/* Navigation Arrows */}
        {/* <button
          onClick={() =>
            setActiveSlide((prev) =>
              prev === 0 ? slides.length - 1 : prev - 1
            )
          }
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all"
        >
          <ChevronRight className="h-6 w-6 rotate-180" />
        </button>
        <button
          onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button> */}
      </section>
    </>
  );
};

export default HeroSlider;