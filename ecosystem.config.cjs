module.exports = {
  apps: [
    {
      name: "ToonScout",
      script: "./js/app.js",
      watch: true,
      ignore_watch: ['users.db', '.git'],
      watch_options: {
        followSymlinks: false,
      },
      env: {
        NODE_ENV: "production",
	APP_ID: "1286517155315322950",
	DISCORD_TOKEN: "MTI4NjUxNzE1NTMxNTMyMjk1MA.GRnx4_.iaWFAKyP0P50l_c0gREmmGzia6DEhmXdDw4t4g",
	PUBLIC_KEY: "e4e2a08a84211734317d4b7934660789efce940e15a2c1690ad3c6ef3652566b",
      },
    },
    {
      name: "Ngrok",
      script: "ngrok",
      args: "http 3000",
    },
  ],
};

