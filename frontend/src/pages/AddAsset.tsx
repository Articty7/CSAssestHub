import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddAsset: React.FC = () => {
    const [name, setName] = useState('');
    const [type,setType] = useState('');
    const [ format, setFormat] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.post ('/assets',{
                name,
                type,
                format
            });
            //go back to asset list
            navigate('/assets');
        } catch (error) {
            console.error(' Error creating asset:', error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Add New Asset</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                className="border p-2 w-full"
                placeholder="Asset Name"
                value={name}
                onChange={(e) => setName (e.target.value)}
                required
                />
                <input
                className="border p-2 w-full"
                placeholder="Type (e.g., 3D Model, Concept Art)"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                />
                <input
                className="border p-2 w-full"
                placeholder ="Format (e.g., obj, abc, jpg, png)"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                />
                <button type= "submit" className= "bg-blue-600 text-white px-4 py-2 rounded">
                    Create Asset
                </button>
            </form>
        </div>
    );
};

export default AddAsset;
