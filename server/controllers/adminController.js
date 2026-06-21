import Contact from "../models/Contact.js";
import InternshipApplication from "../models/InternshipApplication.js";
import Program from "../models/Program.js";

export const verifyAdmin = (req, res) => {
  res.json({ success: true, message: "Admin access granted" });
};

export const getStats = async (req, res, next) => {
  try {
    const [totalContacts, totalApplications, applicationsPerProgram, statusBreakdown] =
      await Promise.all([
        Contact.countDocuments(),
        InternshipApplication.countDocuments(),
        InternshipApplication.aggregate([
          { $group: { _id: "$program", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { _id: 0, program: "$_id", count: 1 } },
        ]),
        InternshipApplication.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $project: { _id: 0, status: "$_id", count: 1 } },
        ]),
      ]);

    const totalPrograms = await Program.countDocuments({ isActive: true });

    const statusCounts = { pending: 0, reviewed: 0, accepted: 0, rejected: 0 };
    statusBreakdown.forEach(({ status, count }) => {
      statusCounts[status] = count;
    });

    res.json({
      success: true,
      data: {
        totalContacts,
        totalApplications,
        totalPrograms,
        applicationsPerProgram,
        statusCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};
