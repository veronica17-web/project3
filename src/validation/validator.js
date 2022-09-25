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
  var ISBNRegex =
    /^(ISBN[-]*(1[03])*[ ]*(: ){0,1})*(([0-9Xx][- ]*){13}|([0-9Xx][- ]*){10})$/;
  return ISBNRegex.test(str);
}

function checkDate(str) {
  var dateRegex = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/;
  return dateRegex.test(str);
}

const isRating = function (data) {
  const ratingRegex = /^[1-5]{1}$/;
  return ratingRegex.test(data);
};

module.exports = {
  isValid,
  isMobileNumber,
  isValidEmail,
  isValidPincode,
  checkPassword,
  checkname,
  checkISBN,
  checkDate,
  isRating,
};
