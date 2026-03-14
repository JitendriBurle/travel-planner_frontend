import { useState, useEffect } from "react";
import { Star, Plus, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import {
  fetchReviews,
  createReview,
  deleteReview
} from "@/api/reviewApi";

const TripReviews = ({ tripId }) => {
  const [reviews, setReviews] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    place: "",
    rating: 5,
    title: "",
    content: ""
  });

  const load = async () => {
    const res = await fetchReviews(tripId);
    setReviews(res.data || []);
  };

  useEffect(() => {
    load();
  }, [tripId]);

  const addReview = async (e) => {
    e.preventDefault();

    const res = await createReview({
      tripId,
      place: form.place,
      rating: form.rating,
      title: form.title,
      content: form.content
    });

    if (!res.data) {
      toast.error("Failed to post review");
      return;
    }

    await load();

    setForm({
      place: "",
      rating: 5,
      title: "",
      content: ""
    });

    setShowAdd(false);

    toast.success("Review posted!");
  };

  const removeReview = async (id) => {
    await deleteReview(id);
    await load();
    toast.success("Review deleted");
  };

  const StarRating = ({ rating, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
        >
          <Star
            className={`h-4 w-4 ${
              i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Post-Trip Reviews</h2>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium">Document your thoughts and recommendations</p>
        </div>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="btn-saas-primary py-3 sm:py-4 px-4 sm:px-8 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4" /> Share Experience
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-[2.5rem] animate-pulse-subtle">
          <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <MessageSquare className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-muted-foreground font-medium">No reviews shared for this trip yet</p>
          <button 
            onClick={() => setShowAdd(true)}
            className="text-primary font-bold mt-2 hover:underline"
          >
            Be the first to review
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="glass-card p-5 sm:p-6 rounded-3xl group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <MessageSquare className="h-24 w-24" />
              </div>

              <div className="flex justify-between items-start relative">
                <div className="space-y-3">
                  <StarRating rating={review.rating} />
                  <div>
                    <h4 className="text-lg sm:text-xl font-display font-bold text-foreground leading-tight">{review.title}</h4>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-primary mt-1.5 flex items-center gap-1.5">
                      <Star size={10} /> {review.place} · {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => removeReview(review.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {review.content && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-muted-foreground leading-relaxed italic">"{review.content}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div 
          className="fixed inset-0 bg-foreground/10 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowAdd(false)}
        >
          <div 
            className="bg-card rounded-[2.5rem] p-6 sm:p-10 max-w-lg w-full shadow-2xl border border-white/20 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Share Review</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">How was the experience? Your feedback helps the community.</p>
            </div>
            
            <form onSubmit={addReview} className="space-y-5">
              <div className="flex justify-center py-4 bg-muted/30 rounded-2xl mb-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Your Rating</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setForm({ ...form, rating: i })}
                        className="p-2 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 sm:h-8 sm:w-8 transition-colors ${
                            i <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Place / Venue</label>
                  <input
                    placeholder="e.g. Eiffel Tower"
                    value={form.place}
                    onChange={(e) => setForm({ ...form, place: e.target.value })}
                    required
                    className="input-saas"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Review Title</label>
                  <input
                    placeholder="e.g. Magical Morning"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="input-saas"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Your Story</label>
                <textarea
                  placeholder="Tell us more about your visit..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={3}
                  className="input-saas py-4 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="btn-saas-secondary flex-1"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="btn-saas-primary flex-1"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripReviews;