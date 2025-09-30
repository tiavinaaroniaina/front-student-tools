import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationTriangle, 
  faInfoCircle, 
  faTimes,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

const AnimatedAlert = ({ 
  type = 'info', 
  message, 
  title,
  duration = 5000, 
  onClose,
  position = 'top-right',
  showProgress = true,
  persistent = false,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!persistent && duration > 0) {
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 50));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 50);

      // Auto close timer
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(timer);
      };
    }
  }, [duration, persistent]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: faCheckCircle,
          className: 'alert-success',
          defaultTitle: 'Succès'
        };
      case 'error':
        return {
          icon: faExclamationCircle,
          className: 'alert-error',
          defaultTitle: 'Erreur'
        };
      case 'warning':
        return {
          icon: faExclamationTriangle,
          className: 'alert-warning',
          defaultTitle: 'Attention'
        };
      case 'info':
      default:
        return {
          icon: faInfoCircle,
          className: 'alert-info',
          defaultTitle: 'Information'
        };
    }
  };

  if (!isVisible) return null;

  const config = getAlertConfig();
  const alertTitle = title || config.defaultTitle;

  return (
    <div 
      className={`
        animated-alert 
        ${config.className} 
        alert-${position}
        ${isExiting ? 'alert-exiting' : 'alert-entering'}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Progress Bar */}
      {showProgress && !persistent && (
        <div className="alert-progress-container">
          <div 
            className="alert-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Alert Content */}
      <div className="alert-content">
        <div className="alert-icon">
          <FontAwesomeIcon icon={config.icon} />
        </div>
        
        <div className="alert-text">
          {alertTitle && (
            <div className="alert-title">{alertTitle}</div>
          )}
          <div className="alert-message">{message}</div>
        </div>

        <button
          onClick={handleClose}
          className="alert-close-btn"
          aria-label="Fermer l'alerte"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="alert-decoration">
        <div className="alert-glow"></div>
        <div className="alert-particles">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

// Alert Manager Component
export const AlertManager = ({ alerts = [], onRemoveAlert }) => {
  return (
    <div className="alert-manager">
      {alerts.map((alert) => (
        <AnimatedAlert
          key={alert.id}
          {...alert}
          onClose={() => onRemoveAlert(alert.id)}
        />
      ))}
    </div>
  );
};

// Hook for managing alerts
export const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (alertConfig) => {
    const id = Date.now() + Math.random();
    const newAlert = { id, ...alertConfig };
    
    setAlerts(prev => [...prev, newAlert]);
    
    return id;
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const showSuccess = (message, options = {}) => {
    return addAlert({ type: 'success', message, ...options });
  };

  const showError = (message, options = {}) => {
    return addAlert({ type: 'error', message, persistent: true, ...options });
  };

  const showWarning = (message, options = {}) => {
    return addAlert({ type: 'warning', message, ...options });
  };

  const showInfo = (message, options = {}) => {
    return addAlert({ type: 'info', message, ...options });
  };

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default AnimatedAlert;