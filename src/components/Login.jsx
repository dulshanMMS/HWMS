import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [currentState, setCurrentState] = useState('Sign In');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = currentState === 'Sign In' 
            ? 'http://localhost:5000/api/auth/signin' 
            : 'http://localhost:5000/api/auth/signup';

        const requestData = { email, password };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Success: ${data.message || 'Operation successful'}`);
                setMessageType('success');

                if (currentState === 'Sign In') {
                    // Save token & redirect to dashboard
                    localStorage.setItem('token', data.token);
                    navigate('/admin');  // Redirect to admin dashboard
                }

                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setMessage(`Error: ${data.error || 'Unknown error occurred'}`);
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Something went wrong. Please try again.');
            setMessageType('error');
        }
    };

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
                        {message && <p className={`message ${messageType}`}>{message}</p>}
                        <form onSubmit={handleSubmit} className='login-form'>
                            <input 
                                type='email' 
                                placeholder='Working Email' 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input 
                                type='password' 
                                placeholder='Password' 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {currentState === 'Sign Up' && (
                                <input 
                                    type='password' 
                                    placeholder='Confirm Password' 
                                    required 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            )}
                            <div className='options'>
                                {currentState === 'Sign In' && (
                                    <p className='forget-password'>Forgot Password?</p>
                                )}
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
                                <p 
                                    className='signup' 
                                    onClick={() => {
                                        setCurrentState(currentState === 'Sign In' ? 'Sign Up' : 'Sign In');
                                        setMessage('');
                                    }}
                                >
                                    {currentState === 'Sign In' ? 'Sign Up' : 'Sign In'}
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
