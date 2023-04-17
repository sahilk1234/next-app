const config = {
  production: {
    SECRET: "NextJs",
    DATABASE:
      "mongodb+srv://sahilkhadtare:sahil@cluster0.dijdfcd.mongodb.net/?retryWrites=true&w=majority",
  },
  default: {
    SECRET: "mysecretkey",
    DATABASE: "mongodb://localhost:27017/Users",
  },
};

exports.get = function (env) {
  return config.production;
};
