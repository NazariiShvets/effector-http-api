module.exports = function () {
  return {
    plugins: [
      [
        'effector/babel-plugin',
        {
          noDefaults: true,
          factories: ['effector-http-api'],
        },
        'effector-http-api',
      ],
    ],
  };
};
