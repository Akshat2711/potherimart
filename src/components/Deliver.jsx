import { useState, useEffect } from 'react';
import './Deliver.css';
import { Navbar } from './Navbar';
import { db } from '../firebase/firebase'; 
import { ref as dbRef, onValue } from "firebase/database";

export const Deliver = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableItems, setAvailableItems] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch orders for all users under the `potherimart` node
    const potherimartRef = dbRef(db, 'potherimart');
    const unsubscribe = onValue(potherimartRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allOrders = [];
        // Iterate through each user
        Object.keys(data).forEach(userKey => {
          const user = data[userKey];
          if (user.orders) {
            // Iterate through each order for the user
            Object.keys(user.orders).forEach(orderKey => {
              allOrders.push({
                id: orderKey,
                ...user.orders[orderKey],
                listedBy: userKey // Add the user who listed the order
              });
            });
          }
        });
        setOrders(allOrders);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAcceptOrder = (order) => {
    setSelectedOrder(order);
    const initialAvailability = {};
    order.products.forEach(product => {
      initialAvailability[product.id] = false;
    });
    setAvailableItems(initialAvailability);
    setShowModal(true);
  };

  const handleItemToggle = (itemId) => {
    setAvailableItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSubmitOrder = () => {
    console.log("Available items:", availableItems);
    alert(`Order confirmation request sent for order ${selectedOrder.id}`);
    setShowModal(false);
  };

  return (
    <>
      <Navbar color_nav_deliver="#ff69b4"/>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem', marginTop: '5rem' }}>
          🛍️ Nearby Pickup Orders
        </h1>

        <div className="order-grid">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Order ID: {order.id}</h3>
                <p style={{ color: '#ff69b4', fontWeight: 500 }}>Listed by: {order.listedBy}</p>
                <p style={{ color: '#ff69b4', fontWeight: 500 }}>Status: {order.status}</p>
              </div>
              <button 
                className="accept-button"
                onClick={() => handleAcceptOrder(order)}
              >
                Accept Order ✨
              </button>
            </div>
          ))}
        </div>

        {showModal && selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
                🛒 Items for Order {selectedOrder.id}
              </h2>
              <ul className="items-list">
                {selectedOrder.products.map(product => (
                  <li key={product.id} className="item">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={availableItems[product.id]}
                      onChange={() => handleItemToggle(product.id)}
                    />
                    <span>{product.name} (Qty: {product.quantity})</span>
                  </li>
                ))}
              </ul>
              <div className="modal-actions">
                <button 
                  className="secondary-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  onClick={handleSubmitOrder}
                >
                  Confirm 🧏‍♂️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};