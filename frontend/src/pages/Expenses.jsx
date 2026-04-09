import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Others'];
const CATEGORY_COLORS = {
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  Travel: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  Bills: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  Shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
  Health: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  Others: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
};
const CATEGORY_ICONS = {
  Food: '🍔', Travel: '✈️', Bills: '📄', Shopping: '🛍️', Health: '💊', Others: '📦',
};

export default function Expenses() {
  const { dark } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [filterCategory, filterStartDate, filterEndDate]);

  const fetchExpenses = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStartDate) params.start_date = filterStartDate;
      if (filterEndDate) params.end_date = filterEndDate;
      const res = await api.get('/expenses/', { params });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setEditId(null);
    setFormError('');
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (exp) => {
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setDate(exp.date);
    setDescription(exp.description || '');
    setEditId(exp.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        category,
        date,
        description: description || null,
      };
      if (editId) {
        await api.put(`/expenses/${editId}`, payload);
      } else {
        await api.post('/expenses/', payload);
      }
      setShowModal(false);
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setFormError(err.response.data.detail.map((e) => e.msg).join(', '));
        } else {
          setFormError(err.response.data.detail);
        }
      } else {
        setFormError('Failed to save. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const totalFiltered = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Expenses</h1>
          <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage and track your spending
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 opacity-50" />
          <span className="text-sm font-semibold">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="input"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="input"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Showing <span className="font-bold text-primary-500">{expenses.length}</span> expenses
        </p>
        <p className="text-sm font-bold">
          Total: <span className="text-primary-500">₹{totalFiltered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </p>
      </div>

      {/* Expenses List */}
      {expenses.length > 0 ? (
        <div className="space-y-3">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="glass-card p-4 flex items-center justify-between gap-4 animate-fade-in-up"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Others
                }`}>
                  {CATEGORY_ICONS[exp.category] || '📦'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{exp.description || exp.category}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
                      {new Date(exp.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Others
                    }`}>
                      {exp.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <p className="font-bold text-lg text-primary-500">
                  ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(exp)}
                    className={`p-2 rounded-lg transition-colors ${
                      dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`glass-card p-12 text-center ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No expenses found</p>
          <p className="text-sm mt-1">Try adjusting your filters or add a new expense</p>
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-up ${
            dark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold">{editId ? 'Edit Expense' : 'Add Expense'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-60">Amount</label>
                <div className="relative">
                  <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-slate-400'}`} />
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input pl-11"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-60">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        category === c
                          ? dark
                            ? 'bg-slate-100 text-slate-900 border-slate-200 shadow-sm'
                            : 'bg-slate-900 text-white border-slate-800 shadow-sm'
                          : dark
                            ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                            : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {CATEGORY_ICONS[c]} {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-60">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-60">Description</label>
                <div className="relative">
                  <FileText className={`absolute left-4 top-3 w-4 h-4 ${dark ? 'text-slate-400' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input pl-11"
                    placeholder="What was this expense for?"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editId ? (
                    'Update'
                  ) : (
                    'Add Expense'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
