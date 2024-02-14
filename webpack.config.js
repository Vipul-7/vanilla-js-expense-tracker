const path = require('path');

module.exports = {
  entry: {
    index: './Javascript/index.js',        // Entry point for index.js
    reports: './Javascript/reports.js',    // Entry point for reports.js
    login : './Javascript/login.js',
    signup : './Javascript/signup.js'
  },
  output: {
    filename: '[name].bundle.js',          // Dynamically generate bundle names
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
};
