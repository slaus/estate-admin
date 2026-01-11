import React, { createContext, useContext, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';

const LoadingContext = createContext({});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const showLoading = (message = '') => {
    setLoading(true);
    setLoadingMessage(message);
  };

  const hideLoading = () => {
    setLoading(false);
    setLoadingMessage('');
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            {loadingMessage && <p className="mt-2">{loadingMessage}</p>}
          </div>
        </div>
      )}
      {children}
      
      <style>
        {`
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          
          .loading-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
          }
        `}
      </style>
    </LoadingContext.Provider>
  );
};