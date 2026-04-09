import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';
import {
  FileBarChart,
  Download,
  Filter,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Others'];

export default function Reports() {
  const { dark } = useTheme();
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    setSuccess(false);
    try {
      const params = {};
      if (category) params.category = category;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.get('/expenses/export', {
        params,
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/30">
          <FileBarChart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
          <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Export your expense data as CSV
          </p>
        </div>
      </div>

      {/* Export Card */}
      <div className="glass-card p-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <FileSpreadsheet className="w-6 h-6 text-primary-500" />
          <h3 className="text-lg font-bold">Export Expenses</h3>
        </div>

        <p className={`text-sm mb-6 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Select filters below to customize your export. Leave blank to export all expenses.
        </p>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-60">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-60">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-60">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={downloading}
          className="btn-primary w-full py-4 text-base"
        >
          {downloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exporting...
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Downloaded Successfully!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export as CSV
            </>
          )}
        </button>
      </div>

      {/* How it works */}
      <div className="glass-card p-6 animate-fade-in-up">
        <h3 className="text-lg font-bold mb-4">What's included in the export?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Expense ID', desc: 'Unique identifier for each expense' },
            { label: 'Amount', desc: 'The expense amount in INR' },
            { label: 'Category', desc: 'Expense category (Food, Travel, etc.)' },
            { label: 'Date', desc: 'Date of the expense' },
            { label: 'Description', desc: 'Notes about the expense' },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-start gap-3 p-3 rounded-xl ${
                dark ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
