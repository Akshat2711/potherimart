import React from 'react'
import './Account.css'
import { Navbar } from './Navbar'
import { FaMapMarkerAlt } from 'react-icons/fa'

export const Account = () => {
  return (
    <>
      <Navbar color_nav_account="#ff69b4" />
      <div className='parent_account'>
        {/* Profile and Map Section */}
        <div className='profile_map_section'>
          <div className='profile_pic_div'>
            <svg xmlns="http://www.w3.org/2000/svg" className="user-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <div className='map_div'>
            <div className="map-placeholder">
              <FaMapMarkerAlt className="map-icon" />
              <span>Map Preview</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className='menu_item'>
          <span>Track Order</span>
          <div className="arrow">→</div>
        </div>
        <div className='menu_item'>
          <span>Delivery History</span>
          <div className="arrow">→</div>
        </div>
        <div className='menu_item'>
          <span>Address Book</span>
          <div className="arrow">→</div>
        </div>
        <div className='menu_item sign-out'>
          <span>Sign Out</span>
        </div>
      </div>
    </>
  )
}