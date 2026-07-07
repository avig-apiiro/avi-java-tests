package com.apiiro.avigtest.ai;
import com.google.genai.Chat;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
public class GeminiClient
{
    public void test1() {
        // Use your API key from AI Studio
        String apiKey = "YOUR_API_KEY";

        // Initialize the client
        Client client = Client.builder()
            .apiKey(apiKey)
            .build();



        // Send a prompt
        GenerateContentResponse response = client.models.generateContent("gemini-2.0-flash", "Explain AI in one sentence.", null);

        // Print the text response
        System.out.println(response.text());
    }


    public static void main(String[] args) {
        Client client = new Client.Builder()
            .apiKey(System.getenv("GEMINI_API_KEY"))
            .build();
        Chat chat = client.chats.create("gemini-2.0-flash", null);
        GenerateContentResponse response1 = chat.sendMessage("My name is Alice.");
        System.out.println(response1.text());
        GenerateContentResponse response2 = chat.sendMessage("What is my name?");
        System.out.println(response2.text());
    }
}
