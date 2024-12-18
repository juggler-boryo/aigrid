export const Endpoint =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/"
    : "https://aigrid-731240201745.asia-northeast1.run.app/";


// proxy server of finyl, connected to toyu
export const ToyuEndpoint = "https://192.168.2.105:8443"