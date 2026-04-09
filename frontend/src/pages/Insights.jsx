import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis,
} from 'recharts';

export default function Insights() {
  const { dark } = useTheme();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/insights/')
      .then((res) => setInsights(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!insights || insights.total_spent === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Insights</h1>
        <div className={`glass-card p-12 text-center mt-6 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
          <Brain className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-semibold mb-2">No data to analyze yet</p>
          <p className="text-sm">Start adding expenses to see AI-powered insights about your spending patterns.</p>
        </div>
      </div>
    );
  }

  const {
    total_spent,
    top_category,
    category_breakdown,
    monthly_trends,
    monthly_change,
    unusual_spending,
    suggestions,
    predicted_next_month,
  } = insights;

  // Radar data from category breakdown
  const radarData = category_breakdown.map((c) => ({
    subject: c.category,
    value: c.percentage,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
          <Brain className="w-6 h-6 text-primary-500" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">AI Insights</h1>
          <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Smart analysis of your spending patterns
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        {/* Total Spent */}
        <div className="glass-card p-5 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <Target className="w-5 h-5 text-primary-500" />
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
              Total Spent
            </span>
          </div>
          <p className="text-2xl font-bold">₹{total_spent.toLocaleString('en-IN')}</p>
        </div>

        {/* Monthly Change */}
        <div className="glass-card p-5 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              {monthly_change !== null && monthly_change > 0
                ? <ArrowUp className="w-5 h-5 text-red-500" />
                : <ArrowDown className="w-5 h-5 text-accent-500" />
              }
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
              Monthly Change
            </span>
          </div>
          <p className={`text-2xl font-bold ${
            monthly_change !== null && monthly_change > 0 ? 'text-red-500' : 'text-emerald-500'
          }`}>
            {monthly_change !== null ? `${monthly_change > 0 ? '+' : ''}${monthly_change}%` : 'N/A'}
          </p>
        </div>

        {/* Predicted Next Month */}
        <div className="glass-card p-5 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
              Predicted Next Month
            </span>
          </div>
          <p className="text-2xl font-bold">₹{predicted_next_month.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown Bar Chart */}
        <div className="glass-card p-6 animate-fade-in-up">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            Monthly Spending
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#e2e8f0'} />
              <XAxis
                dataKey="month"
                tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                axisLine={{ stroke: dark ? '#334155' : '#e2e8f0' }}
              />
              <YAxis
                tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                axisLine={{ stroke: dark ? '#334155' : '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: dark ? '#1e293b' : '#fff',
                  border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
              />
              <Bar
                dataKey="amount"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Radar Chart */}
        <div className="glass-card p-6 animate-fade-in-up">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={dark ? '#334155' : '#e2e8f0'} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 12 }}
              />
              <Radar
                name="Spending"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Unusual Spending Alerts */}
      {unusual_spending.length > 0 && (
        <div className="glass-card p-6 animate-fade-in-up">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Unusual Spending Detected
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unusual_spending.map((item) => (
              <div
                key={item.category}
                className={`p-4 rounded-xl border ${
                  dark
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{item.category}</span>
                  <span className="text-red-500 font-bold text-sm">
                    +{item.increase_pct}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={dark ? 'text-slate-400' : 'text-slate-500'}>
                    Current: ₹{item.current.toLocaleString('en-IN')}
                  </span>
                  <span className={dark ? 'text-slate-400' : 'text-slate-500'}>
                    Avg: ₹{item.average.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      <div className="glass-card p-6 animate-fade-in-up">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          Smart Suggestions
        </h3>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-l-4 border-primary-500 ${
                dark ? 'bg-slate-700/50' : 'bg-primary-50/50'
              }`}
            >
              <p className="text-sm leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="glass-card p-6 animate-fade-in-up">
        <h3 className="text-lg font-bold mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {category_breakdown.map((cat) => (
            <div key={cat.category} className="flex items-center gap-4">
              <span className="w-20 text-sm font-medium">{cat.category}</span>
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-500"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
              <span className="w-16 text-right text-sm font-bold">
                {cat.percentage}%
              </span>
              <span className={`w-24 text-right text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                ₹{cat.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
