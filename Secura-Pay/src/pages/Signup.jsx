import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // import toast for notifications
import "react-toastify/dist/ReactToastify.css"; // import styles
import "../CSS/Signup.css";
import { handleError, handleSuccess } from "../utilis";

const Signup = () => {
  const [SignupInfo, setSignupInfo] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };
  const navigate = useNavigate();
  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, username, email, password, phone } = SignupInfo;

    if (!name || !username || !email || !password || !phone) {
      return handleError(
        "Name,username, email, password, and phone are required"
      );
    }

    try {
      const url = "http://localhost:8080/auth/signup";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(SignupInfo),
      });

      const result = await response.json();
      console.log(result);
      const { success, message, error } = result;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else if (error) {
        const details = error?.details[0].message;
        handleError(details);
      } else if (!success) {
        handleError(message);
      }
    } catch (err) {
      handleError("An error occurred. Please try again later.");
      console.error(err); // log the error for debugging
    }
  };

  return (
    <div className="container-body">
      <div className="container">
        <h1>Signup</h1>
        <form onSubmit={handleSignup}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              onChange={handleChange}
              type="text"
              name="name"
              autoFocus
              placeholder="Enter Your Name ..."
              value={SignupInfo.name}
            />
          </div>
          <div>
            <label htmlFor="username">Username</label>
            <input
              onChange={handleChange}
              type="text"
              name="username"
              autoFocus
              placeholder="Enter Your Username ..."
              value={SignupInfo.username}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter Your Email ..."
              value={SignupInfo.email}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter Your Password ..."
              value={SignupInfo.password}
            />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input
              onChange={handleChange}
              type="number"
              name="phone"
              placeholder="Enter Your Phone No ..."
              value={SignupInfo.phone}
            />
          </div>
          <button type="submit">Signup</button>
          <div className="already-account">
            <span>
              Already Have an Account? <Link to="/login">Login</Link>
            </span>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;
