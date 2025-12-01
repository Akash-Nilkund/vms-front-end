# Backend CORS Fix Instructions

The following changes are required in the Spring Boot backend to explicitly allow the frontend origins (`http://localhost:3000` and `http://localhost:3001`).

## 1. Update `WebSocketConfig.java`

Modify the `registerStompEndpoints` method to allow specific origins.

```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOrigins("http://localhost:3000", "http://localhost:3001") // Allow specific origins
            .withSockJS();
}
```

## 2. Update `WebConfig.java` (Global CORS)

Ensure the global CORS configuration also permits these origins.

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:3001")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
}
```

> **Note:** For local development, I have also configured a proxy in the frontend `package.json` to bypass these CORS restrictions. However, applying the above backend changes is recommended for a robust configuration.
