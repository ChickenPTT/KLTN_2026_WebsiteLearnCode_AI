# Feature Tree — TestModule (Website Học Lập Trình + AI)

## Tổng quan
Dựa trên template feature tree, dưới đây là thống kê các chức năng đã implement trong project.

---

## 1. REGISTRATION & AUTHENTICATION (Xanh lá — Đăng ký & Xác thực)

### ✅ Đăng ký tài khoản (Register)
- **Backend**: `POST /api/auth/register` — AuthController + AuthService
- **Frontend**: `AuthPage.tsx` (mode register)
- Mô tả: Người dùng đăng ký với email, mật khẩu, họ tên.

### ✅ Đăng nhập (Login)
- **Backend**: `POST /api/auth/login` — JWT access token + refresh token cookie
- **Frontend**: `AuthPage.tsx` (mode login)
- Mô tả: Đăng nhập bằng email/password, nhận JWT token.

### ✅ Làm mới token (Token Refresh)
- **Backend**: `POST /api/auth/refresh` — Refresh token qua httpOnly cookie
- Mô tả: Tự động làm mới access token khi hết hạn.

### ✅ Đăng xuất (Logout)
- **Backend**: `POST /api/auth/logout` — Xóa refresh token cookie
- **Frontend**: UserMenu component
- Mô tả: Đăng xuất và xóa session.

### ✅ Onboarding (Hướng dẫn người dùng mới)
- **Backend**: `POST /api/auth/me/onboarding`
- **Frontend**: `OnboardingPage.tsx`
- Mô tả: Người dùng mới chọn phương pháp đánh giá mức độ (Self-rate hoặc Quiz).

### ✅ Quên mật khẩu / Đổi mật khẩu
- **Backend**: `POST /api/auth/me/change-password`
- **Frontend**: `SettingsPage.tsx`
- Mô tả: Người dùng đổi mật khẩu.

---

## 2. ACCOUNT MANAGEMENT (Xanh dương đậm — Quản lý tài khoản)

### ✅ Xem thông tin cá nhân (Get Profile)
- **Backend**: `GET /api/auth/me`
- **Frontend**: `ProfilePage.tsx`
- Mô tả: Xem thông tin tài khoản đang đăng nhập.

### ✅ Cập nhật thông tin cá nhân (Update Profile)
- **Backend**: `PUT /api/auth/me`
- **Frontend**: `ProfilePage.tsx`, `SettingsPage.tsx`
- Mô tả: Cập nhật họ tên, email.

### ✅ Đổi mật khẩu (Change Password)
- **Backend**: `POST /api/auth/me/change-password`
- **Frontend**: `SettingsPage.tsx`
- Mô tả: Đổi mật khẩu tài khoản.

### ✅ Cài đặt tài khoản (Settings)
- **Frontend**: `SettingsPage.tsx`
- Mô tả: Trang cài đặt tài khoản người dùng.

### ✅ Quản lý vai trò (Role-based Access Control)
- **Backend**: `SecurityConfig.java` — 3 vai trò: STUDENT, TEACHER, ADMIN
- Mô tả: Phân quyền theo vai trò cho từng endpoint.

---

## 3. ADMIN PANEL (Xanh dương đậm — Quản trị viên)

### ✅ Dashboard thống kê
- **Backend**: `GET /api/admin/dashboard` — AdminDashboardService
- **Frontend**: `AdminDashboardTab.tsx`
- Mô tả: Thống kê tổng quan: số user, số bài tập, số lần nộp.

### ✅ Quản lý người dùng (User Management)
- **Backend**: `GET/POST/PUT/DELETE /api/admin/users` — UserManagementService
- **Frontend**: `AdminUsersTab.tsx`, `AdminAddUserModal.tsx`, `AdminUserDetailModal.tsx`
- Mô tả: Thêm, sửa, xóa, khóa/mở khóa tài khoản người dùng.

