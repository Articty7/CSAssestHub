import React, { useEffect, useState } from 'react';
import api from '../services/api'; //Axios client

interface Asset {
    id: number;
    name: string;
    type: string;
}

const AssetList: React.FC = () => {
    const [assets, setAssets]= useState<Asset[]>([]);

    useEffect(() => {
        api.get ('/assets')
        .then((res) => setAssets(res.data))
        .catch((err) => console.error ('Error fetching assets:', err));
    }, []);

    return (
        <div className ="p-4">
            <h1 className= "text-2xl font-bold mb-4"> Asset List</h1>
            <ul className= "list-disc pl-6">
                {assets.map ((asset) => (
                    <li key={asset.id}>
                        <strong>{asset.name}</strong> - {asset.type}
                    </li>
                ))}
            </ul>
            </div>
        );
    };

    export default AssetList;
