import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FaSearch, FaFilter, FaRedo, FaRobot, FaTimes } from 'react-icons/fa';

const CATEGORIES = [
  { id: 'all', label: 'All Materials' },
  { id: 'metal', label: 'Metal' },
  { id: 'plastic', label: 'Plastic' },
  { id: 'cardboard', label: 'Cardboard' },
  { id: 'ewaste', label: 'E-Waste' },
  { id: 'paper', label: 'Paper' },
  { id: 'other', label: 'Other' },
];

const CITIES = ['All', 'Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 'Ankleshwar'];

const FilterBar = ({ filters, onFilterChange, onReset, aiSummary, setAiSummary }) => {
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [parsing, setParsing] = useState(false);

  const handleAiSearch = async (e) => {
    e?.preventDefault();
    if (!aiPrompt.trim()) {
      toast.error('Please enter a natural language scrap search prompt');
      return;
    }

    setParsing(true);
    try {
      const res = await API.post('/ai/parse-search', { query: aiPrompt });
      if (res.data?.success) {
        const data = res.data.data;
        const newFilters = {
          page: 1,
          search: data.search || '',
          category: data.category || 'all',
          condition: data.condition || 'all',
          city: data.city || 'all',
          maxPrice: data.maxPrice ? String(data.maxPrice) : '',
        };
        onFilterChange(newFilters);
        if (setAiSummary) {
          setAiSummary({
            summary: data.summary,
            source: data.source,
            maxPrice: data.maxPrice,
          });
        }
        toast.success('AI Filters applied!');
        setShowAiSearch(false);
      }
    } catch (err) {
      toast.error('Could not parse AI search prompt');
    } finally {
      setParsing(false);
    }
  };

  const handleClearAi = () => {
    if (setAiSummary) setAiSummary(null);
    onFilterChange({
      search: '',
      category: 'all',
      condition: 'all',
      city: 'all',
      maxPrice: '',
      page: 1,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs mb-8 space-y-4">
      {/* Top Bar: Keyword Search, AI Toggle, City & Sort */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Keyword Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search scrap material (e.g. Copper wire, HDPE, Baled boxes)..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />
        </div>

        {/* AI Natural Language Search Toggle Button */}
        <button
          type="button"
          onClick={() => setShowAiSearch(!showAiSearch)}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer border ${
            showAiSearch
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100'
          }`}
          title="Search with Meta LLaMA 3.3 70B AI"
        >
          <FaRobot className={showAiSearch ? 'text-white' : 'text-violet-600'} />
          <span>{showAiSearch ? 'Close AI Search' : 'Ask AI Scrap Finder'}</span>
        </button>

        {/* City Filter */}
        <div className="w-full md:w-44">
          <select
            value={filters.city || 'all'}
            onChange={(e) => onFilterChange({ city: e.target.value, page: 1 })}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {CITIES.map((c) => (
              <option key={c} value={c.toLowerCase() === 'all' ? 'all' : c}>
                {c === 'All' ? 'All Gujarat Cities' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="w-full md:w-48">
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => onFilterChange({ sort: e.target.value, page: 1 })}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Expandable AI Search Panel */}
      {showAiSearch && (
        <form
          onSubmit={handleAiSearch}
          className="bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 border border-violet-200/90 rounded-2xl p-4 shadow-inner space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-violet-950 font-bold text-xs">
              <FaRobot className="text-violet-600 text-sm" />
              <span>Meta LLaMA 3.3 70B Natural Language Scrap Search</span>
              <span className="text-[10px] bg-violet-200 text-violet-900 font-extrabold px-1.5 py-0.2 rounded uppercase">
                AI Powered
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAiSearch(false)}
              className="text-violet-500 hover:text-violet-800 text-xs cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Find me clean copper wire in Vadodara under 450 rs, or baled boxes in Surat"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-white border border-violet-200 rounded-xl text-xs text-gray-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={parsing}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              <FaRobot />
              {parsing ? 'Parsing with LLaMA...' : 'Filter Marketplace'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] text-violet-700">
            <span className="font-semibold text-violet-900">Try prompts:</span>
            <button
              type="button"
              onClick={() => setAiPrompt('Clean copper offcuts in Vadodara under ₹500')}
              className="underline hover:text-violet-950 cursor-pointer"
            >
              "Clean copper in Vadodara under ₹500"
            </button>
            •
            <button
              type="button"
              onClick={() => setAiPrompt('Rigid HDPE drums in Ahmedabad')}
              className="underline hover:text-violet-950 cursor-pointer"
            >
              "Rigid HDPE drums in Ahmedabad"
            </button>
            •
            <button
              type="button"
              onClick={() => setAiPrompt('E-waste PCBs and batteries in Surat')}
              className="underline hover:text-violet-950 cursor-pointer"
            >
              "E-waste PCBs in Surat"
            </button>
          </div>
        </form>
      )}

      {/* Active AI Summary Chip */}
      {aiSummary && (
        <div className="bg-violet-100/80 border border-violet-300 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-violet-900">
          <div className="flex items-center gap-2">
            <FaRobot className="text-violet-700 shrink-0 text-sm" />
            <span>
              <b className="text-violet-950">AI Filter Applied:</b> {aiSummary.summary}
              {aiSummary.maxPrice && (
                <span className="ml-1.5 font-bold text-violet-800 bg-violet-200/60 px-1.5 py-0.5 rounded">
                  Max: ₹{aiSummary.maxPrice}
                </span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearAi}
            className="text-xs text-violet-700 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <FaTimes /> Clear AI Filter
          </button>
        </div>
      )}

      {/* Category Pills & Reset Button */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
          <FaFilter className="text-[10px]" /> Category:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = (filters.category || 'all') === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.id, page: 1 })}
              className={`text-xs px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-btn-primary text-white shadow-md shadow-teal-500/25 ring-2 ring-teal-400/40'
                  : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              {cat.label}
            </button>
          );
        })}

        {/* Reset Filters Button */}
        <button
          onClick={onReset}
          className="ml-auto text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-red-50 transition-all duration-200 cursor-pointer shrink-0 font-medium"
          title="Reset all filters"
        >
          <FaRedo className="text-[10px]" /> Reset
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
