// frontend/src/components/Dropdown.jsx

import React from 'react';
import './Dropdown.css';

const Dropdown = ({ label, name, options, value, onChange, placeholder }) => {
    return (
        <div className="form-group">
            {label && <label htmlFor={name}>{label}:</label>}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="custom-select"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Dropdown;