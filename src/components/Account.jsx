import React, { useEffect, useState } from 'react';
import './Account.css';
import { Navbar } from './Navbar';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { db, auth } from '../firebase/firebase'; // Ensure Firebase is configured
import { ref as dbRef, onValue, set, update } from 'firebase/database';
// For getting current location
import { Getlocation } from './Getlocation';

export const Account = () => {
  const [userOrders, setUserOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]); // Store all accepted orders
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showDeliveries, setShowDeliveries] = useState(false); // New state for "To Deliver" section
  const [inputAddress, setInputAddress] = useState('');
  const username = localStorage.getItem('user');


  console.log(userOrders);

  // Fetch address from the database
  useEffect(() => {
    const dbref = dbRef(db, `potherimart/${username}/address`);
    onValue(dbref, (snapshot) => {
      const data = snapshot.val();
      if (data) setInputAddress(data); // Update state with fetched address
    });
  }, [username]);

  // Get nearby location and update in the database
  const detectdist = async () => {
    try {
      const userLocation = await Getlocation();
      const userRef = dbRef(db, `potherimart/${username}`);
      await update(userRef, { long: userLocation.longitude, lati: userLocation.latitude });
      console.log(userLocation);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  // Use useEffect to call detectNearby when the component mounts
  useEffect(() => {
    detectdist();
  }, []);

  // Update address in the database
  useEffect(() => {
    if (!inputAddress) return; // Avoid updating if empty

    const timeoutId = setTimeout(() => {
      const dbref = dbRef(db, `potherimart/${username}`);
      update(dbref, { address: inputAddress });
    }, 1000); // Delay update by 1 second

    return () => clearTimeout(timeoutId); // Clear timeout on re-render
  }, [inputAddress, username]);

  // Fetch user orders
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return;

    // Listen for changes in the user's orders
    const userOrdersRef = dbRef(db, `potherimart/${user}/orders`);
    const unsubscribe = onValue(userOrdersRef, (snapshot) => {
      const orders = snapshot.val();
      if (orders) {
        const orderList = Object.keys(orders).map((key) => ({
          id: key,
          ...orders[key],
        }));
        setUserOrders(orderList);

        // Filter orders with status 'req_accepted'
        const accepted = orderList.filter((order) => order.status === 'req_accepted');
        setAcceptedOrders(accepted);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle accepting delivery
  const handleAcceptDelivery = (orderId) => {
    const user = localStorage.getItem('user');
    if (!user) return;

    // Update the order status to "accepted"
    const orderRef = dbRef(db, `potherimart/${user}/orders/${orderId}`);
    update(orderRef, { status: 'accepted' })
      .then(() => {
        alert('Delivery accepted!');
        // Remove the accepted order from the list
        setAcceptedOrders((prev) => prev.filter((order) => order.id !== orderId));
      })
      .catch((error) => {
        console.error('Error accepting delivery:', error);
      });
  };

  // Handle rejecting delivery
  const handleRejectDelivery = (orderId) => {
    const user = localStorage.getItem('user');
    if (!user) return;

    // Update the order status to "pending"
    const orderRef = dbRef(db, `potherimart/${user}/orders/${orderId}`);
    update(orderRef, { status: 'pending' })
      .then(() => {
        alert('Delivery rejected. Order is now pending again.');
        // Remove the rejected order from the list
        setAcceptedOrders((prev) => prev.filter((order) => order.id !== orderId));
      })
      .catch((error) => {
        console.error('Error rejecting delivery:', error);
      });
  };

  // Handle marking an order as delivered
  const handleMarkAsDelivered = (orderId) => {
    const user = localStorage.getItem('user');
    if (!user) return;

    // Update the order status to "delivered"
    const orderRef = dbRef(db, `potherimart/${user}/orders/${orderId}`);
    update(orderRef, { status: 'delivered' })
      .then(() => {
        alert('Order marked as delivered!');
        // Remove the delivered order from the list
        setUserOrders((prev) => prev.filter((order) => order.id !== orderId));
      })
      .catch((error) => {
        console.error('Error marking order as delivered:', error);
      });
  };

  return (
    <>
      <Navbar color_nav_account="#ff69b4" />
      <div className="parent_account">
        {/* Profile and Map Section */}
        <div className="profile_map_section">
          <div className="profile_pic_div">
            <svg xmlns="http://www.w3.org/2000/svg" className="user-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <div className="map_div">
            <div className="map-placeholder">
              <FaMapMarkerAlt className="map-icon" />
              <span>Map Preview</span>
            </div>
          </div>
        </div>

        {/* Track Order Section */}
        <div className="menu_item" onClick={() => setShowTrackOrder(!showTrackOrder)}>
          <span>Track Order</span>
          <div className="arrow">→</div>
        </div>
        {showTrackOrder && (
          <div className="track-order-notification">
            {acceptedOrders.length > 0 ? (
              acceptedOrders.map((order) => (
                <div key={order.id} className="order-notification">
                  <h2>Order Accepted!</h2>
                  <p>Order ID: {order.id}</p>
                  <p>Accepted by: {order.acceptedBy}</p>
                  <h3>Available Items:</h3>
                  <ul>
                    {Object.entries(order.availableItems).map(([itemId, isAvailable]) => (
                      <li key={itemId}>
                        Item {itemId}: {isAvailable ? 'Available' : 'Not Available'}
                      </li>
                    ))}
                  </ul>
                  <div className="notification-actions">
                    <button
                      className="accept-button"
                      onClick={() => handleAcceptDelivery(order.id)}
                    >
                      Accept Delivery
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => handleRejectDelivery(order.id)}
                    >
                      Reject Delivery
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No orders to track.</p>
            )}
          </div>
        )}

        {/* Delivery History Section */}
        <div className="menu_item">
          <span>Delivery History</span>
          <div className="arrow">→</div>
        </div>

        {/* Address Book Section */}
        <div className="menu_item" onClick={() => setShowAddress(!showAddress)}>
          <span>Address Book</span>
          <div className="arrow">→</div>
        </div>
        {showAddress && (
          <div className="address-book">
            <textarea
              placeholder={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
            />
          </div>
        )}

        {/* To Deliver Section */}
        <div className="menu_item" onClick={() => setShowDeliveries(!showDeliveries)}>
          <span>To Deliver</span>
          <div className="arrow">→</div>
        </div>
        {showDeliveries && (
          <div className="track-order-notification">
            {userOrders.filter((order) => order.status === 'accepted').length > 0 ? (
              userOrders
                .filter((order) => order.status === 'accepted' )
                .map((order) => (
                  <div key={order.id} className="order-notification">
                    <h2>Delivery to:</h2>
                    <p>{order.address || 'Address not specified'}</p>
                    <h3>Items to Deliver:</h3>
                    <ul>
                      {Object.entries(order.availableItems || {}).map(
                        ([itemId, isAvailable]) =>
                          isAvailable && (
                            <li key={itemId}>Item {itemId}</li>
                          )
                      )}
                    </ul>
                    <div className="notification-actions">
                      <button
                        className="accept-button"
                        onClick={() => handleMarkAsDelivered(order.id)}
                      >
                        Mark as Delivered
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <p>No deliveries pending.</p>
            )}
          </div>
        )}

        {/* Sign Out Section */}
        <div className="menu_item sign-out">
          <span>Sign Out</span>
        </div>
      </div>
    </>
  );
};