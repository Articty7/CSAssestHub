
import React, { useState } from 'react';
import axios from 'axios';

const CreateAssetForm = () => {
    const [name, setName] = useState('');
    const [ description, setDescription] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try{
            const res = await axios.post ('http://localhost:5000/api/assets', {
                name,
                description,
            });

            setMessage(' Asset created successfully!');
            setName('');
            setDescription('');
            console.log(res.data);
        } catch (err) {
            console.error(err);
            setMessage('Error creating asset.');

        }
        };
        return (
            <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-4"
            >
                <h2 className="text-2xl font-bold mb-4">Create New Asset</h2>

                {message &&(
                    <div className="p-2 rounded text-sm text-white bg-green-500">
                        {message}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Name </label>
                    <input
                    type="text"
                    value= {name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    required
                    />
                </div>

                <div>
                    <label className="block text-sm font-mediium text-gray-700"> Description </label>
                    <textarea
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    rows={4}
                    />
                </div>

                <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                    Create Asset
                </button>
            </form>
        );
    };

    export default CreateAssetForm;
