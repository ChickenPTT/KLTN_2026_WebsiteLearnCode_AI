package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.AiFeedback;
import com.testModule.TestModule.Model.TestCaseResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String askGemini(String promptText) {
        try {
            return callGemini(promptText, false);
        } catch (Exception geminiError) {
            System.err.println("[AI] Gemini lỗi (" + geminiError.getMessage() + ") -> chuyển sang Groq");
            return callGroq(promptText, false);
        }
    }

    public AiFeedback analyzeCode(String problemStatement, String sourceCode, List<TestCaseResult> testResults) {
        String prompt = buildAnalyzePrompt(problemStatement, sourceCode, testResults);

        String jsonText;
        try {
            jsonText = callGemini(prompt, true);
        } catch (Exception geminiError) {
            System.err.println("[AI] Gemini lỗi khi phân tích (" + geminiError.getMessage() + ") -> chuyển sang Groq");
            jsonText = callGroq(prompt, true);
        }

        try {
            return objectMapper.readValue(jsonText, AiFeedback.class);
        } catch (Exception e) {
            throw new RuntimeException("Không parse được JSON từ AI: " + jsonText, e);
        }
    }

    // ================= GEMINI =================

    private String callGemini(String promptText, boolean forceJson) {
        Map<String, Object> part = Map.of("text", promptText);
        Map<String, Object> content = Map.of("parts", List.of(part));

        Map<String, Object> body = forceJson
                ? Map.of("contents", List.of(content),
                "generationConfig", Map.of("response_mime_type", "application/json"))
                : Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(geminiApiUrl, request, Map.class);
        Map<String, Object> result = response.getBody();

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) result.get("candidates");
        Map<String, Object> firstCandidate = candidates.get(0);
        Map<String, Object> contentResp = (Map<String, Object>) firstCandidate.get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResp.get("parts");

        return (String) parts.get(0).get("text");
    }

    // ================= GROQ (dự phòng khi Gemini quá tải) =================

    private String callGroq(String promptText, boolean forceJson) {
        Map<String, Object> userMessage = Map.of("role", "user", "content", promptText);

        Map<String, Object> body = forceJson
                ? Map.of(
                "model", groqModel,
                "messages", List.of(userMessage),
                "temperature", 0.3,
                "response_format", Map.of("type", "json_object")
        )
                : Map.of(
                "model", groqModel,
                "messages", List.of(userMessage),
                "temperature", 0.7
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(groqApiUrl, request, Map.class);
        Map<String, Object> result = response.getBody();

        List<Map<String, Object>> choices = (List<Map<String, Object>>) result.get("choices");
        Map<String, Object> firstChoice = choices.get(0);
        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");

        return (String) message.get("content");
    }

    private String buildAnalyzePrompt(String problemStatement, String sourceCode, List<TestCaseResult> testResults) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là trợ giảng lập trình. Nhiệm vụ: phân tích code sinh viên nộp dựa trên kết quả chạy test case, ")
                .append("KHÔNG được viết lại toàn bộ code đúng, chỉ gợi ý hướng sửa.\n\n");
        prompt.append("Đề bài: ").append(problemStatement).append("\n\n");
        prompt.append("Code sinh viên nộp:\n").append(sourceCode).append("\n\n");
        prompt.append("Kết quả từng test case:\n");

        for (TestCaseResult tc : testResults) {
            prompt.append(String.format(
                    "- Input: %s | Expected: %s | Actual: %s | Passed: %s | Status: %s%n",
                    tc.getInput(), tc.getExpectedOutput(), tc.getActualOutput(), tc.isPassed(), tc.getStatus()
            ));
        }

        prompt.append("\nTrả về CHÍNH XÁC theo JSON schema sau, không thêm text nào khác ngoài JSON:\n");
        prompt.append("{\n")
                .append("  \"errorType\": \"logic | edge_case | runtime | compile | performance | none\",\n")
                .append("  \"suspectedLines\": [số dòng nghi vấn],\n")
                .append("  \"explanation\": \"giải thích ngắn gọn dựa trên test case fail cụ thể\",\n")
                .append("  \"hint\": \"gợi ý hướng sửa, không đưa code hoàn chỉnh\",\n")
                .append("  \"severity\": \"minor | major | none\"\n")
                .append("}");

        return prompt.toString();
    }
}