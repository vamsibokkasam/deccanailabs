import mongoose from "mongoose";

let lastConnectionError = null;

const formatMongoUri = (uri) => {
  let formatted = uri.trim();

  // Fix URIs like: ...mongodb.net/?appName=Cluster0 (missing database name)
  if (/\.net\/\?/.test(formatted)) {
    formatted = formatted.replace(/\.net\/\?/, ".net/deccanailabs?");
  } else if (/\.net\?$/.test(formatted) || /\.net\?[^/]/.test(formatted)) {
    formatted = formatted.replace(/\.net\?/, ".net/deccanailabs?");
  } else if (!/\.net\/[^/?]+/.test(formatted)) {
    formatted = formatted.replace(/(\.net)(\/|$)/, "$1/deccanailabs");
  }

  return formatted;
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    lastConnectionError = "MONGODB_URI environment variable is not set";
    throw new Error(lastConnectionError);
  }

  const connectionUri = formatMongoUri(uri);

  try {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });

    lastConnectionError = null;
    console.log("MongoDB Atlas connected");
  } catch (error) {
    lastConnectionError = error.message;
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

export const getDbStatus = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    status: states[mongoose.connection.readyState] || "unknown",
    error: lastConnectionError,
  };
};

export default connectDB;
