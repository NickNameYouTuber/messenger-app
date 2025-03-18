import React from 'react';
import AuthForm from '../components/AuthForm';

const AuthPage = ({ username, password, setUsername, setPassword, login, register, error }) => (
  <div className="auth-container">
    <h2>Messenger</h2>
    <AuthForm
      username={username}
      password={password}
      setUsername={setUsername}
      setPassword={setPassword}
      login={login}
      register={register}
      error={error}
    />
  </div>
);

export default AuthPage;
