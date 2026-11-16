package com.testModule.TestModule.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
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
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

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
        // Luu y: dung 500 (khong dung 502/503) vi FE coi ma >= 502 la "khong ket noi duoc may chu"
        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa cấu hình dịch vụ gửi email.");
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
        } catch (RestClientResponseException e) {
            // Brevo tra loi loi (key sai, IP bi chan, nguoi gui chua xac minh...) -> ghi ro vao log de tra cuu
            log.warn("Brevo tu choi gui email toi {}: HTTP {} - {}", to, e.getStatusCode().value(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không gửi được email xác nhận, vui lòng thử lại sau.");
        } catch (RestClientException e) {
            // Khong ket noi duoc toi Brevo (mang, timeout...)
            log.warn("Khong ket noi duoc Brevo khi gui email toi {}: {}", to, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không gửi được email xác nhận, vui lòng thử lại sau.");
        }
    }
}
