import { useState } from 'react';
import API from '../api/axios';
import { FaRobot, FaCalculator, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const PriceEstimator = ({ category, subCategory, quantity, unit, condition, onApplyPrice }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleEstimate = async () => {
    if (!category) {
      setError('Please select a material category first');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/ai/estimate-price', {
        category,
        subCategory,
        quantity: Number(quantity) || 100,
        unit: unit || 'kg',
        condition: condition || 'clean',
      });

      if (res.data?.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not calculate estimation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/80 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-teal-950 font-bold text-sm">
          <FaRobot className="text-teal-600 text-base" />
          <span>Smart Fair-Market Price Estimator</span>
          <span className="text-[10px] bg-teal-200 text-teal-900 font-extrabold px-1.5 py-0.5 rounded uppercase">
            AI Tool
          </span>
        </div>

        <button
          type="button"
          onClick={handleEstimate}
          disabled={loading}
          className="text-xs bg-btn-primary hover:opacity-95 text-white font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            'Calculating...'
          ) : (
            <>
              <FaCalculator /> Suggest Fair Price
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-600 flex items-center gap-1 mt-2">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {result && (
        <div className="mt-3 pt-3 border-t border-teal-200/60 bg-white/80 p-3.5 rounded-xl text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Estimated Benchmark Rate:</span>
            <span className="text-base font-extrabold text-teal-800">
              ₹{result.estimatedPrice.toLocaleString()} / {result.unit}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-500">
            <span>Fair Range (±8%):</span>
            <span className="font-semibold text-gray-700">
              ₹{result.low.toLocaleString()} – ₹{result.high.toLocaleString()} / {result.unit}
            </span>
          </div>

          {result.source === 'llama-3.3-70b' && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200">
              <FaRobot className="text-violet-600" />
              Valuation by Meta LLaMA 3.3 70B (OpenRouter)
            </div>
          )}

          <p className="text-[11px] text-gray-600 leading-relaxed italic bg-teal-50/70 p-2.5 rounded-lg border border-teal-100">
            {result.explanation}
          </p>

          {result.marketInsight && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold text-amber-950 block mb-0.5">💡 Gujarat Scrap Market Trend:</span>
              {result.marketInsight}
            </div>
          )}

          {onApplyPrice && (
            <button
              type="button"
              onClick={() => onApplyPrice(result.estimatedPrice)}
              className="w-full mt-2 bg-btn-primary hover:opacity-95 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <FaCheckCircle /> Apply Suggested Rate (₹{result.estimatedPrice})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceEstimator;
