import React, { useState } from 'react';
import { Shield, FileImage, Camera, BarChart3, Users, Clock, Award, Smartphone, Crosshair } from 'lucide-react';

export default function WelcomePage() {
  const detectionCategories = [
    { icon: Crosshair, name: "weapons", description: "Guns, knives, weapons, dangerous objects" },
    { icon: BarChart3, name: "object", description: "Handbags, laptops, watches, electronics, valuable items" },
    { icon: FileImage, name: "content", description: "Photo IDs, invoices, documents, handwriting" },
    { icon: Camera, name: "vehicles", description: "Cars, motorcycles, license plates" },
    { icon: Users, name: "people", description: "Faces, gatherings" },
    { icon: Smartphone, name: "technology", description: "Camera, smartphones" },
    { icon: Award, name: "appearance", description: "Tattoos, nudity, flags" }
  ];

  const availableCategories = detectionCategories.map(c => c.name);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFolderChange = (e) => {
    setError("");
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setSelectedCategories([]); // Reset categories on new folder
      setShowCategoryModal(true); // Show modal for category selection
    }
  };

  // Handle category selection
  // const handleCategoryToggle = (category) => {
  //   setSelectedCategories(prev =>
  //     prev.includes(category)
  //       ? prev.filter(c => c !== category)
  //       : [...prev, category]
  //   );
  // };

  const handleCategoryToggle = (category) => {
  setSelectedCategories(prev =>
    prev.includes(category)
      ? prev.filter(c => c !== category)
      : [...prev, category]
  );
};

  // Send request to backend after category selection
  // const handleSubmit = async () => {
  //   setError("");
  //   setProcessing(true);
  //   setResults({ images: [], videos: [] });
  //   try {
  //     const res = await fetch('http://localhost:5000/process', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         input_dir: `${selectedFolder}`,
  //         categories: selectedCategories
  //       })
  //     });
  //     if (!res.ok) {
  //       throw new Error(`Server error: ${res.status}`);
  //     }
  //     const data = await res.json();
  //     setResults(data.result || { images: [], videos: [] });
  //   } catch (err) {
  //     setError(err.message || "Failed to fetch results");
  //   } finally {
  //     setProcessing(false);
  //     setShowCategoryModal(false);
  //   }
  // };

  const handleSubmit = async () => {
    setError("");
    setProcessing(true);
    setResults([]);
    try {
      let allResults = [];
      for (const file of selectedFiles) {
        for (const category of selectedCategories) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("category", category);
          const res = await fetch('http://localhost:5000/detect', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          allResults.push({
            file: file.name,
            category,
            result: data.result || data.error,
            filename: data.filename || file.name,
            imageData: data.image_data
          });
        }
      }
      setResults(allResults);
    } catch (err) {
      setError(err.message || "Failed to fetch results");
    } finally {
      setProcessing(false);
      setShowCategoryModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Digital Evidence Analysis Platform</h1>
                <p className="text-sm text-slate-600">Crime Investigation Department, Karnataka</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Government of Karnataka</p>
              <p className="text-xs text-slate-400">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-100 p-6 rounded-2xl">
              <img src="logo.jpg" alt="CID Logo" className="h-16 w-16 object-contain" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            Automated Digital Content
            <span className="block text-blue-600">Investigation Platform</span>
          </h2>
          <br />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm cursor-pointer">
              Choose Folder
              <input
                type="file"
                webkitdirectory="true"
                directory=""
                multiple
                style={{ display: 'none' }}
                onChange={handleFolderChange}
                accept=".jpg,.jpeg,.png,.bmp,.tiff,.gif,.txt,.pdf,.docx"
              />
            </label>
          </div>
        </div>

        {/* Detection Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-16">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-8">
            Automated Detection Capabilities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {detectionCategories.map((category, index) => (
              <div key={index} className="group text-center p-4 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                  <category.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-slate-800 font-semibold mb-2">{category.name}</h4>
                <p className="text-slate-600 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Processing Throbber and Error */}
      {processing && (
        <div className="flex justify-center items-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
          <span className="ml-4 text-blue-600 font-semibold">Processing...</span>
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 font-semibold my-4">{error}</div>
      )}

      {/* Category Modal */}
      {showCategoryModal && !processing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Select Categories to Investigate</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {availableCategories.map(cat => (
                <label key={cat} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded mr-2"
              onClick={handleSubmit}
              disabled={selectedCategories.length === 0}
            >
              Investigate
            </button>
            <button
              className="bg-gray-300 px-6 py-2 rounded"
              onClick={() => setShowCategoryModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && !processing && (
        <div className="max-w-4xl mx-auto my-12">
          <h3 className="text-2xl font-bold mb-4">Detection Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results
              .filter(res => {
                const isNegative = res.result && res.result.sentiment && res.result.sentiment.label === 'NEGATIVE' && res.result.sentiment.score > 0.65;
                const hasDanger = res.result && res.result.danger_words && res.result.danger_words.length > 0;
                const hasVehicles = res.category === 'vehicles' && res.result && res.result.vehicles && res.result.vehicles.length > 0;
                const hasAssets = res.category === 'object' && res.result && res.result.assets && res.result.assets.length > 0;
                const hasTechnology = res.category === 'technology' && res.result && res.result.detections && res.result.detections.length > 0;
                const hasWeapons = res.category === 'weapons' && res.result && res.result.weapons && res.result.weapons.length > 0;
                const hasNudity = res.category === 'appearance' && res.result && res.result.nudity_detected === true;
                return isNegative || hasDanger || hasVehicles || hasAssets || hasTechnology || hasWeapons || hasNudity;
              })
              .map((res, idx) => {
                const isNegative = res.result && res.result.sentiment && res.result.sentiment.label === 'NEGATIVE' && res.result.sentiment.score > 0.65;
                const hasDanger = res.result && res.result.danger_words && res.result.danger_words.length > 0;
                const hasVehicles = res.category === 'vehicles' && res.result && res.result.vehicles && res.result.vehicles.length > 0;
                const hasAssets = res.category === 'object' && res.result && res.result.assets && res.result.assets.length > 0;
                const hasTechnology = res.category === 'technology' && res.result && res.result.detections && res.result.detections.length > 0;
                const hasWeapons = res.category === 'weapons' && res.result && res.result.weapons && res.result.weapons.length > 0;
                const hasNudity = res.category === 'appearance' && res.result && res.result.nudity_detected === true;
                return (
                  <div key={idx} className={`bg-white rounded shadow p-4 ${isNegative || hasDanger || hasWeapons || hasNudity ? 'border-2 border-red-500' : hasVehicles ? 'border-2 border-blue-500' : hasAssets || hasTechnology ? 'border-2 border-green-500' : ''}`}>
                    {/* Header with filename and category */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Image thumbnail */}
                      {res.imageData && (
                        <div className="flex-shrink-0">
                          <img 
                            src={res.imageData} 
                            alt={res.filename || res.file}
                            className="w-24 h-24 object-cover rounded border shadow-sm"
                          />
                        </div>
                      )}
                      {/* File info */}
                      <div className="flex-grow">
                        <div className="font-semibold text-gray-800 mb-1">{res.filename || res.file}</div>
                        <div className="text-blue-600 text-sm font-medium mb-2 capitalize">{res.category}</div>
                      </div>
                    </div>
                    
                    {/* Detection results */}
                    <div className="space-y-2">
                    {isNegative && (
                      <div className="text-red-600 font-bold mb-2">Negative Sentiment Detected!</div>
                    )}
                    {hasDanger && (
                      <div className="text-red-600 font-bold mb-2">Danger Words: {res.result.danger_words.join(', ')}</div>
                    )}
                    {hasWeapons && (
                      <div className="text-red-600 font-bold mb-2">⚠️ WEAPONS DETECTED!</div>
                    )}
                    {hasWeapons && res.result.weapons.map((weapon, wIdx) => (
                      <div key={wIdx} className="mb-2 p-2 rounded bg-red-50 border border-red-200">
                        <div className="font-semibold text-red-700">Type: {weapon.class}</div>
                        <div className="text-red-600">Confidence: {weapon.confidence}%</div>
                        {weapon.danger_level && (
                          <div className="text-red-800 font-bold">⚠️ Danger Level: {weapon.danger_level}</div>
                        )}
                        <div className="text-sm text-red-500">Location: [{weapon.box.join(', ')}]</div>
                      </div>
                    ))}
                    {hasNudity && (
                      <div className="text-red-600 font-bold mb-2">🚨 INAPPROPRIATE CONTENT DETECTED!</div>
                    )}
                    {hasNudity && res.result.regions && res.result.regions.map((region, nIdx) => (
                      <div key={nIdx} className="mb-2 p-2 rounded bg-red-50 border border-red-200">
                        <div className="font-semibold text-red-700">Type: {region.description || region.label}</div>
                        <div className="text-red-600">Confidence: {region.confidence}%</div>
                        {region.risk_level && (
                          <div className="text-red-800 font-bold">⚠️ Risk Level: {region.risk_level}</div>
                        )}
                        <div className="text-sm text-red-500">Location: [{region.box.join(', ')}]</div>
                      </div>
                    ))}
                    {hasVehicles && (
                      <div className="text-blue-600 font-bold mb-2">Detected Vehicles:</div>
                    )}
                    {hasVehicles && res.result.vehicles.map((veh, vIdx) => (
                      <div key={vIdx} className="mb-2 p-2 rounded bg-blue-50">
                        <div className="font-semibold">Type: {veh.class}</div>
                        <div>Plate(s): {veh.plates && veh.plates.length > 0 ? veh.plates.join(', ') : 'None detected'}</div>
                      </div>
                    ))}
                    {hasAssets && (
                      <div className="text-green-600 font-bold mb-2">Detected Assets:</div>
                    )}
                    {hasAssets && res.result.assets.map((asset, aIdx) => (
                      <div key={aIdx} className="mb-2 p-2 rounded bg-green-50">
                        <div className="font-semibold">Type: {asset.class}</div>
                        <div>Location: [{asset.box.join(', ')}]</div>
                      </div>
                    ))}
                    {hasTechnology && (
                      <div className="text-green-600 font-bold mb-2">Detected Technology:</div>
                    )}
                    {hasTechnology && res.result.detections.map((tech, tIdx) => (
                      <div key={tIdx} className="mb-2 p-2 rounded bg-green-50">
                        <div className="font-semibold">Type: {tech.label}</div>
                        <div>Confidence: {tech.confidence}</div>
                        <div>Location: [{tech.bbox.join(', ')}]</div>
                      </div>
                    ))}
                    {res.result && res.result.highlighted_text ? (
                      <pre className="bg-slate-50 p-2 rounded text-xs overflow-x-auto">
                        {res.result.highlighted_text}
                      </pre>
                    ) : (!hasVehicles && !hasAssets && !hasWeapons && !hasNudity && (
                      <pre className="bg-slate-50 p-2 rounded text-xs overflow-x-auto">
                        {typeof res.result === "string"
                          ? res.result
                          : JSON.stringify(res.result, null, 2)}
                      </pre>
                    ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-400 mr-3" />
              <div>
                <span className="font-semibold">Crime Investigation Department, Karnataka</span>
                <p className="text-slate-400 text-sm">Digital Evidence Analysis Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-slate-400 text-sm">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                <span>Secure</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


// ...existing code...