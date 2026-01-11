import { useState, useEffect } from 'react';
import { mockProducts, mockCategories, mocktypes } from '../data/mockdata';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const refetch = () => {
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 300);
  };

  return { products, loading, error, refetch };
};

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 300);
  }, []);

  return { categories, loading };
};

export const usetypes = () => {
  const [types, settypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      settypes(mocktypes);
      setLoading(false);
    }, 300);
  }, []);

  return { types, loading };
};