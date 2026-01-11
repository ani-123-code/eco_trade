 const formatProductNames = (order) => {
    const products = order.items || order.products || [];
    if (!products.length) return 'No products';
    
    if (products.length === 1) {
      const productName = products[0].product?.name || products[0].name || 'Unknown Product';
      return productName.length > 25 ? `${productName.slice(0, 25)}...` : productName;
    }
    
    const firstName = products[0].product?.name || products[0].name || 'Product';
    const shortName = firstName.length > 20 ? `${firstName.slice(0, 20)}...` : firstName;
    return `${shortName} +${products.length - 1}`;
  };

  export default formatProductNames;