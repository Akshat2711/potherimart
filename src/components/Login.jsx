import React, { useState } from 'react';
import { db } from '../firebase/firebase'; 
import { ref as dbRef, set, get } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import "./Login.css";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signup = async () => {
    const msgRef = dbRef(db, `potherimart/${username}`);
    const msgdata = {
      user: username,
      timestamp: '',
      pass: password,
      long: '',
      lati: ''
    };

    try {
      await set(msgRef, msgdata);
      alert("Sign up success");
    } catch (error) {
      console.error("Error during sign-up:", error);
      alert("An error occurred during sign-up. Please try again.");
    }
  };

  const signin = async () => {
    const msgRef = dbRef(db, `potherimart/`);

    try {
      const snapshot = await get(msgRef);
      const userdata = snapshot.val();
      let isAuthenticated = false;

      for (let id in userdata) {
        if (username === id && password === userdata[id].pass) {
          isAuthenticated = true;
          console.log("Sign in success", username);

          localStorage.setItem("user", username);
          alert("Sign in successful!");
          navigate('/order');
          break; // Exit the loop once authenticated
        }
      }

      if (!isAuthenticated) {
        console.log("Sign in unsuccessful");
        alert("Invalid username or password!");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      alert("An error occurred during sign-in. Please try again.");
    }
  };

  return (
    <div className='parent'>
      <h1 className='brandtitle'>Potheri<span>Mart</span></h1>

      {/* Background Video */}
      <video autoPlay muted loop className="bg-video">
        <source src="/login.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className='child'>
        <div className='profile_container'></div>
        
        <div className='inputcontainer'>
          <input 
            placeholder="Enter Username!" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            placeholder="Enter Password!" 
            type='password' 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br/>

          <button className='login_btn' onClick={signin}>
            Sign In
          </button>

          <button className='login_btn' onClick={signup}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};
