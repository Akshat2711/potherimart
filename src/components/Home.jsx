import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import './Home.css';

import { db } from '../firebase/firebase'; 
import { ref as dbRef, set, onValue, update, get, push, remove } from "firebase/database";
//for getting current location
import { Getlocation } from './Getlocation';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [dropdown, setDropdown] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const username = localStorage.getItem("user");



//to get nearby oaction and update in db
    const detectdist = async () => {
      try {
        const userLocation = await Getlocation();

        const userRef = dbRef(db, `potherimart/${username}`);
        await update(userRef, { long: userLocation.longitude, lati: userLocation.latitude });
        console.log(userLocation);
        
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };
  
    // Use useEffect to call detectNearby when the component mounts
    useEffect(() => {
      detectdist();
    }, []); 

////////////////////////////////////






  // Fetch cart data from Firebase on component mount
  useEffect(() => {
    if (!username) return;

    const cartRef = dbRef(db, `potherimart/${username}/cart`);
    const unsubscribe = onValue(cartRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(productsArray);
      } else {
        setProducts([]);
      }
    });

    return () => unsubscribe();
  }, [username]);







  // List order online
  const list_order_online = async () => {


    if (!username || products.length === 0) return;

    const orderRef = dbRef(db, `potherimart/${username}/orders`);
    const snapshot = await get(orderRef);
    const orderData = snapshot.val() || {};

    const newOrderRef = push(orderRef);
    await set(newOrderRef, {
      products: products,
      status: 'pending'
    });

    const cartRef = dbRef(db, `potherimart/${username}/cart`);
    const snapshotCart = await get(cartRef);
    const cartData = snapshotCart.val() || {};

    Object.keys(cartData).forEach(async (key) => {
      await remove(dbRef(db, `potherimart/${username}/cart/${key}`));
    });


  }






  // Add item from shop to cart
  const addShopItemToCart = async (item) => {
    if (!username) return;

    const cartRef = dbRef(db, `potherimart/${username}/cart`);
    const snapshot = await get(cartRef);
    const cartData = snapshot.val() || {};

    const existingItemKey = Object.keys(cartData).find(
      key => cartData[key].name === item.name
    );

    if (existingItemKey) {
      await update(dbRef(db, `potherimart/${username}/cart/${existingItemKey}`), {
        quantity: cartData[existingItemKey].quantity + 1
      });
    } else {
      const newItemRef = push(cartRef);
      await set(newItemRef, {
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: 1
      });
    }
  };

  // Add custom item from input to cart
  const addCustomItemToCart = async (itemName) => {
    if (!username || !itemName.trim()) return;

    const cartRef = dbRef(db, `potherimart/${username}/cart`);
    const snapshot = await get(cartRef);
    const cartData = snapshot.val() || {};

    // Check if item exists in listedItems
    const listedItem = listedItems.find(item => item.name === itemName);

    if (listedItem) {
      addShopItemToCart(listedItem);
    } else {
      const existingItemKey = Object.keys(cartData).find(
        key => cartData[key].name === itemName
      );

      if (existingItemKey) {
        await update(dbRef(db, `potherimart/${username}/cart/${existingItemKey}`), {
          quantity: cartData[existingItemKey].quantity + 1
        });
      } else {
        const newItemRef = push(cartRef);
        await set(newItemRef, {
          name: itemName,
          quantity: 1
        });
      }
    }
    setInputValue('');
  };

  // Update item quantity in Firebase
  const updateQuantity = async (itemId, change) => {
    if (!username) return;

    const itemRef = dbRef(db, `potherimart/${username}/cart/${itemId}`);
    const snapshot = await get(itemRef);
    const itemData = snapshot.val();

    if (!itemData) return;

    const newQuantity = itemData.quantity + change;
    if (newQuantity <= 0) {
      await remove(itemRef);
    } else {
      await update(itemRef, { quantity: newQuantity });
    }
  };

  const listedItems = [
    { id: 1, name: 'Lays', price: 'Rs.10', image: 'https://th.bing.com/th/id/OIP.5QuX3EadecjWh7YSodgcEwHaHa?w=200&h=200&c=7&r=0&o=5&dpr=1.5&pid=1.7' },
    { id: 2, name: 'Kurkure', price: 'Rs.40', image: 'https://i5.walmartimages.com/asr/266b721a-e7c3-4949-a86b-f51e4791065a.30972f401f4261c88d4c854ee29a807b.jpeg' },
    { id: 3, name: '5 Star', price: 'Rs.20', image: 'https://th.bing.com/th/id/OIP.GFHOVGAIbHm9ZP67XVklygHaDG?w=319&h=146&c=7&r=0&o=5&dpr=1.5&pid=1.7' },
    { id: 4, name: 'Yellow Lays', price: 'Rs.100', image: 'https://th.bing.com/th/id/OIP.D9T0U9VsgdFudD4cnq0C5QHaGy?w=217&h=198&c=7&r=0&o=5&dpr=1.5&pid=1.7' },
    { id: 5, name: 'Oreo Chocolate', price: 'Rs.70', image: 'https://th.bing.com/th/id/OIP.Q1BnS7DJNO3GfxHqAnNmZQHaHa?w=167&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7' },
    { id: 6, name: 'Nextar', price: 'Rs.30', image: 'https://th.bing.com/th/id/OIP.hkI9AEzfAOcYyI8Svx2AWwHaHa?w=184&h=184&c=7&r=0&o=5&dpr=1.5&pid=1.7' }
  ];

  return (
    <div className="home_parent_container">
      <Navbar color_nav_order='#ff69b4' />

      {/* Cart Section */}
      <div className="home_child_container">
        {products.length > 0 ? (
          <ul className="product_list">
            {products.map(product => (
              <li key={product.id} className="product_item">
                <img 
                  src={product.image || 'https://via.placeholder.com/100'} 
                  alt={product.name} 
                  className="product_image" 
                />
                {product.price && <p style={{color:'grey'}}>{product.price}</p>}
                <span className="product_name">{product.name}</span>
                <button onClick={() => updateQuantity(product.id, -1)}>-</button>
                <span>{product.quantity}</span>
                <button onClick={() => updateQuantity(product.id, 1)}>+</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty_message">Add items to See here ;)</p>
        )}
        <button className='order_btn' onClick={()=>list_order_online()}>Place Order</button>
      </div>

      {/* Shop Items */}
      <div className='already_listed_container'>
        <h1 style={{ width: '100%' }}>Shop</h1>
        {listedItems.map(item => (
          <div key={item.id} className='items'>
            <img src={item.image} alt={item.name} />
            <h2>{item.name}</h2>
            <h2 style={{color:'pink'}}>{item.price}</h2>
            <button onClick={() => addShopItemToCart(item)}>Add+</button>
          </div>
        ))}
      </div>

      {/* Add Item Input */}
      <div className='additem_container'>
        {dropdown && (
          <div className='dropdown_container'>
            {products.length > 0 ? (
              <ul className="product_list">
                {products.map(product => (
                  <li key={product.id} className="product_item">
                    <img 
                      src={product.image || 'https://via.placeholder.com/100'} 
                      alt={product.name} 
                      className="product_image" 
                    />
                    <span className="product_name">{product.name}</span>
                    <button 
                      onClick={() => updateQuantity(product.id, 1)} 
                      style={{ marginRight: '10px', marginTop: '9px' }}
                    >
                      +
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty_message">Add items to See here ;)</p>
            )}
          </div>
        )}
        <input 
          type='text' 
          placeholder='Enter product name' 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setDropdown(true)} 
          onBlur={() => setTimeout(() => setDropdown(false), 100)} 
        />
        <button onClick={() => addCustomItemToCart(inputValue)}>+</button>
      </div>
    </div>
  );
};