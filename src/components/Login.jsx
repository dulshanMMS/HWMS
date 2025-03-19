import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const [currentState, setCurrentState] = useState('Sign In');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = currentState === 'Sign In' 
            ? 'http://localhost:5000/api/auth/signin' 
            : 'http://localhost:5000/api/auth/signup';

        const requestData = currentState === 'Sign In' 
            ? { username, email, password }
            : { firstName, lastName, username, email, password, confirmPassword };

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
                    localStorage.setItem('token', data.token);
                    
                    if (data.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/user');
                    }
                }

                setFirstName('');
                setLastName('');
                setUsername('');
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
                            {currentState === 'Sign Up' && (
                                <>
                                    <input 
                                        type='text' 
                                        placeholder='First Name' 
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)} 
                                        required 
                                    />
                                    <input 
                                        type='text' 
                                        placeholder='Last Name' 
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)} 
                                        required 
                                    />
                                </>
                            )}
                            <input 
                                type='email' 
                                placeholder='Working Email' 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                            <input 
                                type='text' 
                                placeholder='Username' 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                            />
                            <div className='password-container'>
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Password' 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                                <span className='eye-icon' onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                                </span>
                            </div>
                            {currentState === 'Sign Up' && (
                                <div className='password-container'>
                                    <input 
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder='Confirm Password' 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        required 
                                    />
                                    <span className='eye-icon' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                                    </span>
                                </div>
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