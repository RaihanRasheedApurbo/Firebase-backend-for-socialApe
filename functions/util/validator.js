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
  
    if (!isEmptyWithSpace(data.bio)) {
      userDetails.bio = data.bio;
    }
  
    if (!isEmptyWithSpace(data.website)) {
      userDetails.website = data.website;
    }
  
    if (!isEmptyWithSpace(data.location)) {
      userDetails.location = data.location;
    }
  
    return userDetails;
  };
  