import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // Axios client

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/assets')
      .then((res) => setAssets(res.data))
      .catch((err) => console.error('Error fetching assets:', err));
  }, []);

  const handleEdit = (id) => {
    navigate(`/assets/edit/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/assets/${id}`);
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id));
    } catch (err) {
      console.error('Error deleting asset:', err);
    }
  };

  return (
    <div className="asset-list-container">
      <h1>Asset List</h1>
      <ul>
        {assets.map((asset) => (
          <li key={asset.id}>
            <strong>{asset.name}</strong> - {asset.type}
            <div>
              <button onClick={() => handleEdit(asset.id)}>Edit</button>
              <button onClick={() => handleDelete(asset.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssetList;
