exports.isEmptyWithSpace = (str) => {
  if (str.trim(" ") === "") {
    return true;
  }
  return false;
};
exports.isEmail = (emailString) => {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (emailString.match(regex)) {
    return true;
  }
  return false;
};

exports.reduceUserDetails = (data) => {
  let userDetails = {};

  // if (!isEmptyWithSpace(data.bio)) {
  //   userDetails.bio = data.bio;
  // }

  // if (!isEmptyWithSpace(data.website)) {
  //   userDetails.website = data.website;
  // }

  // if (!isEmptyWithSpace(data.location)) {
  //   userDetails.location = data.location;
  // }
  if (data.bio !== undefined) {
    userDetails.bio = data.bio;
  }

  if (data.location !== undefined) {
    userDetails.location = data.location;
  }

  if (data.website !== undefined) {
    userDetails.website = data.website;
  }

  return userDetails;
};
