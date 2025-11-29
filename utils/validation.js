const validator = require('validator');

// Validate email
const validateEmail = (email) => {
  return validator.isEmail(email);
};

// Validate password strength
const validatePassword = (password) => {
  return password.length >= 6;
};

// Validate name
const validateName = (name) => {
  return name && name.trim().length > 0 && name.trim().length <= 50;
};

// Validate registration input
const validateRegistration = (name, email, password) => {
  const errors = [];

  if (!validateName(name)) {
    errors.push('Name is required and should be between 1-50 characters');
  }

  if (!validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate login input
const validateLogin = (email, password) => {
  const errors = [];

  if (!validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateRegistration,
  validateLogin
};
