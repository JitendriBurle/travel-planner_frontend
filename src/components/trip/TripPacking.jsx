import { useState, useEffect } from "react";
import { Plus, Check, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  fetchPackingLists,
  fetchPackingItems,
  createPackingList,
  addPackingItems,
  togglePackingItem,
  addCustomItem,
  deletePackingList,
  deletePackingItem,
} from "@/api/packingApi";

const defaultItems = {
  Essentials: ["Passport", "Physical ID", "Wallet", "Cash", "House Keys", "Travel Insurance"],
  Documents: ["Booking Confirmations", "Boarding Pass", "Visa", "Vaccination Record"],
  Clothing: ["T-shirts", "Pants", "Underwear", "Socks", "Walking Shoes", "Sleepwear"],
  Toiletries: ["Toothbrush & Paste", "Shampoo/Soap", "Deodorant", "Sunscreen", "Nail Clipper", "Tissues"],
  Electronics: ["Phone & Charger", "Power Bank", "Universal Adapter", "Laptop/Tablet", "Headphones"],
  Health: ["First Aid Kit", "Prescriptions", "Pain Relievers", "Hand Sanitizer", "Masks"],
};

const templates = [
  { name: "🏝️ Beach", items: ["Swimwear", "Flip-flops", "Beach Towel", "Sunglasses", "Snorkel Gear", "Wide-brim Hat", "Aloe Vera"] },
  { name: "🏔️ Mountain", items: ["Hiking Boots", "Waterproof Jacket", "Thermal Layers", "Backpack", "Water bottle", "Gloves", "Hiking Poles"] },
  { name: "🏛️ City", items: ["Comfortable City Shoes", "Smart Casual Outfit", "Portable Umbrella", "Daypack", "Power Adapter"] },
  { name: "💼 Business", items: ["Suit/Formal Wear", "Ironed Shirts", "Laptop & Docs", "Business Cards", "Tie/Accessories"] },
  { name: "❄️ Winter", items: ["Heavy Coat", "Scarf & Beanie", "Thermal Socks", "Lip Balm", "Moisturizer", "Boots"] },
  { name: "🏕️ Camping", items: ["Tent", "Sleeping Bag", "Flashlight", "Lighter/Matches", "Insect Repellent", "Cooking Gear"] },
];