### ✅ Quản lý bài tập (Problem Management)
- **Backend**: `GET /api/problems/manage`, `GET /api/problems/drafts`
- **Frontend**: `AdminProblemsTab.tsx`
- Mô tả: Xem tất cả bài tập (kể cả draft), xuất bản/hủy xuất bản, xóa.

### ✅ Quản lý Template (Template Management)
- **Backend**: `GET/POST/PUT/DELETE /api/template` — TemplateCommandService
- **Frontend**: `AdminTemplatesTab.tsx`, `AdminTemplateFormModal.tsx`, `AdminTemplateDetailModal.tsx`
- Mô tả: Tạo, sửa, xóa template để sinh đề bài.

### ✅ Sinh đề tự động (AI Problem Generator)
- **Backend**: `POST /api/template/generate` — ProblemGeneratorService + Gemini AI
- **Frontend**: `AdminGeneratorTab.tsx`, `AdminGeneratorModal.tsx`
- Mô tả: Sinh bài tập mới từ template, có thể dùng AI paraphrase đề bài.

### ✅ Kiểm định bài tập (Problem Verification)
- **Backend**: `POST /api/problems/{id}/verify` — Chạy test cases để xác nhận bài đúng
- **Frontend**: `AdminVerifyModal.tsx`
- Mô tả: Kiểm tra bài tập có chạy đúng trên tất cả test cases không.

### ✅ Import Excel
- **Frontend**: `AdminImportExcelModal.tsx`
- Mô tả: Import dữ liệu từ file Excel.

### ✅ Audit Logs (Nhật ký hoạt động)
- **Backend**: `AuditLogAspect.java` — AOP logging tự động
- **Frontend**: `AdminAuditLogsTab.tsx`
- Mô tả: Ghi log các thao tác CRUD của admin (tạo user, xóa template, sinh đề...).

---

## 4. CONTENT ACCESS (Xanh ngọc — Truy cập nội dung học)

### ✅ Trang chủ (Landing Page)
- **Frontend**: `LandingPage.tsx`
- Mô tả: Trang giới thiệu, hướng dẫn đăng nhập/bắt đầu.

### ✅ Danh sách chủ đề (Topics List)
- **Backend**: `GET /api/topics`
- **Frontend**: `TopicsPage.tsx`
- Mô tả: Hiển thị danh sách các chủ đề lập trình.

### ✅ Chi tiết chủ đề (Topic Detail)
- **Frontend**: `TopicDetailPage.tsx`
- Mô tả: Xem danh sách bài tập thuộc một chủ đề.

### ✅ Danh sách bài tập (Problems List)
- **Backend**: `GET /api/problems` — Bài đã publish
- **Frontend**: `TopicsPage.tsx`, `TopicDetailPage.tsx`
- Mô tả: Sinh viên xem danh sách bài tập đã xuất bản.

### ✅ Chi tiết bài tập (Problem Detail)
- **Backend**: `GET /api/problems/{id}`
- **Frontend**: `PracticePage.tsx`
- Mô tả: Xem đề bài, sample input/output.

### ✅ Luyện tập — Code Editor (Practice)
- **Frontend**: `PracticePage.tsx`
- Mô tả: Trang viết code, chạy thử, nộp bài.

### ✅ Chạy thử code (Run Sample)
- **Backend**: `POST /api/run` — Chỉ chạy test case mẫu, không lưu lịch sử
- Mô tả: Chạy thử code với test case mẫu trước khi nộp.

### ✅ Nộp bài — Chấm tự động (Submit)
- **Backend**: `POST /api/submit` — Judge0 integration
- Mô tả: Nộp code, chấm trên tất cả test cases, lưu lịch sử.

### ✅ Nộp bài + AI phân tích (Analyze)
- **Backend**: `POST /api/analyze` — Judge0 + Gemini AI feedback
- Mô tả: Nộp bài, chấm test cases, AI phân tích lỗi và gợi ý sửa.

