const ENV = process.env.ENV;

const config = {
  backendUrl: ENV === "prod"
    ? "https://your-production-backend-url.com"  // 生产环境 URL
    : "http://127.0.0.1:8000",                   // 本地开发 URL
};

export default config;