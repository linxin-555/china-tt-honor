module.exports = {
  apps: [{
    name: 'china-tt-honor',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
