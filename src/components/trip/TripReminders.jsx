import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Check, Clock } from "lucide-react";
import { toast } from "sonner";

import {
  fetchReminders,
  createReminder,
  toggleReminder,
  deleteReminder
} from "@/api/reminderApi";

const TripReminders = ({ tripId }) => {
  const [reminders, setReminders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: ""
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchReminders(tripId);
      setReminders(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) load();
  }, [tripId]);

  const addReminder = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time) {
      toast.error("Please select date and time");
      return;
    }

    const due_date = `${form.date}T${form.time}:00`;

    try {
      const res = await createReminder({
        tripId,
        title: form.title,
        description: form.description,
        due_date
      });

      await load();
      setForm({ title: "", description: "", date: "", time: "" });
      setShowAdd(false);
      toast.success("Reminder set!");
    } catch {
      toast.error("Failed to create reminder");
    }
  };

  const toggle = async (id, completed) => {
    try {
      await toggleReminder(id, !completed);
      // Optimistic update
      setReminders(prev => prev.map(r => 
        r.id === id ? { ...r, completed: !completed } : r
      ));
    } catch {
      toast.error("Cloud Error");
      load();
    }
  };

  const remove = async (id) => {
    try {
      await deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success("Reminder deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const pending = reminders.filter((r) => !r.completed);
  const done = reminders.filter((r) => r.completed);

  const formatDate = (d) => {
    const date = new Date(d);
    return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })}`;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Trip Reminders</h2>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium">Smart alerts for a stress-free journey</p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="btn-saas-primary"
        >
          <Bell className="h-4 w-4" /> New Alert
        </button>
      </div>

      {reminders.length === 0 && !loading ? (
        <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-[2.5rem] animate-pulse-subtle">
          <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Bell className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-muted-foreground font-medium">No active alerts for this trip</p>
          <button 
            onClick={() => setShowAdd(true)}
            className="text-primary font-bold mt-2 hover:underline"
          >
            Schedule a reminder
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary ml-1.5 flex items-center gap-2">
                <Clock className="h-3 w-3" /> Upcoming
              </h3>
              <div className="grid gap-3">
                {pending.map((r) => (
                  <div key={r.id} className="glass-card p-4 sm:p-5 rounded-2xl flex items-center gap-4 sm:gap-5 group hover:shadow-lg transition-all duration-300">
                    <button
                      onClick={() => toggle(r.id, r.completed)}
                      className="flex-shrink-0"
                    >
                      <div className="h-6 w-6 sm:h-7 sm:w-7 border-2 border-primary/30 rounded-lg sm:rounded-xl flex items-center justify-center text-primary group-hover:border-primary transition-all">
                        {r.completed && <Check className="h-3 w-3 sm:h-4 sm:w-4 bg-primary rounded-md text-white" />}
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-base sm:text-lg truncate leading-tight">{r.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">
                        <Clock size={12} className="text-primary/60" />
                        {formatDate(r.due_date)}
                      </div>
                      {r.description && <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-1 border-l-2 border-muted pl-3">{r.description}</p>}
                    </div>
                    <button 
                      onClick={() => remove(r.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1.5 flex items-center gap-2">
                <Check className="h-3 w-3" /> Completed
              </h3>
              <div className="grid gap-3">
                {done.map((r) => (
                  <div key={r.id} className="bg-muted/30 border border-border/50 p-4 sm:p-5 rounded-2xl flex items-center gap-4 sm:gap-5 opacity-60 grayscale-[0.5]">
                    <button onClick={() => toggle(r.id, r.completed)} className="flex-shrink-0">
                      <div className="h-6 w-6 sm:h-7 sm:w-7 bg-success/20 border-2 border-success/30 rounded-lg sm:rounded-xl flex items-center justify-center text-success">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 stroke-[3px]" />
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-base sm:text-lg truncate line-through decoration-muted-foreground/50">{r.title}</h4>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{formatDate(r.due_date)}</span>
                    </div>
                    <button onClick={() => remove(r.id)} className="p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-foreground/10 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-[2.5rem] p-6 sm:p-10 max-w-md w-full shadow-2xl border border-white/20 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">New Reminder</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">Stay on schedule with smart trip notifications.</p>
            </div>
            
            <form onSubmit={addReminder} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Event Name</label>
                <input
                  autoFocus
                  placeholder="e.g. Flight LH451 Boarding"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="input-saas"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Description (Optional)</label>
                <textarea
                  placeholder="Gate numbers, terminal info..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-saas min-h-[80px] py-3"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="input-saas"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                    className="input-saas"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-saas-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-saas-primary flex-1">
                  Set Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripReminders;