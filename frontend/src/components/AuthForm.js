import React from 'react';

const AuthForm = ({ username, password, setUsername, setPassword, login, register, error }) => (
  <div className="auth-form">
    <input
      placeholder="Username"
      value={username}
      onChange={e => setUsername(e.target.value)}
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={e => setPassword(e.target.value)}
    />
    <div className="auth-buttons">
      <button onClick={login}>Login</button>
      <button onClick={register}>Register</button>
    </div>
    {error && <div className="error">{error}</div>}
  </div>
);

export default AuthForm;
