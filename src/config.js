const ENV = process.env.REACT_APP_ENV;

const config = {
  backendUrl: ENV === "prod"
    ? "https://ai-helper-e8f29bf455ac.herokuapp.com"
    : "http://127.0.0.1:8000",                
};

export default config;