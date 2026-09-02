import prisma from "../config/prisma.js";
import { serializeContact } from "../utils/serialize.js";

export const createContact = async (req, res, next) => {
  try {
    const { firstName, lastName, email, whatsapp, internship, message } = req.body;

    const contact = await prisma.contact.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim().replace(/\s/g, ""),
        internship: internship.trim(),
        message: message?.trim() || "",
      },
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: serializeContact(contact),
    });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: contacts.map(serializeContact) });
  } catch (error) {
    next(error);
  }
};
