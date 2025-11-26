import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader as Loader2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { fetchAllOrders } from '../../../store/slices/orderSlice';
import OrdersStatistics from './components/OrdersStatistics';
import OrdersFilters from './components/OrdersFilters';
import OrdersTable from './components/OrdersTable';
import OrdersPagination from './components/OrdersPagination';
import OrderDetails from './components/OrderDetails';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const AdminOrders = ({ initialOrderId }) => {
  const dispatch = useDispatch();
  const { orders, loading, currentPage, totalPages, totalOrders } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);
  const { stats } = useSelector((state) => state.admin);
  
  // State for the live value in the search input
  const [searchTerm, setSearchTerm] = useState('');
  // State for the value that is sent to the API after a delay
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [orderDetailsId, setOrderDetailsId] = useState(initialOrderId);
  
  const ordersPerPage = 5;

  // This useEffect implements the debounce logic for the search input.
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchTerm);
      setPage(1); // Reset to page 1 when a new search is made
    }, 1000); // 1-second delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // This single useEffect handles ALL data fetching.
  // It re-runs whenever the page, debounced search term, or status filter changes.
  useEffect(() => {
    if (user?.token) {
      dispatch(fetchAllOrders({
        page,
        limit: ordersPerPage,
        search: debouncedSearchQuery, // Use the debounced value for the API call
        status: statusFilter,
      }));
    }
  }, [dispatch, user, page, debouncedSearchQuery, statusFilter]);
  
  const handlePageChange = (newPage) => setPage(newPage);

  // This now only updates the LIVE search term.
  const handleSearch = (query) => {
    setSearchTerm(query);
  };
  
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPage(1); // Reset to the first page when filter changes
  };

  const handleViewOrder = (id) => setOrderDetailsId(id);
  const handleCloseOrderDetails = () => setOrderDetailsId(null);

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }
  
  const orderDetails = orderDetailsId ? orders.find(order => order._id === orderDetailsId) : null;

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {!orderDetails ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-green-700">Orders Management</h1>
            <Button onClick={() => dispatch(fetchAllOrders({ page, limit: ordersPerPage, search: debouncedSearchQuery, status: statusFilter }))} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <OrdersStatistics stats={stats} />
          
          {/* These components now correctly trigger the state changes that the useEffect hook listens for */}
          <OrdersFilters onSearch={handleSearch} onStatusFilter={handleStatusFilter} />

          <OrdersTable orders={orders} onViewOrder={handleViewOrder} />
          
          {totalPages > 1 && (
            <OrdersPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalOrders}
              itemsPerPage={ordersPerPage}
            />
          )}
        </>
      ) : (
        <OrderDetails
          order={orderDetails}
          onClose={handleCloseOrderDetails}
        />
      )}
    </div>
  );
};

export default AdminOrders;