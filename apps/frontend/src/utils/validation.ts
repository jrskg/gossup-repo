export type returnType = {
  isValid: boolean,
  error: string
}
const validateName = (name: string): returnType => {
  const response: returnType = {
    isValid: true,
    error: ''
  };
  const trimmedName = name.trim();
  const regex: RegExp = /^[A-Za-z]+(?: [A-Za-z]+)*$/; // Adjusted regex

  if (trimmedName === '') {
    response.isValid = false;
    response.error = 'Please enter name';
  } else if (trimmedName.length < 3) {
    response.isValid = false;
    response.error = 'Name must be at least 3 characters long';
  } else if (!regex.test(trimmedName)) {
    response.isValid = false;
    response.error = 'Name must be alphabets only';
  }
  return response;
};

const validateEmail = (email: string): returnType => {
  const response: returnType = {
    isValid: true,
    error: ''
  };
  const regex: RegExp = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z]+\.[A-Za-z]{2,}$/;
  if (email.trim() == '') {
    response.isValid = false;
    response.error = 'Please enter email';
  } else if (!regex.test(email)) {
    response.isValid = false;
    response.error = 'Please enter valid email';
  }
  return response;
}

const validatePassword = (password: string): returnType => {
  const response: returnType = {
    isValid: true,
    error: ''
  };
  const regex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (password.trim() == '') {
    response.isValid = false;
    response.error = 'Please enter password';
  } else if (!regex.test(password)) {
    response.isValid = false;
    response.error = 'Password must be at least 8 characters long and should contains alphabets, numbers and special characters';
  }
  return response;
}

const validateGroupName = (name: string): returnType => {
  const response: returnType = {
    isValid: true,
    error: ''
  };
  // const regex = /^[_a-zA-Z0-9][a-zA-Z0-9 _-]{1,48}$/;
  // const regex = /^[a-zA-Z0-9_.!-,'@&#$%()^ ]{3,}$/;
  name = name.trim();
  if (name == '') {
    response.isValid = false;
    response.error = 'Please enter group name';
  }
  else if (name.length < 3) {
    response.isValid = false;
    response.error = 'Group name must be at least 3 characters long';
  }
  // else if(!regex.test(name)){
  //   response.isValid = false;
  //   response.error = 'Group name must contains alphabets, numbers and (_, -)';
  // }
  return response;
}

export {
  validateName,
  validateEmail,
  validatePassword,
  validateGroupName
}