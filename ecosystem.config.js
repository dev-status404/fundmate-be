module.exports = {
  apps: [{
    name: 'app',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_blue: {
      NODE_ENV: 'production',
      COLOR: 'blue'
    },
    env_green: {
      NODE_ENV: 'production',
      COLOR: 'green'
    }
  }]
};