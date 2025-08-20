import React, { useState } from 'react';
import api from '../api/api'; // Assumes api.js exists and exports axios instance
import { useNavigate } from 'react-router-dom';

const AddAsset = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [format, setFormat] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/assets', {
        name,
        type,
        format
      });

      navigate('/assets'); // redirect to asset list
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };

  return (
    <div className="add-asset-container">
      <h1>Add New Asset</h1>
      <form onSubmit={handleSubmit} className="add-asset-form">
        <input
          placeholder="Asset Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Type (e.g., 3D Model, Concept Art)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <input
          placeholder="Format (e.g., obj, abc, jpg, png)"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        />
        <button type="submit">Create Asset</button>
      </form>
    </div>
  );
};

export default AddAsset;
