import React from 'react';

const Modal = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div 
        className="modal fade show" 
        tabIndex="-1" 
        style={{ display: 'block', zIndex: 1055 }}
        onClick={onClose} // Close on backdrop click
      >
        <div 
          className="modal-dialog modal-xl modal-dialog-scrollable"
          onClick={e => e.stopPropagation()} // Prevent click inside modal from closing
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title h4">{title}</h5>
              <button 
                type="button" 
                className="btn-close" 
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              {children}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;