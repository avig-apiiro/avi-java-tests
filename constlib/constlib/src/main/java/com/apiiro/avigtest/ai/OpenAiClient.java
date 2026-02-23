package main.java.com.apiiro.avigtest.ai;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseCreateParams;

// Configures using the `OPENAI_API_KEY`, `OPENAI_ORG_ID` and `OPENAI_PROJECT_ID` environment variables
public class OpenAiClient {

    public void testCode() {
        OpenAIClient client = OpenAIOkHttpClient.fromEnv();

        ResponseCreateParams params = ResponseCreateParams.builder()
            .input("Say this is a test")
            .model(ChatModel.GPT_5_2)
            .build();
        Response response = client.responses().create(params);
    }

}
