import API from "./api";

/* GET REMINDERS */

export const fetchReminders = (tripId) => {
  return API.get(`/reminders/${tripId}`);
};


/* CREATE REMINDER */

export const createReminder = (data) => {
  return API.post("/reminders", data);
};


/* DELETE REMINDER */

export const deleteReminder = (id) => {
  return API.delete(`/reminders/${id}`);
};


/* TOGGLE REMINDER (complete/incomplete) */

export const toggleReminder = (id, completed) => {
  return API.patch(`/reminders/${id}`, {
    completed
  });
};