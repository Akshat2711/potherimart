import React from 'react'
import './Navbar.css'
import { useHref } from 'react-router-dom'

export const Navbar = (props) => {
  return (
    <div>
        <ul className="menu-bar">
            <li style={{color:props.color_nav_order}} onClick={()=>{window.location.href='/order'}}>Order</li>
            <li style={{color:props.color_nav_deliver}} onClick={()=>{window.location.href='/deliver'}}>Deliver</li>
            <li style={{color:props.color_nav_account}} onClick={()=>{window.location.href='/account'}}>Account</li>
        </ul>
    </div>
  )
}
