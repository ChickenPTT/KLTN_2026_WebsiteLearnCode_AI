package com.testModule.TestModule.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/*
 * Gui email qua Brevo (HTTP API, cong 443).
 * Khong dung SMTP vi Render free chan cac cong SMTP (25/465/587).
 * Muon doi nha cung cap khac -> chi sua class nay.
 */
@Service
public class EmailService {

    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestClient restClient = RestClient.create();
    private final String apiKey;
    private final String fromEmail;
    private final String fromName;

    public EmailService(@Value("${brevo.api-key:}") String apiKey,
                        @Value("${mail.from:}") String fromEmail,
                        @Value("${mail.from-name:Mnemonic}") String fromName) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.fromEmail = fromEmail == null ? "" : fromEmail.trim();
        this.fromName = fromName;
    }

    /** Da cau hinh du API key + email nguoi gui chua */
    public boolean isConfigured() {
        return !apiKey.isEmpty() && !fromEmail.isEmpty();
    }

    public void send(String to, String subject, String html) {
        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Chưa cấu hình dịch vụ gửi email.");
        }
        Map<String, Object> body = Map.of(
                "sender", Map.of("name", fromName, "email", fromEmail),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                "htmlContent", html);
        try {
            restClient.post()
                    .uri(BREVO_URL)
                    .header("api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không gửi được email, vui lòng thử lại sau.");
        }
    }
}
