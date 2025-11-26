import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts, fetchNewArrivals, fetchTypes } from '../../store/slices/productSlice';
import HeroSlider from './components/HeroSlider';
import ActionBoxes from './components/ActionBoxes';
import StatsSection from './components/StatsSection';
import FeaturedProducts from './components/FeaturedProducts';
import PromotionalBanner from './components/PromotionalBanner';
import NewArrivals from './components/NewArrivals';
import BestSellers from './components/BestSellers';
import BenefitsSection from './components/BenefitsSection';
import Newsletter from './components/Newsletter';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CollectionCards from './components/CollectionCards';
import BrandsSection from './components/BrandsSection';

const HomePage = () => {
  const dispatch = useDispatch();
  const { featuredProducts, newArrivals, types, loading } = useSelector(state => state.products);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const loadHomepageData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([
          dispatch(fetchFeaturedProducts()).unwrap(),
          dispatch(fetchNewArrivals()).unwrap(),
          dispatch(fetchTypes()).unwrap()
        ]);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadHomepageData();
  }, [dispatch]);

  if (isInitialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <HeroSlider />
      <ActionBoxes />
      <StatsSection />
      <CollectionCards />
      <FeaturedProducts products={featuredProducts || []} />
      <PromotionalBanner />
      <NewArrivals products={newArrivals || []} />
      <BestSellers />
      {Array.isArray(types) && types.length > 0 && <BrandsSection types={types} />}
      <BenefitsSection />
      <Newsletter />
    </div>
  );
};

export default HomePage;