### ✅ Hỗ trợ nhiều ngôn ngữ (Multi-language)
- **Backend**: JudgeController — C (50), C++ (54), Java (62), Python (71)
- Mô tả: Hỗ trợ nộp code bằng 4 ngôn ngữ lập trình.

### ✅ Flashcard — Xem bộ thẻ (Flashcard Decks)
- **Backend**: `GET /api/flashcard/decks`
- **Frontend**: `QuizPage.tsx`
- Mô tả: Xem danh sách bộ flashcard thuật ngữ.

### ✅ Flashcard — Chi tiết bộ thẻ (Deck Terms)
- **Backend**: `GET /api/flashcard/decks/{id}/terms`
- Mô tả: Xem danh sách thuật ngữ trong một bộ flashcard.

### ✅ Quiz — Trắc nghiệm thuật ngữ
- **Backend**: `POST /api/flashcard/quiz/start`, `POST /api/flashcard/quiz/pair`
- **Frontend**: `QuizPage.tsx`
- Mô tả: Chơi quiz ghép cặp thuật ngữ - định nghĩa.

### ✅ Đánh giá mức độ (Self-assessment)
- **Frontend**: `AssessmentPage.tsx`
- Mô tả: Người dùng tự đánh giá mức độ hiểu biết.

### ✅ Kết quả đánh giá (Assessment Result)
- **Frontend**: `ResultPage.tsx`
- Mô tả: Hiển thị kết quả đánh giá và đề xuất chủ đề học.

---

## 5. CONTENT MANAGEMENT (Xanh tím — Quản lý nội dung)

### ✅ Tạo Flashcard Deck
- **Backend**: `POST /api/flashcard/decks`
- Mô tả: Admin/Teacher tạo bộ flashcard mới.

### ✅ Sửa Flashcard Deck
- **Backend**: `PUT /api/flashcard/decks/{id}`
- Mô tả: Cập nhật thông tin bộ flashcard.

### ✅ Xóa Flashcard Deck
- **Backend**: `DELETE /api/flashcard/decks/{id}`
- Mô tả: Xóa bộ flashcard.

### ✅ Thêm thuật ngữ (Add Term)
- **Backend**: `POST /api/flashcard/decks/{deckId}/terms`
- Mô tả: Thêm thuật ngữ mới vào bộ flashcard.

### ✅ Sửa thuật ngữ (Update Term)
- **Backend**: `PUT /api/flashcard/decks/terms/{termId}`
- Mô tả: Cập nhật thuật ngữ.

### ✅ Xóa thuật ngữ (Delete Term)
- **Backend**: `DELETE /api/flashcard/decks/terms/{termId}`
- Mô tả: Xóa thuật ngữ khỏi bộ flashcard.

### ✅ Xuất bản / Hủy xuất bản bài tập
- **Backend**: `PUT /api/problems/{id}/publish`, `PUT /api/problems/{id}/unpublish`
- Mô tả: Kiểm soát bài tập nào sinh viên có thể thấy.

---

## 6. PROGRESS & HISTORY (Xanh tím — Tiến độ & Lịch sử)

### ✅ Lịch sử nộp bài (Submission History)
- **Backend**: `GET /api/history/me`
- **Frontend**: `HistoryPage.tsx`
- Mô tả: Xem danh sách tất cả lần nộp bài.

### ✅ Chi tiết lần nộp (Submission Detail)
- **Backend**: `GET /api/history/me/{id}` — Bao gồm code + AI feedback
- **Frontend**: `HistoryPage.tsx`
- Mô tả: Xem code đã nộp, kết quả test cases, nhận xét AI.

### ✅ Thống kê cá nhân (User Stats)
- **Backend**: `GET /api/user/stats`
- **Frontend**: `ProgressPage.tsx`
- Mô tả: Streak, XP, số bài giải được, tổng số lần nộp, tiến độ theo chủ đề.

