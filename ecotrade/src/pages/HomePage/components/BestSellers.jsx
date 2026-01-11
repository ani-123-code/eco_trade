import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { fetchBestSellers } from '../../../store/slices/productSlice';
import ProductCard from '../../../components/ui/ProductCard';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom Mobile Slider Component
const MobileSlider = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  // Handle touch events for swipe functionality
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  // Auto-play functionality
  useEffect(() => {
    if (products.length <= 1) return;
    
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [products.length]);

  return (
    <div className="relative">
      {/* Slider Container */}
      <div 
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {products.map((product) => (
            <div key={product._id} className="w-full flex-shrink-0 px-4">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {products.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200"
          >
            <FaChevronLeft className="text-gray-700 text-sm" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200"
          >
            <FaChevronRight className="text-gray-700 text-sm" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {/* {products.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )} */}
    </div>
  );
};

// React Slick Arrows for Desktop
const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200"
    style={{ left: '-15px' }}
  >
    <FaChevronLeft className="text-gray-700 text-lg" />
  </button>
);

const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200"
    style={{ right: '-15px' }}
  >
    <FaChevronRight className="text-gray-700 text-lg" />
  </button>
);

const BestSellers = () => {
  const dispatch = useDispatch();
  const { bestSellers, bestSellersLoading } = useSelector(state => state.products);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    dispatch(fetchBestSellers());
  }, [dispatch]);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Use mobile slider for screens < 768px
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // React Slick settings for desktop/tablet
  const settings = {
    dots: false,
    arrows: true,
    infinite: bestSellers.length > 1,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: bestSellers.length > 1,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280, // xl
        settings: {
          slidesToShow: 3,
          infinite: bestSellers.length > 3,
        }
      },
      {
        breakpoint: 1024, // lg  
        settings: {
          slidesToShow: 2,
          infinite: bestSellers.length > 2,
        }
      }
    ]
  };

  if (bestSellersLoading) {
    return (
      <section className="py-16 bg-[#01364a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-2">Best Sellers</h2>
          </div>
          <div className="text-center py-16 text-white">Loading Best Sellers...</div>
        </div>
      </section>
    );
  }

  if (!bestSellers || bestSellers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[#00425A]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Best Sellers</h2>
        </div>
       
        <div className="relative">
          {isMobile ? (
            // Use custom mobile slider for small screens
            <MobileSlider products={bestSellers} />
          ) : (
            // Use React Slick for desktop/tablet
            <div className="mx-8">
              <Slider {...settings}>
                {bestSellers.map(product => (
                  <div key={product._id} className="px-3">
                    <ProductCard product={product} />
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;