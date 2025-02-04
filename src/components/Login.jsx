import React, { useState } from 'react'
import './Login.css'

const Login = () => {
    const [currentState, setCurrentState] = useState('Sign In')

  return (
    <div>
        <nav className='navbar'>
            <ul className='nav-links'>
                <li><a href='#'>Home</a></li>
                <li><a href='#'>About Us</a></li>
                <li><a href='#'>Resources</a></li>
            </ul>
            <button className='sign-in-btn'>Sign In</button>
        </nav>
        <div className='login-container'>
            <div className='image-section'></div>
            <div className='form-section'>
                <div className='form-box'>
                    <h2>{currentState}</h2>
                    <form action='#' className='login-form'>
                        <input type='text' id='email' placeholder='Working Email' required />
                        <input type='password' id='password' placeholder='Password' required />
                        {currentState === 'Sign In' ? '' : (
                            <input type='password' id='confirm-password' placeholder='Confirm Password' required />
                        )}
                        <div className='options'>
                            {currentState === 'Sign In' ? (
                                <p className='forget-password'>Forgot Password?</p>
                            ) : ''}
                        </div>
                        <button className='login-btn' type='submit'>
                            {currentState === 'Sign In' ? 'Login' : 'Sign Up'}
                        </button>
                        <div className='signup-option'>
                            {currentState === 'Sign In' ? (
                                <p>Do not have an account yet?</p>
                            ) : (
                                <p>Already have an account?</p>
                            )} 
                            {currentState === 'Sign In' ? (
                                <p className='signup' onClick={() => setCurrentState('Sign Up')}>Sign Up</p>
                            ) : (
                                <p className='signup' onClick={() => setCurrentState('Sign In')}>Sign In</p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Login