import React from 'react';
import { Shield, FileImage, Camera, BarChart3, Users, Clock, Award, Smartphone, Crosshair } from 'lucide-react';
import { useNavigate } from "react-router-dom";


export default function WelcomePage() {
  const navigate = useNavigate();

  const detectionCategories = [
    { icon: Crosshair, name: "weapons", description: "Guns, knives, weapons, dangerous objects" },
    { icon: BarChart3, name: "object", description: "Handbags, wallet, watches, suitcase, valuable items" },
    { icon: FileImage, name: "content", description: "Documents, Handwriting- Sensitive Content" },
    { icon: Camera, name: "vehicles", description: "Cars, motorcycles, trucks, bicycle, license plates" },
    { icon: Users, name: "people", description: "Faces, gatherings" },
    { icon: Smartphone, name: "technology", description: "Camera, Smartphones, Laptop, TV" },
    { icon: FileImage, name: "oscenity", description: "Explicit Content" }
  ];

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
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Advanced AI-powered detection system for analyzing digital evidence and identifying potential threats in multimedia content.
          </p>
          <button
            onClick={() => navigate("/analysis")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Proceed to Analysis
          </button>
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
                <h4 className="text-slate-800 font-semibold mb-2 capitalize">{category.name}</h4>
                <p className="text-slate-600 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
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