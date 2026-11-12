import prisma from "../config/prisma.js";
import { serializeServiceQuote } from "../utils/serialize.js";

export const createServiceQuote = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      businessName,
      serviceType,
      projectDetails,
      budget,
      timeline,
      sourcePage,
    } = req.body;

    const quote = await prisma.serviceQuote.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim().replace(/\s/g, ""),
        businessName: businessName?.trim() || "",
        serviceType: serviceType.trim(),
        projectDetails: projectDetails.trim(),
        budget: budget?.trim() || "",
        timeline: timeline?.trim() || "",
        sourcePage: sourcePage?.trim() || "",
      },
    });

    res.status(201).json({
      success: true,
      message: "Quote request saved successfully",
      data: serializeServiceQuote(quote),
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceQuotes = async (req, res, next) => {
  try {
    const quotes = await prisma.serviceQuote.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: quotes.map(serializeServiceQuote) });
  } catch (error) {
    next(error);
  }
};