const TripPacking = ({ tripId }) => {
  const [lists, setLists] = useState([]);
  const [items, setItems] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    template: "",
  });
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);

  const loadLists = async () => {
    setLoading(true);
    try {
      const res = await fetchPackingLists(tripId);
      setLists(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (listId) => {
    const res = await fetchPackingItems(listId);
    setItems((prev) => ({
      ...prev,
      [listId]: res.data || [],
    }));
  };

  useEffect(() => {
    if (tripId) loadLists();
  }, [tripId]);

  useEffect(() => {
    if (selectedListId) loadItems(selectedListId);
  }, [selectedListId]);

  const createList = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      const res = await createPackingList({
        tripId,
        name: form.name,
      });

      const list = res.data;
      const itemsToInsert = [];

      // Add all default categories
      Object.keys(defaultItems).forEach(category => {
        defaultItems[category].forEach(name => {
          itemsToInsert.push({ list_id: list.id, name, category, packed: false });
        });
      });

      // Add Template items
      const selectedTemplate = templates.find(t => t.name === form.template);
      if (selectedTemplate) {
        selectedTemplate.items.forEach(name => {
          itemsToInsert.push({ list_id: list.id, name, category: "Activity", packed: false });
        });
      }

      if (itemsToInsert.length > 0) {
        await addPackingItems(itemsToInsert);
      }

      await loadLists();
      setShowCreate(false);
      setForm({ name: "", template: "" });
      toast.success("Packing list created with template");
    } catch (err) {
      toast.error("Failed to create list");
    }
  };

  const deleteList = async (listId) => {
    try {
      await deletePackingList(listId);
      setLists(lists.filter(l => l.id !== listId));
      if (selectedListId === listId) setSelectedListId(null);
      toast.success("List deleted");
    } catch {
      toast.error("Failed to delete list");
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await deletePackingItem(itemId);
      setItems(prev => ({
        ...prev,
        [selectedListId]: prev[selectedListId].filter(item => item.id !== itemId)
      }));
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const toggleItem = async (itemId, packed) => {
    try {
      await togglePackingItem(itemId, !packed);
      // Optimistic update
      setItems(prev => ({
        ...prev,
        [selectedListId]: prev[selectedListId].map(item => 
          item.id === itemId ? { ...item, packed: !packed } : item
        )
      }));
    } catch {
      toast.error("Update failed");
      loadItems(selectedListId);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    try {
      await addCustomItem({
        listId: selectedListId,
        name: newItem,
      });
      setNewItem("");
      await loadItems(selectedListId);
      toast.success("Item added");
    } catch {
      toast.error("Failed to add item");
    }
  };

  const selectedList = lists.find((l) => l.id === selectedListId);
  const selectedItems = items[selectedListId] || [];

  if (selectedList) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedListId(null)}
            className="p-3 bg-white border border-border rounded-2xl hover:bg-muted transition-all active:scale-95 shadow-sm"
          >
            <Plus className="h-5 w-5 rotate-45" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground truncate max-w-[150px] sm:max-w-none">{selectedList.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 sm:w-32 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-primary transition-all duration-500" 
                  style={{ width: `${(selectedItems.filter(i => i.packed).length / Math.max(1, selectedItems.length)) * 100}%` }}
                />
              </div>
              <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {selectedItems.filter(i => i.packed).length}/{selectedItems.length} Packed
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => {
               e.stopPropagation();
               deleteList(selectedListId);
            }}
            className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl ml-auto transition-all"
            title="Delete List"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add something to pack..."
            className="input-saas py-3.5"
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <button 
            onClick={addItem}
            className="btn-saas-primary py-3.5 sm:px-8"
          >
            Add
          </button>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-sm divide-y divide-border/50 overflow-hidden">
          {selectedItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Plus className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium">Your list is empty. Add items above!</p>
            </div>
          ) : (
            selectedItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-white/40 transition-all group"
              >
                <div 
                  onClick={() => toggleItem(item.id, item.packed)}
                  className={`h-7 w-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  item.packed ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "border-muted-foreground/20 hover:border-primary/50"
                }`}>
                  {item.packed && <Check className="h-4 w-4 stroke-[3px]" />}
                </div>
                <div 
                  onClick={() => toggleItem(item.id, item.packed)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <span className={`text-sm sm:text-base truncate block transition-all duration-300 ${item.packed ? "text-muted-foreground line-through opacity-60" : "text-foreground font-semibold"}`}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest transition-colors ${
                    item.category === 'Essentials' ? 'bg-amber-100 text-amber-700' :
                    item.category === 'Electronics' ? 'bg-blue-100 text-blue-700' :
                    item.category === 'Clothing' ? 'bg-purple-100 text-purple-700' :
                    item.category === 'Toiletries' ? 'bg-emerald-100 text-emerald-700' :
                    item.category === 'Documents' ? 'bg-indigo-100 text-indigo-700' :
                    item.category === 'Health' ? 'bg-red-100 text-red-700' :
                    item.category === 'Activity' ? 'bg-rose-100 text-rose-700' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {item.category}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="p-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Packing Lists</h2>
          <p className="text-muted-foreground text-sm font-medium">Be prepared for your trip</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-saas-primary"
        >
          <Plus className="h-4 w-4" /> New List
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-[2.5rem] animate-pulse-subtle">
          <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Package className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-muted-foreground font-medium">No packing lists organized yet</p>
          <button 
            onClick={() => setShowCreate(true)}
            className="text-primary font-bold mt-2 hover:underline"
          >
            Create your first checklist
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {lists.map((list) => (
            <div 
              key={list.id} 
              onClick={() => setSelectedListId(list.id)}
              className="glass-card p-6 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
            >
              <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Package className="h-20 w-20" />
              </div>
              <div className="relative flex justify-between items-start">
                <div>
                  <h3 className="font-display font-bold text-xl mb-1 text-foreground">{list.name}</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2 px-2 py-1 bg-muted rounded-lg inline-block group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    Check Gear
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteList(list.id);
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div 
          className="fixed inset-0 bg-foreground/10 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreate(false)}
        >
          <div 
            className="bg-card rounded-[2.5rem] p-6 sm:p-10 max-w-md w-full shadow-2xl border border-white/20 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2 text-foreground">Add Gear</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">Select a template for your trip to get started.</p>
            </div>
            
            <form onSubmit={createList} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                  List Name
                </label>
                <input
                  autoFocus
                  placeholder="e.g. My Next Trip"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-saas mb-6"
                  required
                />

                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
                  Trip Template
                </label>
                <div className="grid grid-cols-2 gap-3">
                   {templates.map(t => (
                     <button
                       key={t.name}
                       type="button"
                       onClick={() => setForm({ ...form, template: t.name })}
                       className={`p-4 rounded-2xl border text-sm font-bold transition-all ${
                         form.template === t.name 
                           ? "bg-primary/10 border-primary text-primary" 
                           : "border-border hover:border-primary/50 text-muted-foreground"
                       }`}
                     >
                       {t.name}
                     </button>
                   ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-saas-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-saas-primary flex-1"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPacking;