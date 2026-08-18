const Appointment = require("../models/Appointment.model");
const { sendAppointmentEmails } = require("./email.service");
const { notifyAppointment } = require("./notification.service");

const createAppointment = async (payload, userId) => {
  const appointment = await Appointment.create({
    ...payload,
    user: userId || undefined,
    preferredDate: new Date(payload.preferredDate),
  });

  const plain = appointment.toObject ? appointment.toObject() : appointment;
  sendAppointmentEmails(plain).catch(() => undefined);
  notifyAppointment(plain).catch(() => undefined);

  return appointment;
};

const getUserAppointments = async (userId) => {
  return Appointment.find({ user: userId }).sort({ preferredDate: -1 }).lean();
};

module.exports = {
  createAppointment,
  getUserAppointments,
};