### ✅ Hướng dẫn chấm điểm (Scoring Guide)
- **Frontend**: `ScoringGuidePage.tsx`
- Mô tả: Giải thích cách tính điểm, XP, streak.

### ✅ Lịch sử Quiz (Quiz History)
- **Backend**: `GET /api/flashcard/quiz/history`
- Mô tả: Xem lịch sử các lần chơi quiz.

### ✅ Kết quả Quiz (Quiz Result)
- **Backend**: `GET /api/flashcard/quiz/result/{sessionId}`
- Mô tả: Xem kết quả chi tiết một phiên quiz.

---

## 7. AI FEATURES (Đặc biệt — Tính năng AI)

### ✅ AI phân tích code (Code Analysis)
- **Backend**: `GeminiService.java` — Google Gemini API
- Mô tả: AI phân tích code nộp, phát hiện lỗi, gợi ý sửa, đánh giá mức độ nghiêm trọng.

### ✅ AI paraphrase đề bài (Statement Paraphrasing)
- **Backend**: `ProblemGeneratorService.java` — Gemini AI
- Mô tả: AI viết lại đề bài để tạo biến thể mới từ template.

### ✅ AI Feedback trong lịch sử
- **Backend**: Lưu AI feedback (errorType, suspectedLines, explanation, hint, severity)
- **Frontend**: Hiển thị trong chi tiết lần nộp
- Mô tả: Người dùng xem lại nhận xét AI của các lần nộp trước.

---

## 8. SECURITY & INFRASTRUCTURE (Cơ sở hạ tầng)

### ✅ JWT Authentication
- **Backend**: `JwtTokenProvider.java`, `JwtAuthFilter.java`
- Mô tả: JWT access token + httpOnly refresh token cookie.

### ✅ Role-based Authorization
- **Backend**: `SecurityConfig.java` — @PreAuthorize, hasRole, hasAnyRole
- Mô tả: Phân quyền STUDENT / TEACHER / ADMIN cho từng endpoint.

### ✅ Password Encryption
- **Backend**: BCryptPasswordEncoder
- Mô tả: Mã hóa mật khẩu bằng BCrypt.

### ✅ Audit Logging (AOP)
- **Backend**: `AuditLogAspect.java` — Spring AOP
- Mô tả: Tự động ghi log các thao tác quan trọng của admin.

### ✅ API Error Handling
- **Backend**: `ApiExceptionHandler.java`
- Mô tả: Xử lý lỗi thống nhất, trả về JSON.

### ✅ Judge0 Integration
- **Backend**: `JudgeService.java` — Gọi API Judge0
- Mô tả: Chạy code người dùng trong sandbox, trả về kết quả test cases.

---

## Tóm tắt theo template

| Nhóm trong template | Chức năng đã implement | Trạng thái |
|---|---|---|
| **Registration** | Đăng ký, Đăng nhập, Refresh token, Logout, Onboarding | ✅ Hoàn chỉnh |
| **Account Management** | Xem/Sửa profile, Đổi mật khẩu, Settings, RBAC | ✅ Hoàn chỉnh |
| **Admin Panel** | Dashboard, User CRUD, Problem management, Template CRUD, AI Generator, Verify, Audit Log | ✅ Hoàn chỉnh |
| **Content Access** | Landing, Topics, Practice, Run/Submit/Analyze code, Flashcard, Quiz, Self-assessment | ✅ Hoàn chỉnh |
| **Content Management** | Flashcard CRUD, Problem publish/unpublish | ✅ Hoàn chỉnh |
| **Progress & History** | Submission history, User stats (XP, streak), Quiz history | ✅ Hoàn chỉnh |
| **AI Features** | Code analysis (Gemini), Statement paraphrasing, AI feedback | ✅ Hoàn chỉnh |
| **Security** | JWT, RBAC, BCrypt, Audit logging, Judge0 sandbox | ✅ Hoàn chỉnh |
