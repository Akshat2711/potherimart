import React, { useState } from 'react';
import { Navbar } from './Navbar';
import './Home.css';

export const Home = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Perfume', image: 'https://th.bing.com/th/id/OIP.z3jaQLXvK6MGq7vjHmmH1gHaFj?w=221&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7', quantity: 1 },
    { id: 2, name: 'Shoe', image: 'https://th.bing.com/th/id/OIP.dL92SbRekfXKw78E0yyHNwHaFS?w=261&h=186&c=7&r=0&o=5&dpr=1.5&pid=1.7', quantity: 1 },
    { id: 3, name: 'Watch', image: 'https://th.bing.com/th/id/OIP.sfjzw1d4O0M9KuJmGjOEbgHaEK?w=256&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7', quantity: 1 }
  ]);

  const [dropdown, setDropdown] = useState(false);

  const updateQuantity = (id, change) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, quantity: Math.max(0, product.quantity + change) } : product
      ).filter(product => product.quantity > 0)
    );
  };

  const listedItems = [
    { id: 1, name: 'Lays', price: 'Rs.10', image: 'https://th.bing.com/th/id/OIP.5QuX3EadecjWh7YSodgcEwHaHa?w=200&h=200&c=7&r=0&o=5&dpr=1.5&pid=1.7' },
    { id: 2, name: 'Kurkure',price: 'Rs.40', image: 'https://i5.walmartimages.com/asr/266b721a-e7c3-4949-a86b-f51e4791065a.30972f401f4261c88d4c854ee29a807b.jpeg' },
    { id: 3, name: '5 Star',price: 'Rs.20', image: 'https://th.bing.com/th/id/OIP.GFHOVGAIbHm9ZP67XVklygHaDG?w=319&h=146&c=7&r=0&o=5&dpr=1.5&pid=1.7' },
    { id: 4, name: 'Yellow Lays',price: 'Rs.100', image: 'https://th.bing.com/th/id/OIP.D9T0U9VsgdFudD4cnq0C5QHaGy?w=217&h=198&c=7&r=0&o=5&dpr=1.5&pid=1.7' },
    { id: 5, name: 'Oreo Chocolate',price: 'Rs.70', image: 'https://th.bing.com/th/id/OIP.Q1BnS7DJNO3GfxHqAnNmZQHaHa?w=167&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7' },
    { id: 6, name: 'Nextar',price: 'Rs.30', image: 'https://th.bing.com/th/id/OIP.hkI9AEzfAOcYyI8Svx2AWwHaHa?w=184&h=184&c=7&r=0&o=5&dpr=1.5&pid=1.7' }
  ];

  return (
    <div className="home_parent_container">
      <Navbar color_nav_order='pink' />
      <div className="home_child_container">
        {products.length > 0 ? (
          <ul className="product_list">
            {products.map(product => (
              <li key={product.id} className="product_item">
                <img src={product.image} alt={product.name} className="product_image" />
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
        <button className='order_btn'>Place Order</button>
      </div>
      <div className='already_listed_container'>
        <h1 style={{ width: '100%' }}>Shop</h1>
        {listedItems.map(item => (
          <div key={item.id} className='items'>
            <img src={item.image} alt={item.name} />
            <h2>{item.name}</h2>
            {item.price && <h2 style={{color:'pink'}}>{item.price}</h2>}
            <button>Add+</button>
          </div>
        ))}
      </div>
      <div className='additem_container'>
        {dropdown && (
          <div className='dropdown_container'>
            {products.length > 0 ? (
              <ul className="product_list">
                {products.map(product => (
                  <li key={product.id} className="product_item">
                    <img src={product.image} alt={product.name} className="product_image" />
                    <span className="product_name">{product.name}</span>
                    <button onClick={() => updateQuantity(product.id, 1)} style={{ marginRight: '10px', marginTop: '9px' }}>+</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty_message">Add items to See here ;)</p>
            )}
          </div>
        )}
        <input type='text' placeholder='Enter product name' onFocus={() => setDropdown(true)} onBlur={() => setDropdown(false)} />
        <button>+</button>
      </div>
    </div>
  );
};
