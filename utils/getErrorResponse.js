const getErrorResponse = (err) => {
  if (err.statusCode) {
    return {
      statusCode: err.statusCode,
      message: err.message,
    };
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors)
      .map(e => `${e.path}: ${e.message}`)
      .join(', ');
    return {
      statusCode: 400,
      message: errors || 'Unable to save listing. Please check the details and try again.',
    };
  }

  if (err.name === 'CastError') {
    return {
      statusCode: 404,
      message: 'Listing not found',
    };
  }

  return {
    statusCode: 500,
    message: 'Internal Server Error',
  };
};

module.exports = getErrorResponse;
