import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  Activity,
  Zap
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const CATEGORY_ICONS = {
  Food: '🍔',
  Travel: '✈️',
  Bills: '📄',
  Shopping: '🛍️',
  Health: '💊',
  Others: '📦',
};

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Dashboard() {
  const { dark } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, insRes] = await Promise.all([
        api.get('/expenses/'),
        api.get('/insights/'),
      ]);
      setExpenses(expRes.data);
      setInsights(insRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full glow-effect"
        />
      </div>
    );
  }

  const totalExpenses = insights?.total_spent || 0;
  const monthlyChange = insights?.monthly_change;
  const topCategory = insights?.top_category;
  const categoryBreakdown = insights?.category_breakdown || [];
  const monthlyTrends = insights?.monthly_trends || [];
  const recentExpenses = expenses.slice(0, 8);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthTotal = monthlyTrends.find((m) => m.month === currentMonthKey)?.amount || 0;

  const summaryCards = [
    {
      title: 'Total Expenses',
      value: `₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: dark ? 'from-indigo-500/20 to-purple-500/20' : 'from-indigo-50 to-purple-50',
      iconColor: 'text-indigo-500',
    },
    {
      title: 'This Month',
      value: `₹${currentMonthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: Calendar,
      gradient: dark ? 'from-emerald-500/20 to-teal-500/20' : 'from-emerald-50 to-teal-50',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Monthly Change',
      value: monthlyChange != null ? `${monthlyChange > 0 ? '+' : ''}${monthlyChange}%` : 'N/A',
      icon: monthlyChange != null && monthlyChange >= 0 ? TrendingUp : TrendingDown,
      gradient: dark 
        ? (monthlyChange != null && monthlyChange > 0 ? 'from-rose-500/20 to-red-500/20' : 'from-emerald-500/20 to-teal-500/20')
        : (monthlyChange != null && monthlyChange > 0 ? 'from-rose-50 to-red-50' : 'from-emerald-50 to-teal-50'),
      iconColor: monthlyChange != null && monthlyChange > 0 ? 'text-rose-500' : 'text-emerald-500',
    },
    {
      title: 'Top Category',
      value: topCategory || 'N/A',
      icon: Activity,
      gradient: dark ? 'from-amber-500/20 to-orange-500/20' : 'from-amber-50 to-orange-50',
      iconColor: 'text-amber-500',
    },
  ];

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className={`px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)] border backdrop-blur-md text-sm ${
        dark ? 'bg-slate-900/90 border-slate-700 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'
      }`}>
        <p className="font-semibold">{label}</p>
        <p className="text-primary-500 font-bold glow-effect">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    );
  };

  return (
    <div className="relative max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-10 overflow-hidden">
      {/* Ambient glowing backgrounds - Managed behind layout */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="bg-ambient top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30"></div>
        <div className="bg-ambient top-[30%] right-[-10%] w-[400px] h-[400px] bg-emerald-600/20 delay-1000"></div>
        <div className="bg-ambient bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-600/20 delay-2000"></div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4 relative z-10 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-glow flex items-center gap-3">
            Dashboard
            <Zap className="w-6 h-6 text-indigo-500 animate-pulse-glow rounded-full" />
          </h1>
          <p className={`text-base mt-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Intelligent overview of your financial flow.
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10"
      >
        {summaryCards.map((card) => (
          <motion.div key={card.title} variants={itemVariants} className="glow-effect group">
            <div className={`h-full glass-card p-6 flex flex-col justify-between overflow-hidden relative backdrop-blur-xl ${dark ? 'bg-slate-900/60' : 'bg-white/80'}`}>
              <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${card.gradient} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <p className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {card.title}
                </p>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-extrabold relative z-10 tracking-tight">
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10"
      >
        {/* Spending Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glow-effect">
          <div className={`h-full glass-card p-6 backdrop-blur-xl ${dark ? 'bg-slate-900/60' : 'bg-white/80'}`}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-indigo-500" /> Spending Trend
            </h3>
            {monthlyTrends.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#33415550' : '#e2e8f050'} vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val/1000}k`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fill="url(#colorAmount)"
                      activeDot={{ r: 8, strokeWidth: 2, fill: '#6366f1', stroke: '#fff', style: { filter: 'drop-shadow(0px 0px 8px rgba(99,102,241,0.8))' } }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
                No data yet. Start adding expenses!
              </div>
            )}
          </div>
        </motion.div>

        {/* Category Breakdown Pie */}
        <motion.div variants={itemVariants} className="glow-effect">
          <div className={`h-full glass-card p-6 backdrop-blur-xl ${dark ? 'bg-slate-900/60' : 'bg-white/80'}`}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <PieChart className="text-emerald-500 w-5 h-5" /> Categories
            </h3>
            {categoryBreakdown.length > 0 ? (
              <div className="flex flex-col h-full justify-between">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="category"
                        stroke="none"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={entry.category} fill={COLORS[index % COLORS.length]} style={{ filter: `drop-shadow(0px 0px 4px ${COLORS[index % COLORS.length]}80)` }} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: dark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        }}
                        itemStyle={{ color: dark ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  {categoryBreakdown.slice(0, 4).map((cat, i) => (
                    <div key={cat.category} className="flex items-center justify-between text-sm group">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shadow-lg group-hover:scale-125 transition-transform"
                          style={{ backgroundColor: COLORS[i % COLORS.length], boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}80` }}
                        />
                        <span className="font-medium">{cat.category}</span>
                      </div>
                      <span className="font-bold">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">
                No data yet
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glow-effect relative z-10"
      >
        <div className={`glass-card p-6 backdrop-blur-xl ${dark ? 'bg-slate-900/60' : 'bg-white/80'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="text-purple-500 w-5 h-5" /> Recent Transactions
            </h3>
          </div>
          
          {recentExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${dark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <th className="text-left py-3 px-2 font-semibold text-xs uppercase tracking-wider opacity-60">Description</th>
                    <th className="text-left py-3 px-2 font-semibold text-xs uppercase tracking-wider opacity-60">Category</th>
                    <th className="text-left py-3 px-2 font-semibold text-xs uppercase tracking-wider opacity-60">Date</th>
                    <th className="text-right py-3 px-2 font-semibold text-xs uppercase tracking-wider opacity-60">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                  {recentExpenses.map((exp, i) => (
                    <motion.tr
                      key={exp.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className={`group transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${dark ? '' : ''}`}
                    >
                      <td className="py-4 px-2 font-medium">{exp.description || '—'}</td>
                      <td className="py-4 px-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 group-hover:scale-105 ${
                            dark ? 'bg-slate-800 text-slate-200 shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'bg-slate-100 text-slate-700 shadow-sm'
                          }`}
                        >
                          {CATEGORY_ICONS[exp.category] || '📦'} {exp.category}
                        </span>
                      </td>
                      <td className={`py-4 px-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(exp.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-2 text-right font-extrabold text-primary-500 min-w-[100px]">
                        ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`text-center py-12 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30 animate-bounce" />
              <p>No expenses yet. Add your first expense to see your dashboard!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
