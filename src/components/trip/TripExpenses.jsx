import { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

import {
  fetchExpenses,
  createExpense,
  removeExpense,
  updateExpense
} from "@/api/expenseApi";

const categories = [
  "✈️ Flights",
  "🏨 Accommodation",
  "🍽️ Dining",
  "🎯 Activities",
  "🚗 Transport",
  "🛍️ Shopping",
  "📱 Other"
];

  const TripExpenses = ({ tripId, trip }) => {
  const budget = trip?.budget || 0;

  const [expenses, setExpenses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: categories[0]
  });

  const load = async () => {
    try {
      const res = await fetchExpenses(tripId);
      setExpenses(res.data || []);
    } catch {
      toast.error("Failed to load expenses");
    }
  };

  useEffect(() => {
    if (tripId) load();
  }, [tripId]);

  const addExpense = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        tripId,
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
        toast.success("Expense updated");
      } else {
        await createExpense(payload);
        toast.success("Expense added!");
      }

      await load();

      setForm({
        title: "",
        amount: "",
        category: categories[0]
      });

      setShowAdd(false);
      setEditingExpense(null);

    } catch (err) {
      toast.error(err.response?.data?.error || "Operation failed");
    }
  };

  const startEdit = (exp) => {
    setEditingExpense(exp);
    setForm({
      title: exp.title,
      amount: exp.amount.toString(),
      category: exp.category
    });
    setShowAdd(true);
  };

  const deleteExpense = async (id) => {
    try {
      await removeExpense(id);
      await load();
      toast.success("Expense deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const byCategory = categories
    .map((c) => ({
      category: c,
      total: expenses
        .filter((e) => e.category === c)
        .reduce((sum, e) => sum + Number(e.amount), 0)
    }))
    .filter((c) => c.total > 0);

  const percent = budget > 0 ? (total / budget) * 100 : 0;

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 group">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground mb-1">Expenses</h2>
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-primary" />
             <p className="text-muted-foreground text-xs sm:text-sm font-medium tracking-tight">
                Total Spent: 
                <span className="text-foreground font-black ml-1.5 text-base sm:text-lg">
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
             </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingExpense(null);
            setShowAdd(true);
          }}
          className="btn-saas-primary py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl shadow-xl self-start text-sm sm:text-base"
        >
          <Plus className="h-5 w-5" /> Add Expense
        </button>
      </div>

      {/* Budget Progress */}
      {budget > 0 && (
        <div className="glass-card p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-white/60 mb-10 shadow-travel relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 pointer-events-none">
              <DollarSign size={80} className="sm:size-[120px]" />
           </div>
           
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Trip Budget</p>
                <h4 className="text-3xl sm:text-4xl font-display font-black text-foreground">
                  ${budget.toLocaleString()}
                  <span className="text-xs text-muted-foreground ml-3 font-medium uppercase tracking-widest italic font-serif">total</span>
                </h4>
              </div>
              <div className="sm:text-right">
                <p className="text-4xl sm:text-5xl font-display font-black text-primary">{Math.round(percent)}%</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Spent</p>
              </div>
            </div>

           <div className="h-4 bg-muted/40 rounded-full overflow-hidden border border-white/40 shadow-inner">
             <div 
               className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-destructive' : 'gradient-primary'}`}
               style={{ width: `${Math.min(100, percent)}%` }}
             />
           </div>
           
           <div className="flex justify-between mt-4">
              <p className="text-xs font-bold text-muted-foreground">0.00</p>
              <p className={`text-xs font-bold ${percent > 90 ? 'text-destructive font-black' : 'text-primary'}`}>
                {percent > 90 ? '接近预算上限' : '系统正常'}
              </p>
              <p className="text-xs font-bold text-muted-foreground">{budget.toLocaleString()}</p>
           </div>
        </div>
      )}

      {/* Category Summary */}

      {byCategory.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {byCategory.map((c) => (
            <div
              key={c.category}
              className="glass-card px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-white/40 shadow-sm"
            >
              <span className="text-sm font-medium text-muted-foreground">{c.category}</span>
              <span className="font-bold text-foreground">
                ${c.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Expense List */}

      {expenses.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-[2rem] animate-pulse-subtle">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <DollarSign className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-muted-foreground font-medium">Record your first expense to track your budget</p>
          <button
            onClick={() => setShowAdd(true)}
            className="text-primary font-bold mt-2 hover:underline"
          >
            Get started
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 group hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-sm sm:text-base">
                  {exp.category.split(' ')[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate max-w-[150px] sm:max-w-[200px] text-sm sm:text-base">
                    {exp.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {exp.category.split(' ')[1] || exp.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
                <span className="font-display font-bold text-base sm:text-lg text-foreground">
                  ${Number(exp.amount).toFixed(2)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(exp)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                  >
                     <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense Modal */}

      {showAdd && (
        <div
          className="fixed inset-0 bg-foreground/10 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-card rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-white/20 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold mb-2">
                {editingExpense ? "Update Expense" : "Add Expense"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {editingExpense ? "Update the details of this expense." : "Log your spending to stay within your trip budget."}
              </p>
            </div>

            <form onSubmit={addExpense} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Title</label>
                <input
                  autoFocus
                  placeholder="e.g. Dinner at L'Avenue"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                  className="input-saas"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    required
                    className="input-saas"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="input-saas appearance-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="btn-saas-secondary flex-1"
                >
                  Cancel
                </button>

                  <button
                    type="submit"
                    className="btn-saas-primary flex-1"
                  >
                    {editingExpense ? "Update Expense" : "Save Expense"}
                  </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TripExpenses;