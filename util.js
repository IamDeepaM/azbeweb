exports.success = (data, message, token) => {
  var result = {
    error: false,
    data: data,
    message: message || ''
  };
  if (token) {
    result['token'] = token;
  }
  return result;
};

exports.error = (res) => {
  return (err) => {
    res.json(this.failure(err));
  };
};

exports.failure = (message) => {
  return {
    error: true,
    message: message
  };
};