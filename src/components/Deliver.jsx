import { useState, useEffect } from 'react';
import './Deliver.css';
import { Navbar } from './Navbar';
import { db, auth } from '../firebase/firebase';
import { ref as dbRef, onValue, update } from "firebase/database";
import { Getlocation } from './Getlocation';

export const Deliver = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableItems, setAvailableItems] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null); // Store user's lat/lon
  const [deliveryaddress, setDeliveryaddress] = useState(null);

  const username = localStorage.getItem('user');

  // Function to calculate distance between two pts (later create diff file)--temporary
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (angle) => (angle * Math.PI) / 180;
    const R = 6371; // Earth's radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Get user location and update Firebase
  const detectdist = async () => {
    try {
      const location = await Getlocation();
      setUserLocation(location); // Store user's location

      const userRef = dbRef(db, `potherimart/${username}`);
      await update(userRef, { long: location.longitude, lati: location.latitude });

      console.log("User Location:", location);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };






  useEffect(() => {
    detectdist();
  }, []);

  useEffect(() => {
    const potherimartRef = dbRef(db, 'potherimart');
    const unsubscribe = onValue(potherimartRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allOrders = [];
        Object.keys(data).forEach(userKey => {
          const user = data[userKey];

          //for adding delivery address taking here from logged in user
          if (user.user === username) {
            setDeliveryaddress(user.address);
          }



          if (user.orders) {
            Object.keys(user.orders).forEach(orderKey => {
              const order = user.orders[orderKey];

              if (order.status === 'pending' && user.lati && user.long && userLocation) {
                const distance = calculateDistance(user.lati, user.long, userLocation.latitude, userLocation.longitude);
                allOrders.push({
                  id: orderKey,
                  ...order,
                  listedBy: userKey,
                  distance: distance.toFixed(2) // Store distance in km
                });
              }
            });
          }
        });
        setOrders(allOrders);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, [userLocation]); // Recalculate distances when user location changes

  const handleAcceptOrder = (order) => {
    setSelectedOrder(order);
    const initialAvailability = {};
    order.products.forEach(product => {
      initialAvailability[product.name] = false;
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
    const user = localStorage.getItem('user');
    if (!user) {
      alert('You need to be logged in to accept orders.');
      return;
    }
    const delivererId = user;

    const orderRef = dbRef(db, `potherimart/${selectedOrder.listedBy}/orders/${selectedOrder.id}`);

    const updates = {
      status: 'req_accepted',
      acceptedBy: delivererId,
      availableItems: availableItems,
      deliveryaddress: deliveryaddress,
      orderid:selectedOrder.id,
      orderedby:selectedOrder.listedBy
    };

    update(orderRef, updates)
      .then(() => {
        alert(`Request for order ${selectedOrder.id} has been sent to user.`);
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Error updating order: ", error);
        alert('Failed to accept the order. Please try again.');
      });
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
                <p style={{ color: '#007bff', fontWeight: 500 }}>Distance: {order.distance} km</p>
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
                      checked={availableItems[product.name]}
                      onChange={() => handleItemToggle(product.name)}
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
