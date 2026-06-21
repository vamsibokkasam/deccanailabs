import Contact from "../models/Contact.js";

export const createContact = async (req, res, next) => {
  try {
    const { firstName, lastName, email, whatsapp, internship, message } = req.body;

    const contact = await Contact.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp.trim().replace(/\s/g, ""),
      internship: internship.trim(),
      message: message?.trim() || "",
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    next(error);
  }
};
