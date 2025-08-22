import React from 'react';

const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-gray-800">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <div className="mb-6">{children}</div>
                <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    確定
                </button>
            </div>
        </div>
    );
};

export default Modal;
