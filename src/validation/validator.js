const isValid = function (value) {
  //if(typeof value ==="undefined"|| value===null) return false;
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  } else {
    return true;
  }
};

const isMobileNumber = function (data) {
  const mobileRegex = /^([9876]{1})([0-9]{9})$/;
  return mobileRegex.test(data);
};

const isValidEmail = function (data) {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(data);
};

const isValidPincode = function (data) {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(data);
};

function checkPassword(str) {
  var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;
  return re.test(str);
}

function checkname(str) {
  var nameRegex = /^[A-Z a-z]+$/;
  return nameRegex.test(str);
}

function checkISBN(str) {
    var ISBNRegex = /^[\d*\-]{13}$/;
    return ISBNRegex.test(str);
  }

module.exports = {
  isValid,
  isMobileNumber,
  isValidEmail,
  isValidPincode,
  checkPassword,
  checkname,
  checkISBN
};
