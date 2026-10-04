import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/Login.css';

import { fetchUsers } from '../services/api';


const Login = () => {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    if (!email || !password) {

      setError(
        'Please enter email and password.'
      );

      return;
    }

    setLoading(true);

    try {

      const response =
        await fetchUsers();

      const users =
        Array.isArray(response)
          ? response
          : response.data || [];

      const user =
        users.find(
          (item) =>
            String(item.Email || '')
              .trim()
              .toLowerCase() ===
              email.trim().toLowerCase() &&

            String(item.Password || '') ===
              password
        );

      if (!user) {

        setError(
          'Invalid email or password.'
        );

        return;
      }


      const loggedInUser = {

        Name:
          user.Name || '',

        Email:
          user.Email || '',

        Role:
          String(
            user.Role || 'student'
          ).toLowerCase(),

        'Register Number':
          user['Register Number'] ||
          user.RegisterNumber ||
          user.registerNumber ||
          ''
      };


      sessionStorage.setItem(
        'internTrackUser',
        JSON.stringify(loggedInUser)
      );

      sessionStorage.setItem(
        'internTrackLoggedIn',
        'true'
      );


      if (
        loggedInUser.Role ===
        'coordinator'
      ) {

        navigate('/coordinator');

      } else if (
        loggedInUser.Role ===
        'faculty'
      ) {

        navigate('/faculty');

      } else {

        navigate('/home');
      }

    } catch (err) {

      console.error(err);

      setError(
        'Unable to connect to authentication service.'
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <div className="login-container">

      <div className="login-form">

        <form onSubmit={handleSubmit}>

          <h2>Login</h2>

          <div className="input-box">

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <label>Email</label>

          </div>


          <div className="input-box">

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <label>Password</label>

          </div>


          <div className="forgot-section">

            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="/">
              Forgot Password?
            </a>

          </div>


          {error && (
            <p
              style={{
                color: 'white',
                textAlign: 'center',
                marginBottom: '10px'
              }}
            >
              {error}
            </p>
          )}


          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? 'Logging in...'
              : 'Log in'}
          </button>


          <div className="register-section">

            <p>
              Don't have an account?{' '}

              <a
                href="/register"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
              >
                Register
              </a>

            </p>

          </div>

        </form>

      </div>

    </div>
  );
};


export default Login;