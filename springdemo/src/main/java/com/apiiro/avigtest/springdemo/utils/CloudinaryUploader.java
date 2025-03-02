package com.apiiro.avigtest.springdemo.utils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Map;
import java.util.stream.Collectors;

    public class CloudinaryUploader {
        private String cloudName;
        private String apiKey;
        private String apiSecret;

        public CloudinaryUploader(String cloudName, String apiKey, String apiSecret) {
            this.cloudName = cloudName;
            this.apiKey = apiKey;
            this.apiSecret = apiSecret;
        }

        public String uploadImage(String filePath) throws IOException {

            String url = "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload";
            String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();

            File file = new File(filePath);
            if (!file.exists()) {
                throw new FileNotFoundException("File not found: " + filePath);
            }

            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (OutputStream output = connection.getOutputStream(); PrintWriter writer = new PrintWriter(new OutputStreamWriter(output, "UTF-8"), true)) {
                writer.append("--").append(boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"api_key\"").append("\r\n\r\n");
                writer.append(apiKey).append("\r\n");

                writer.append("--").append(boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getName() + "\"").append("\r\n");
                writer.append("Content-Type: " + Files.probeContentType(Paths.get(filePath))).append("\r\n\r\n");
                writer.flush();

                Files.copy(file.toPath(), output);
                output.flush();

                writer.append("\r\n").flush();
                writer.append("--" + boundary + "--").append("\r\n");
            }

            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                    return reader.lines().collect(Collectors.joining());
                }
            } else {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getErrorStream()))) {
                    throw new IOException("Error response: " + reader.lines().collect(Collectors.joining()));
                }
            }
        }
    }


