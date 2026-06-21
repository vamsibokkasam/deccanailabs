export const validateBody = (validator) => (req, res, next) => {
  const errors = validator(req.body);

  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    return res.status(400).json({
      success: false,
      message: firstError,
      errors,
    });
  }

  next();
};
