package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.TestCase;
import com.testModule.TestModule.Model.TestCaseResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class JudgeService {

    @Value("${judge0.api.url}")
    private String apiUrl;

    @Value("${judge0.api.key}")
    private String apiKey;

    @Value("${judge0.api.host}")
    private String apiHost;

    private final RestTemplate restTemplate = new RestTemplate();

    // Gửi code lên Judge0, chờ kết quả, trả về response dạng Map
    public Map<String, Object> runCode(String sourceCode, int languageId, String stdin) {

        String encodedSource = Base64.getEncoder().encodeToString(sourceCode.getBytes());
        String encodedStdin = Base64.getEncoder().encodeToString(stdin.getBytes());
        // Chuẩn bị headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-RapidAPI-Key", apiKey);
        headers.set("X-RapidAPI-Host", apiHost);
        // Chuẩn bị body
        Map<String, Object> body = Map.of(
                "source_code", encodedSource,
                "language_id", languageId,
                "stdin", encodedStdin
        );
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        String url = apiUrl + "/submissions?base64_encoded=true&wait=true";
        // Gọi API, nhận kết quả dạng Map (JSON tự parse)
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        Map<String, Object> result = response.getBody();
        // Decode stdout nếu có, để trả về text dễ đọc thay vì base64
        if (result != null && result.get("stdout") != null) {
            String decodedStdout = new String(Base64.getDecoder().decode((String) result.get("stdout")));
            result.put("stdout_decoded", decodedStdout);
        }
        return result;
    }

    public List<TestCaseResult> runAllTestCases(String sourceCode, int languageId, List<TestCase> testCases) {
        List<TestCaseResult> results = new ArrayList<>();

        for (TestCase tc : testCases) {
            // Gọi lại hàm runCode() đã viết trước đó, dùng input riêng của từng test case
            Map<String, Object> response = runCode(sourceCode, languageId, tc.getInput());

            String actualOutput = "";
            if (response.get("stdout_decoded") != null) {
                actualOutput = ((String) response.get("stdout_decoded")).trim();
            }

            String expected = tc.getExpectedOutput().trim();
            boolean passed = actualOutput.equals(expected);

            // Lấy status description từ Judge0 (vd "Accepted", "Runtime Error"...)
            Map<String, Object> statusMap = (Map<String, Object>) response.get("status");
            String statusDesc = statusMap != null ? (String) statusMap.get("description") : "Unknown";

            String time = (String) response.get("time");
            Integer memory = (Integer) response.get("memory");

            TestCaseResult tcResult = new TestCaseResult(tc.getInput(), expected, actualOutput, passed, statusDesc, time, memory);
            String errorOutput = decode(response.get("compile_output"));
            if (errorOutput == null) {
                errorOutput = decode(response.get("stderr"));
            }
            tcResult.setErrorOutput(errorOutput);
            results.add(tcResult);
        }

        return results;
    }

    // Judge0 tra cac truong output dang base64 (co the kem xuong dong)
    private static String decode(Object base64) {
        if (!(base64 instanceof String s) || s.isBlank()) {
            return null;
        }
        String text = new String(Base64.getMimeDecoder().decode(s), StandardCharsets.UTF_8).trim();
        return text.isEmpty() ? null : text;
    }

}