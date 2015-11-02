module.exports = {
  cookieSecret: 'cookieSecret',
  sessionSecret: 'sessionSecret',
  db: 'interview',
  host: 'localhost',
  port: 3000,
  session: {
    redis: {
      host: 'localhost',
      port: 6379
    }
  },
  emailFrom: 'Email Server <email_server@mail.com>',
  mongooseDebug: false
};