package com.testModule.TestModule.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(ResponseStatusException ex) {
        String message = ex.getReason() == null ? "Yêu cầu không hợp lệ." : ex.getReason();
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message", message));
    }

    // Judge0 / Gemini / Groq khong goi duoc (sai key, het quota, mat mang...)
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<Map<String, String>> handleExternalService(RestClientException ex) {
        System.err.println("[API] Lỗi gọi dịch vụ ngoài: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("message", "Không kết nối được dịch vụ chấm bài / AI. Vui lòng thử lại sau."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", "Dữ liệu gửi lên không hợp lệ."));
    }
}
