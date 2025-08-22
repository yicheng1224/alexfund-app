import React from 'react';

const ToggleSwitch = ({ id, checked, onChange }) => (
  <div className="relative inline-block w-10 mr-2 align-middle select-none">
    <input type="checkbox" id={id} checked={checked} onChange={onChange} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
    <label htmlFor={id} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
  </div>
);

export default ToggleSwitch;
