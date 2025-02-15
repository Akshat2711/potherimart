import React from 'react'
import './Landingpage.css'

export const Landingpage = () => {
  return (
    <div>
    {/* Background Video */}
            <video autoPlay muted loop className="bg-video">
                <source src="/public/landingback.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
    {/* Background Video end*/}

    <button className='continue_btn' onClick={()=>{window.location.href='/login'}}>Continue</button>
    <h1 className='landing_text'>Grab<span>hub</span></h1>

    </div>

  )
}
