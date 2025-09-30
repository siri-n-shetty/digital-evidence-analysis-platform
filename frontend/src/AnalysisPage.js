import React, { useState } from 'react';
import { Shield, FileImage, Camera, BarChart3, Users, Clock, Award, Smartphone, Crosshair, ArrowLeft, FolderOpen } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function AnalysisPage() {
  const navigate = useNavigate();
  // Export results to folder
  const handleExport = async () => {
    if (!window.showDirectoryPicker) {
      alert("Folder picker not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    try {
      const dirHandle = await window.showDirectoryPicker();
      // Create 'results' folder
      const resultsFolder = await dirHandle.getDirectoryHandle('results', { create: true });

      // Group results by category
      const resultsByCategory = {};
      filteredResults.forEach(res => {
        const cat = res.category || 'uncategorized';
        if (!resultsByCategory[cat]) resultsByCategory[cat] = [];
        resultsByCategory[cat].push(res);
      });

      // For each category, create folder and export images
      for (const [category, items] of Object.entries(resultsByCategory)) {
        const catFolder = await resultsFolder.getDirectoryHandle(category, { create: true });
        for (const res of items) {
          if (res.imageData) {
            // Convert base64 to blob
            let mime = 'image/png';
            let base64 = res.imageData;
            if (base64.startsWith('data:')) {
              mime = base64.split(';')[0].split(':')[1] || 'image/png';
              base64 = base64.split(',')[1];
            }
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mime });
            // Use filename or fallback, sanitize for Windows
            let filename = res.filename || res.file || `suspect_${Math.random().toString(36).slice(2)}.png`;
            filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_'); // Only allow safe chars
            if (!filename.toLowerCase().endsWith('.png') && !filename.toLowerCase().endsWith('.jpg') && !filename.toLowerCase().endsWith('.jpeg')) {
              filename += '.png';
            }
            const imgHandle = await catFolder.getFileHandle(filename, { create: true });
            const writable = await imgHandle.createWritable();
            await writable.write(blob);
            await writable.close();
          }
        }
      }

      // Also export summary JSON in results folder
      const fileHandle = await resultsFolder.getFileHandle("analysis_results.json", { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(filteredResults, null, 2));
      await writable.close();
      alert("Results and suspect images exported in 'results' folder.");
    } catch (err) {
      alert("Export failed: " + (err.message || err));
    }
  };

  const detectionCategories = [
    { 
      icon: Crosshair, 
      name: "weapons", 
      // description: "Guns, knives, weapons, dangerous objects",
      bullets: [
        "Guns",
        "Knife",
        "Weapons",
        "Dangerous Objects"
      ]
    },
    { 
      icon: BarChart3, 
      name: "object", 
      // description: "Handbags, wallet, watches, electronics, valuable items",
      bullets: [
        "Handbag",
        "Wallet",
        "Watch",
        "Suitcase"
      ]
    },
    { 
      icon: FileImage, 
      name: "content", 
      // description: "Photo IDs, invoices, documents, handwriting",
      bullets: [
        "Sensitive texts"
      ]
    },
    { 
      icon: Camera, 
      name: "vehicles", 
      // description: "Cars, motorcycles, license plates",
      bullets: [
        "Bicycle",
        "Car",
        "Motorcycle",
        "Bus",
        "Train",
        "Truck",
        "Boat"
      ]
    },
    { 
      icon: Users, 
      name: "people", 
      description: "Faces, gatherings"
    },
    { 
      icon: Smartphone, 
      name: "technology", 
      // description: "Camera, smartphones",
      bullets: [
        "TV",
        "Laptop",
        "Mouse",
        "Keyboard",
        "Cell Phone"
      ]
    },
    { 
      icon: FileImage, 
      name: "obscenity", 
      description: "Explicit Content"
    }
  ];

  const availableCategories = detectionCategories.map(c => c.name);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);

  const handleFolderChange = (e) => {
    setError("");
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setSelectedCategories([]); // Reset categories on new folder
      setResults([]); // Clear previous results
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select a folder first");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("Please select at least one category");
      return;
    }

    setError("");
    setProcessing(true);
    
    try {
      let allResults = [];
      for (const file of selectedFiles) {
        for (const category of selectedCategories) {
          // Skip if already added
          if (allResults.some(r => r.file === file.name && r.category === category)) continue;
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
    }
  };

  const filteredResults = results.filter(res => {
    const q = (searchQuery || "").toLowerCase();

    const isContent = (res.category || "").toLowerCase() === "content";
    const suicidalHit =
      isContent &&
      res.result &&
      res.result.suicidal_label === "suicidal" &&
      typeof res.result.suicidal_score === "number" &&
      res.result.suicidal_score > 0.65;

    const hasDanger = res.result && Array.isArray(res.result.danger_words) && res.result.danger_words.length > 0;
    const hasVehicles = res.category === 'vehicles' && res.result && res.result.detections && res.result.detections.length > 0;
    const hasAssets = res.category === 'object' && res.result && res.result.assets && res.result.assets.length > 0;
    const hasPeople = res.category === 'people' && res.result && res.result.detections && res.result.detections.length > 0;
    const hasTechnology = res.category === 'technology' && res.result && res.result.detections && res.result.detections.length > 0;
    const hasWeapons = res.category === 'weapons' && res.result && res.result.detections && res.result.detections.length > 0;
    const hasNudity = res.category === 'appearance' && res.result && res.result.nudity_detected === true;

    const matchesCategory = (res.category || "").toLowerCase().includes(q);
    const matchesFilename = ((res.filename || res.file) || "").toLowerCase().includes(q);
    const matchesLabel =
      (res.result?.detections || []).some(det => det.label && det.label.toLowerCase().includes(q)) ||
      (res.result?.highlighted_text || "").toLowerCase().includes(q) ||
      (res.result?.detected_text || "").toLowerCase().includes(q);
    
    const important = suicidalHit || hasDanger || hasVehicles || hasAssets || hasPeople || hasTechnology || hasWeapons || hasNudity;

    return important && (q === "" || matchesCategory || matchesFilename || matchesLabel);
  });

  // Helper: Extract unique subcategories from results
  const getSubcategories = () => {
    const subcats = new Set();
    filteredResults.forEach(res => {
      // Weapons
      if (res.category === "weapons" && res.result?.detections) {
        res.result.detections.forEach(d => d.label && subcats.add(d.label));
      }
      // Vehicles
      if (res.category === "vehicles" && res.result?.detections) {
        res.result.detections.forEach(d => d.label && subcats.add(d.label));
      }
      // Object/Assets
      if (res.category === "object" && res.result?.assets) {
        res.result.assets.forEach(a => a.class && subcats.add(a.class));
      }
      // Technology
      if (res.category === "technology" && res.result?.detections) {
        res.result.detections.forEach(d => d.label && subcats.add(d.label));
      }
      // Obscenity
      if (res.category === "obscenity" && res.result?.regions) {
        res.result.regions.forEach(r => r.description && subcats.add(r.description));
      }
    });
    return Array.from(subcats);
  };

  const subcategoryOptions = getSubcategories();

  // Filter results by selected subcategories
  const subcategoryFilteredResults = selectedSubcategories.length === 0
    ? filteredResults
    : filteredResults.filter(res => {
        // Weapons
        if (res.category === "weapons" && res.result?.detections) {
          return res.result.detections.some(d => selectedSubcategories.includes(d.label));
        }
        // Vehicles
        if (res.category === "vehicles" && res.result?.detections) {
          return res.result.detections.some(d => selectedSubcategories.includes(d.label));
        }
        // Object/Assets
        if (res.category === "object" && res.result?.assets) {
          return res.result.assets.some(a => selectedSubcategories.includes(a.class));
        }
        // Technology
        if (res.category === "technology" && res.result?.detections) {
          return res.result.detections.some(d => selectedSubcategories.includes(d.label));
        }
        // Obscenity
        if (res.category === "obscenity" && res.result?.regions) {
          return res.result.regions.some(r => selectedSubcategories.includes(r.description));
        }
        return false;
      });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div className="bg-blue-600 p-2 rounded-lg mr-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Digital Evidence Analysis</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Folder Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Select Evidence Folder</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm cursor-pointer flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
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
            {selectedFiles.length > 0 && (
              <div className="text-green-600 font-medium">
                {selectedFiles.length} files selected
              </div>
            )}
          </div>
        </div>

        {/* Category Selection */}
        {selectedFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Select Analysis Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {detectionCategories.map((category, index) => (
                <label key={index} className="flex flex-col items-start space-y-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => handleCategoryToggle(category.name)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center space-x-2">
                      <category.icon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium capitalize">{category.name}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">{category.description}</div>
                  {category.bullets && (
                    <ul className="list-disc list-inside text-xs text-slate-500 mt-1">
                      {category.bullets.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </label>
              ))}
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={selectedCategories.length === 0 || processing}
            >
              {processing ? "Processing..." : "Start Analysis"}
            </button>
          </div>
        )}

        {/* Search */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Search Results</h3>
            <input
              type="text"
              placeholder="Search by category, filename, or label..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Processing Indicator */}
        {processing && (
          <div className="flex justify-center items-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
            <span className="ml-4 text-blue-600 font-semibold">Processing files...</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-600 font-semibold">{error}</div>
          </div>
        )}

        {/* Results Section */}
        {filteredResults.length > 0 && !processing && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Detection Results ({subcategoryFilteredResults.length} items)</h3>
            {/* Subcategory Filters */}
            {subcategoryOptions.length > 0 && (
              <div className="mb-6">
                <div className="font-semibold mb-2">Filter by Subcategory:</div>
                <div className="flex flex-wrap gap-3">
                  {subcategoryOptions.map((subcat, i) => (
                    <label key={i} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(subcat)}
                        onChange={() => setSelectedSubcategories(prev =>
                          prev.includes(subcat)
                            ? prev.filter(s => s !== subcat)
                            : [...prev, subcat]
                        )}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{subcat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm mb-6"
              onClick={handleExport}
            >
              Export Results
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subcategoryFilteredResults.map((res, idx) => {
                const isContent = (res.category || "").toLowerCase() === "content";
                const suicidalHit =
                  isContent &&
                  res.result &&
                  res.result.suicidal_label === "suicidal" &&
                  typeof res.result.suicidal_score === "number" &&
                  res.result.suicidal_score > 0.65;
                const hasDanger = res.result && Array.isArray(res.result.danger_words) && res.result.danger_words.length > 0;
                const hasVehicles = res.category === 'vehicles' && res.result && res.result.detections && res.result.detections.length > 0;
                const hasAssets = res.category === 'object' && res.result && res.result.assets && res.result.assets.length > 0;
                const hasPeople = res.category === 'people' && res.result && res.result.detections && res.result.detections.length > 0;
                const hasTechnology = res.category === 'technology' && res.result && res.result.detections && res.result.detections.length > 0;
                const hasWeapons = res.category === 'weapons' && res.result && res.result.detections && res.result.detections.length > 0;
                const hasNudity = res.category === 'appearance' && res.result && res.result.nudity_detected === true;

                const borderClass =
                  (suicidalHit || hasDanger || hasWeapons || hasNudity) ? 'border-l-4 border-red-500' :
                  (hasVehicles ? 'border-l-4 border-blue-500' :
                  (hasAssets || hasTechnology || hasPeople ? 'border-l-4 border-green-500' : ''));

                return (
                  <div key={idx} className={`bg-white rounded-lg shadow-sm p-6 ${borderClass}`}>
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
                    <div className="space-y-3">
                      {/* Content analysis results */}
                      {isContent && suicidalHit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="text-red-700 font-bold"> Sensitive Content Detected</div>
                          <div className="text-red-600">Score: {Math.round(res.result.suicidal_score * 100)}%</div>
                        </div>
                      )}
                      
                      {isContent && hasDanger && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="text-red-700 font-bold"> Danger Words Found</div>
                          <div className="text-red-600">{res.result.danger_words.join(', ')}</div>
                        </div>
                      )}

                      {/* Weapons detection */}
                      {hasWeapons && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="text-red-700 font-bold"> WEAPONS DETECTED</div>
                          {res.result.detections.map((weapon, wIdx) => (
                            <div key={wIdx} className="mt-2 text-sm">
                              <div className="font-medium">Type: {weapon.label}</div>
                              <div>Confidence: {Math.round(weapon.confidence * 100)}%</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Nudity detection */}
                      {hasNudity && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="text-red-700 font-bold"> INAPPROPRIATE CONTENT</div>
                          {res.result.regions && res.result.regions.map((region, nIdx) => (
                            <div key={nIdx} className="mt-2 text-sm">
                              <div className="font-medium">{region.description || region.label}</div>
                              <div>Confidence: {region.confidence}%</div>
                              {region.risk_level && (
                                <div className="font-bold">Risk: {region.risk_level}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Vehicle detection */}
                      {hasVehicles && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-blue-700 font-bold"> Vehicles Detected</div>
                          {res.result.detections.map((veh, vIdx) => (
                            <div key={vIdx} className="mt-2 text-sm">
                              <div className="font-medium">{veh.label}</div>
                              <div>Confidence: {veh.confidence}</div>
                              <div>Plates: {veh.plates && veh.plates.length > 0 ? veh.plates.join(', ') : 'None'}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Assets detection */}
                      {hasAssets && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="text-green-700 font-bold"> Assets Detected</div>
                          {res.result.assets.map((asset, aIdx) => (
                            <div key={aIdx} className="mt-2 text-sm">
                              <div className="font-medium">{asset.class}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* People detection */}
                      {hasPeople && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="text-purple-700 font-bold"> People Detected</div>
                          {res.result.detections.map((person, pIdx) => (
                            <div key={pIdx} className="mt-2 text-sm">
                              <div className="font-medium">{person.label}</div>
                              <div>Confidence: {person.confidence}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Technology detection */}
                      {hasTechnology && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="text-green-700 font-bold"> Technology Detected</div>
                          {res.result.detections.map((tech, tIdx) => (
                            <div key={tIdx} className="mt-2 text-sm">
                              <div className="font-medium">{tech.label}</div>
                              <div>Confidence: {tech.confidence}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Text content */}
                      {res.result && (res.result.highlighted_text || res.result.detected_text) && (
                        <div className="bg-slate-50 border rounded-lg p-3">
                          <div className="text-slate-700 font-medium mb-2">Extracted Text:</div>
                          <pre className="text-xs text-slate-600 whitespace-pre-wrap overflow-x-auto">
                            {res.result.highlighted_text || res.result.detected_text}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No results message */}
        {results.length > 0 && filteredResults.length === 0 && !processing && (
          <div className="text-center py-12">
            <div className="text-slate-500 text-lg">No significant detections found matching your search criteria.</div>
          </div>
        )}
      </div>

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