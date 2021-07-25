exports.validatePassword = (password) => {
  let passwordre = new RegExp(
    "(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
  );
  return passwordre.test(password);
};
