import { useState } from 'react';
import './Deliver.css';
import { Navbar } from './Navbar';

export const  Deliver = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableItems, setAvailableItems] = useState({});
  const [showModal, setShowModal] = useState(false);

  const initialOrders = [
    {
      id: 1,
      userName: "John Doe",
      distance: "1.2 km",
      items: [
        { id: 1, name: "Milk 1L" },
        { id: 2, name: "Bread Whole Wheat" },
        { id: 3, name: "Eggs (12)" },
      ]
    },
    {
      id: 2,
      userName: "Jane Smith",
      distance: "0.8 km",
      items: [
        { id: 4, name: "Apples 1kg" },
        { id: 5, name: "Bananas 6pcs" },
        { id: 6, name: "Orange Juice 1L" },
      ]
    }
  ];

  const handleAcceptOrder = (order) => {
    setSelectedOrder(order);
    const initialAvailability = {};
    order.items.forEach(item => {
      initialAvailability[item.id] = false;
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
    alert(`Order confirmation request sent to ${selectedOrder.userName}`);
    setShowModal(false);
  };

  return (
    <>
    <Navbar color_nav_deliver="pink"/>
    <div className="container">
      <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem',marginTop: '5rem' }}>
        🛍️ Nearby Pickup Orders
      </h1>

      <div className="order-grid">
        {initialOrders.map(order => (
          <div key={order.id} className="order-card">
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{order.userName}</h3>
              <p style={{ color: '#ff69b4', fontWeight: 500 }}>📍 {order.distance} away</p>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
              🛒 Items for {selectedOrder.userName}
            </h2>
            <ul className="items-list">
              {selectedOrder.items.map(item => (
                <li key={item.id} className="item">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={availableItems[item.id]}
                    onChange={() => handleItemToggle(item.id)}
                  />
                  <span>{item.name}</span>
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

