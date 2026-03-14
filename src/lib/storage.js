// localStorage utilities for the Travel Itinerary Planner

const KEYS = {
  USER: 'travelplan_user',
  TRIPS: 'travelplan_trips',
  EXPENSES: 'travelplan_expenses',
  PACKING: 'travelplan_packing',
  DOCUMENTS: 'travelplan_documents',
  REMINDERS: 'travelplan_reminders',
  REVIEWS: 'travelplan_reviews',
};

export const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },

  getUser() { return this.get(KEYS.USER); },
  setUser(user) { this.set(KEYS.USER, user); },
  removeUser() { this.remove(KEYS.USER); },

  getTrips() { return this.get(KEYS.TRIPS) || []; },
  setTrips(trips) { this.set(KEYS.TRIPS, trips); },
  addTrip(trip) {
    const trips = this.getTrips();
    trips.push(trip);
    this.setTrips(trips);
  },
  updateTrip(id, data) {
    const trips = this.getTrips().map(t => t.id === id ? { ...t, ...data } : t);
    this.setTrips(trips);
  },
  deleteTrip(id) {
    this.setTrips(this.getTrips().filter(t => t.id !== id));
  },
  getTrip(id) {
    return this.getTrips().find(t => t.id === id) || null;
  },

  getExpenses() { return this.get(KEYS.EXPENSES) || []; },
  setExpenses(expenses) { this.set(KEYS.EXPENSES, expenses); },
  addExpense(expense) {
    const expenses = this.getExpenses();
    expenses.push(expense);
    this.setExpenses(expenses);
  },
  deleteExpense(id) {
    this.setExpenses(this.getExpenses().filter(e => e.id !== id));
  },

  getPackingLists() { return this.get(KEYS.PACKING) || []; },
  setPackingLists(lists) { this.set(KEYS.PACKING, lists); },
  addPackingList(list) {
    const lists = this.getPackingLists();
    lists.push(list);
    this.setPackingLists(lists);
  },
  updatePackingList(id, data) {
    const lists = this.getPackingLists().map(l => l.id === id ? { ...l, ...data } : l);
    this.setPackingLists(lists);
  },

  getDocuments() { return this.get(KEYS.DOCUMENTS) || []; },
  setDocuments(docs) { this.set(KEYS.DOCUMENTS, docs); },
  addDocument(doc) {
    const docs = this.getDocuments();
    docs.push(doc);
    this.setDocuments(docs);
  },
  deleteDocument(id) {
    this.setDocuments(this.getDocuments().filter(d => d.id !== id));
  },

  getReminders() { return this.get(KEYS.REMINDERS) || []; },
  setReminders(reminders) { this.set(KEYS.REMINDERS, reminders); },
  addReminder(reminder) {
    const reminders = this.getReminders();
    reminders.push(reminder);
    this.setReminders(reminders);
  },
  deleteReminder(id) {
    this.setReminders(this.getReminders().filter(r => r.id !== id));
  },
  toggleReminder(id) {
    const reminders = this.getReminders().map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    this.setReminders(reminders);
  },

  getReviews() { return this.get(KEYS.REVIEWS) || []; },
  setReviews(reviews) { this.set(KEYS.REVIEWS, reviews); },
  addReview(review) {
    const reviews = this.getReviews();
    reviews.push(review);
    this.setReviews(reviews);
  },
  deleteReview(id) {
    this.setReviews(this.getReviews().filter(r => r.id !== id));
  },
};

export const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
