import React, { useState } from "react";
import axios from "axios";

const CreateAssetForm = () => {
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [fileFormat, setFileFormat] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // Removed TS-specific type

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/assets", {
        name,
        type: assetType,
        format: fileFormat,
      });

      setMessageType("success");
      setMessage("Asset created successfully!");
      setName("");
      setAssetType("");
      setFileFormat("");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("Error creating asset.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="asset-form">
      <h2>Create New Asset</h2>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="form-field">
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label>Type</label>
        <input
          type="text"
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label>File Format</label>
        <input
          type="text"
          value={fileFormat}
          onChange={(e) => setFileFormat(e.target.value)}
          required
        />
      </div>

      <button type="submit">Create Asset</button>
    </form>
  );
};

export default CreateAssetForm;
