import React from 'react';
import { 
  Database, 
  MessageSquare, 
  Search, 
  BarChart3, 
  Brain, 
  Globe, 
  Download, 
  Zap,
  ArrowRight,
  ArrowDown,
  FileText,
  Server,
  Map,
  Activity,
  Users,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Cpu,
  Cloud,
  Filter,
  Eye
} from 'lucide-react';

const ArgoFlowchart = () => {
  const FlowNode = ({ icon: Icon, title, subtitle, color = "blue", size = "normal", status = null }) => {
    const sizeClasses = {
      small: "p-3 min-w-32",
      normal: "p-4 min-w-40",
      large: "p-6 min-w-48"
    };

    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      green: "bg-green-50 border-green-200 text-green-800",
      purple: "bg-purple-50 border-purple-200 text-purple-800",
      orange: "bg-orange-50 border-orange-200 text-orange-800",
      red: "bg-red-50 border-red-200 text-red-800",
      gray: "bg-gray-50 border-gray-200 text-gray-800",
      cyan: "bg-cyan-50 border-cyan-200 text-cyan-800"
    };

    return (
      <div className={`border-2 rounded-lg ${sizeClasses[size]} ${colorClasses[color]} relative shadow-sm`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
        {status && (
          <div className="absolute -top-2 -right-2">
            {status === 'success' && <CheckCircle className="w-4 h-4 text-green-600 bg-white rounded-full" />}
            {status === 'processing' && <RefreshCw className="w-4 h-4 text-blue-600 bg-white rounded-full animate-spin" />}
            {status === 'alert' && <AlertCircle className="w-4 h-4 text-orange-600 bg-white rounded-full" />}
          </div>
        )}
      </div>
    );
  };

  const FlowArrow = ({ direction = "right", label = null, color = "gray" }) => {
    const colorClasses = {
      blue: "text-blue-500",
      green: "text-green-500",
      purple: "text-purple-500",
      gray: "text-gray-400"
    };

    if (direction === "down") {
      return (
        <div className="flex flex-col items-center">
          <ArrowDown className={`w-4 h-4 ${colorClasses[color]}`} />
          {label && <span className="text-xs text-gray-500 mt-1 text-center">{label}</span>}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <ArrowRight className={`w-6 h-6 ${colorClasses[color]}`} />
        {label && <span className="text-xs text-gray-500 mt-1 text-center whitespace-nowrap">{label}</span>}
      </div>
    );
  };

  const ProcessingPipeline = () => (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
      <h4 className="font-semibold text-gray-700 mb-3 text-center">RAG Processing Pipeline</h4>
      <div className="flex items-center justify-between space-x-4">
        <FlowNode 
          icon={MessageSquare} 
          title="Query Input" 
          subtitle="Natural Language"
          color="blue" 
          size="small"
        />
        <FlowArrow color="blue" />
        <FlowNode 
          icon={Brain} 
          title="LLM Analysis" 
          subtitle="Intent Recognition"
          color="purple" 
          size="small"
          status="processing"
        />
        <FlowArrow color="purple" />
        <FlowNode 
          icon={Search} 
          title="Vector Search" 
          subtitle="Metadata Retrieval"
          color="cyan" 
          size="small"
        />
        <FlowArrow color="cyan" />
        <FlowNode 
          icon={Database} 
          title="SQL Generation" 
          subtitle="Query Translation"
          color="green" 
          size="small"
          status="success"
        />
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6 overflow-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ARGO Float AI System Architecture</h1>
        <p className="text-gray-600">End-to-end conversational oceanographic data analysis workflow</p>
      </div>

      {/* Main Flow */}
      <div className="max-w-7xl mx-auto">
        
        {/* Data Ingestion Layer */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Data Ingestion & Processing Layer</h2>
          <div className="flex items-center justify-center space-x-6">
            <FlowNode 
              icon={Globe} 
              title="ARGO NetCDF Files" 
              subtitle="Raw oceanographic data"
              color="blue"
            />
            <FlowArrow label="ETL Process" color="blue" />
            <FlowNode 
              icon={RefreshCw} 
              title="Data Converter" 
              subtitle="NetCDF → SQL/Parquet"
              color="orange"
              status="processing"
            />
            <FlowArrow label="Transform" color="orange" />
            <FlowNode 
              icon={Database} 
              title="Structured Storage" 
              subtitle="SQL Database"
              color="green"
              status="success"
            />
          </div>
        </div>

        {/* Vector Database Layer */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <FlowNode 
              icon={Server} 
              title="Vector Database" 
              subtitle="FAISS/Chroma metadata"
              color="purple"
              status="success"
            />
            <FlowNode 
              icon={FileText} 
              title="Metadata Index" 
              subtitle="Searchable summaries"
              color="cyan"
              status="success"
            />
          </div>
          <div className="flex justify-center mt-4">
            <FlowArrow direction="down" label="Query Processing" color="purple" />
          </div>
        </div>

        {/* RAG Processing Pipeline */}
        <div className="mb-8">
          <ProcessingPipeline />
        </div>

        {/* AI Models Layer */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">AI Models & Processing (MCP)</h2>
          <div className="flex items-center justify-center space-x-6">
            <FlowNode 
              icon={Brain} 
              title="GPT/QWEN" 
              subtitle="Query understanding"
              color="purple"
              size="small"
            />
            <FlowNode 
              icon={Cpu} 
              title="LLaMA/Mistral" 
              subtitle="Response generation"
              color="purple"
              size="small"
            />
            <FlowNode 
              icon={Cloud} 
              title="Model Context" 
              subtitle="Protocol integration"
              color="gray"
              size="small"
            />
          </div>
          <div className="flex justify-center mt-4">
            <FlowArrow direction="down" label="Generate Response" color="green" />
          </div>
        </div>

        {/* User Interface Layer */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">User Interface Layer</h2>
          <div className="grid grid-cols-3 gap-6">
            
            {/* Chat Interface */}
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <FlowNode 
                icon={MessageSquare} 
                title="Chat Interface" 
                subtitle="Natural language queries"
                color="blue"
              />
              <div className="mt-3 text-xs text-gray-600">
                <p>• "Show salinity near equator"</p>
                <p>• "Compare BGC in Arabian Sea"</p>
                <p>• "Nearest floats to location"</p>
              </div>
            </div>

            {/* Dashboard */}
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <FlowNode 
                icon={BarChart3} 
                title="Analytics Dashboard" 
                subtitle="Real-time visualizations"
                color="green"
              />
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Activity className="w-3 h-3 text-green-500" />
                  <span>3,847 Active floats</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Map className="w-3 h-3 text-blue-500" />
                  <span>Global coverage</span>
                </div>
              </div>
            </div>

            {/* Profile Explorer */}
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <FlowNode 
                icon={Eye} 
                title="Profile Explorer" 
                subtitle="Detailed float analysis"
                color="orange"
              />
              <div className="mt-3 text-xs text-gray-600">
                <p>• Temperature profiles</p>
                <p>• Trajectory mapping</p>
                <p>• Data quality metrics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Output Layer */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">System Outputs</h2>
          <div className="flex items-center justify-center space-x-8">
            <FlowNode 
              icon={BarChart3} 
              title="Interactive Charts" 
              subtitle="Depth-time plots"
              color="green"
              size="small"
              status="success"
            />
            <FlowNode 
              icon={Map} 
              title="Geographic Maps" 
              subtitle="Float trajectories"
              color="blue"
              size="small"
              status="success"
            />
            <FlowNode 
              icon={Download} 
              title="Data Export" 
              subtitle="CSV/NetCDF formats"
              color="orange"
              size="small"
              status="success"
            />
            <FlowNode 
              icon={FileText} 
              title="Analysis Reports" 
              subtitle="Automated insights"
              color="purple"
              size="small"
              status="success"
            />
          </div>
        </div>

        {/* User Types */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Target Users</h2>
          <div className="flex items-center justify-center space-x-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Domain Experts</h3>
              <p className="text-xs text-gray-600">Oceanographers</p>
            </div>
            <div className="text-center">
              <Zap className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Decision Makers</h3>
              <p className="text-xs text-gray-600">Policy & Research</p>
            </div>
            <div className="text-center">
              <Filter className="w-12 h-12 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Non-technical Users</h3>
              <p className="text-xs text-gray-600">Easy data access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArgoFlowchart;