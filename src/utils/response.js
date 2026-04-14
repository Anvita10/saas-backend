exports.success = (
  res,
  data,
  status = 200,
  message = "Data added successfully",
) => {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
};

exports.error = (res, message, status = 500) => {
  return res.status(status).json({
    success: false,
    message,
  });
};
