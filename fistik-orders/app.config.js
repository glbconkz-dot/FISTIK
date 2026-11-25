module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
    managerSecret:
      process.env.EXPO_PUBLIC_MANAGER_SECRET || process.env.MANAGER_APP_SECRET || '',
  },
});
