import React, { useEffect, useState } from 'react';
import './Account.css';
import { Navbar } from './Navbar';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { db, auth } from '../firebase/firebase';
import { ref as dbRef, onValue, update, get } from 'firebase/database';
import { Getlocation } from './Getlocation';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export const Account = () => {
  const [userOrders, setUserOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showDeliveries, setShowDeliveries] = useState(false);
  const [inputAddress, setInputAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [orders, setOrders] = useState([]); // Orders for the delivery person
  const username = localStorage.getItem('user');

  // Fetch address from the database
  useEffect(() => {
    const dbref = dbRef(db, `potherimart/${username}/address`);
    onValue(dbref, (snapshot) => {
      const data = snapshot.val();
      if (data) setInputAddress(data);
    });
  }, [username]);

  // Get user's current location and update in the database
  const detectdist = async () => {
    try {
      const userLocation = await Getlocation();
      const userRef = dbRef(db, `potherimart/${username}`);
      await update(userRef, { long: userLocation.longitude, lati: userLocation.latitude });

      setLatitude(userLocation.latitude);
      setLongitude(userLocation.longitude);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  // Call detectdist on component mount
  useEffect(() => {
    detectdist();
  }, []);

  // Update address in the database
  useEffect(() => {
    if (!inputAddress) return;

    const timeoutId = setTimeout(() => {
      const dbref = dbRef(db, `potherimart/${username}`);
      update(dbref, { address: inputAddress });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [inputAddress, username]);

  // Fetch orders for the delivery person
  useEffect(() => {
    const dbref = dbRef(db, `potherimart/`);

    const unsubscribe = onValue(dbref, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.entries(data).flatMap(([userId, userData]) =>
          userData.orders
            ? Object.entries(userData.orders).map(([orderId, order]) => ({
                ...order,
                id: orderId,
                orderedby: userId,
              }))
            : []
        );

        // Fetch delivery locations for each order
        const ordersWithLocation = await Promise.all(
          ordersArray
            .filter(
              (order) =>
                order.status === "accepted" && order.acceptedBy === username
            )
            .map(async (order) => {
              try {
                const userRef = dbRef(db, `potherimart/${order.orderedby}`);
                const userSnapshot = await get(userRef);
                const userData = userSnapshot.val();
                return {
                  ...order,
                  deliveryLat: userData?.lati,
                  deliveryLng: userData?.long,
                };
              } catch (error) {
                console.error("Error fetching user location:", error);
                return order;
              }
            })
        );

        setOrders(ordersWithLocation);
      }
    });

    return () => unsubscribe();
  }, [username]);

  // Fetch user orders
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return;

    const userOrdersRef = dbRef(db, `potherimart/${user}/orders`);
    const unsubscribe = onValue(userOrdersRef, (snapshot) => {
      const orders = snapshot.val();
      if (orders) {
        const orderList = Object.keys(orders).map((key) => ({
          id: key,
          ...orders[key],
        }));
        setUserOrders(orderList);

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

    const orderRef = dbRef(db, `potherimart/${user}/orders/${orderId}`);
    update(orderRef, { status: 'accepted' })
      .then(() => {
        alert('Delivery accepted!');
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

    const orderRef = dbRef(db, `potherimart/${user}/orders/${orderId}`);
    update(orderRef, { status: 'pending' })
      .then(() => {
        alert('Delivery rejected. Order is now pending again.');
        setAcceptedOrders((prev) => prev.filter((order) => order.id !== orderId));
      })
      .catch((error) => {
        console.error('Error rejecting delivery:', error);
      });
  };

  // Handle marking an order as delivered
  const handleMarkAsDelivered = (orderId, orderedby) => {
    if (!orderedby) return;

    const orderRef = dbRef(db, `potherimart/${orderedby}/orders/${orderId}`);
    update(orderRef, { status: 'delivered' })
      .then(() => {
        alert('Order marked as delivered!');
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

          {/* Display Real-Time Map */}
          <div className="map_div">
            {latitude && longitude ? (
              <MapContainer
                center={[latitude, longitude]}
                zoom={15}
                style={{ height: "300px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[latitude, longitude]}>
                  <Popup>Your Location</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="map-placeholder">
                <FaMapMarkerAlt className="map-icon" />
                <span>Loading...</span>
              </div>
            )}
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

        {/* To Deliver Section */}
        <div className="menu_item" onClick={() => setShowDeliveries(!showDeliveries)}>
          <span>To Deliver</span>
          <div className="arrow">→</div>
        </div>
        {showDeliveries && (
          <div className="track-order-notification">
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <div key={order.id || index} className="order-notification">
                  <h2>Delivery to:</h2>
                  <p>{order.deliveryaddress || "Address not specified"}</p>

                  <h3>Items to Deliver:</h3>
                  {order.availableItems && Object.keys(order.availableItems).length > 0 ? (
                    <ul>
                      {Object.entries(order.availableItems).map(([itemId, isAvailable]) =>
                        isAvailable ? <li key={itemId}>Item {itemId}</li> : null
                      )}
                    </ul>
                  ) : (
                    <p>No items available for delivery.</p>
                  )}

                  {/* Map Section */}
                  {latitude && longitude && order.deliveryLat && order.deliveryLng ? (
                    <MapContainer
                      center={[latitude, longitude]}
                      zoom={15}
                      style={{ height: "300px", width: "100%", borderRadius: "10px", marginTop: "10px" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[latitude, longitude]}>
                        <Popup>Your Location</Popup>
                      </Marker>
                      <Marker position={[order.deliveryLat, order.deliveryLng]}>
                        <Popup>Delivery Location</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <p>Location not available</p>
                  )}

                  <div className="notification-actions">
                    <button
                      className="accept-button"
                      onClick={() => handleMarkAsDelivered(order.id, order.orderedby)}
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


        
        {/*  order history Section */}
           <div className="menu_item">
              <span>Order History</span>
              <div className="arrow">→</div>
          </div>



        {/* Sign Out Section */}
        <div className="menu_item sign-out">
          <span>Sign Out</span>
        </div>
      </div>
    </>
  );
};