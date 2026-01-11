import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../../../components/ui/ProductCard';
import Button from '../../../components/ui/Button';

const NewArrivals = ({ products }) => {

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2">New Arrivals</h2>
            <p className="text-gray-600 text-lg">The latest certified refurbished additions to our collection</p>
          </div>
          <Link to="/products?filter=new" className="hidden md:flex items-center text-green-700 hover:text-emerald-600 font-medium">
            View All <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {products.map((product, index) => (
            <div key={product._id} className={index === 3 ? 'lg:hidden xl:block' : ''}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link to="/products?filter=new">
            <Button variant="outline">View All New Arrivals</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;