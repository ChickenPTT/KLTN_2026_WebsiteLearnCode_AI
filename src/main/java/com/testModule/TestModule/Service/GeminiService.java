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
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String askGemini(String promptText) {

        // Cấu trúc body theo đúng format Gemini yêu cầu: contents -> parts -> text
        Map<String, Object> part = Map.of("text", promptText);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey); // Gemini nhận key qua header này

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);
        Map<String, Object> result = response.getBody();

        // Bóc tách text trả về từ cấu trúc: candidates[0].content.parts[0].text
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) result.get("candidates");
        Map<String, Object> firstCandidate = candidates.get(0);
        Map<String, Object> contentResp = (Map<String, Object>) firstCandidate.get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResp.get("parts");

        return (String) parts.get(0).get("text");
    }
    public AiFeedback analyzeCode(String problemStatement, String sourceCode, List<TestCaseResult> testResults) {

        // Xây dựng prompt hoàn chỉnh từ dữ liệu thật
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

        // Chuẩn bị request, thêm generationConfig để ép trả JSON
        Map<String, Object> part = Map.of("text", prompt.toString());
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> generationConfig = Map.of("response_mime_type", "application/json");
        Map<String, Object> body = Map.of(
                "contents", List.of(content),
                "generationConfig", generationConfig
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);
        Map<String, Object> result = response.getBody();

        // Bóc tách text JSON trả về (giống hàm askGemini cũ)
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) result.get("candidates");
        Map<String, Object> firstCandidate = candidates.get(0);
        Map<String, Object> contentResp = (Map<String, Object>) firstCandidate.get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResp.get("parts");
        String jsonText = (String) parts.get(0).get("text");

        // Parse chuỗi JSON đó thành object AiFeedback
        try {
            return objectMapper.readValue(jsonText, AiFeedback.class);
        } catch (Exception e) {
            throw new RuntimeException("Không parse được JSON từ Gemini: " + jsonText, e);
        }
    }
}