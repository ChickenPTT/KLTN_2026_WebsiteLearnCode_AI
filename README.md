# KLTN_2026_WebsiteLearnCode_AI

Website học lập trình có hỗ trợ AI. Backend Spring Boot + frontend React (Vite).

## Cấu trúc

```
.
├── pom.xml, mvnw, mvnw.cmd     # Backend Spring Boot (Java 26)
├── src/main/java/...           # Controller / Service / Repository / Model
├── src/main/resources/
│   ├── application.properties
│   └── static/                 # (prod) nơi copy frontend/dist vào
├── .env                        # Secret backend (KHÔNG commit) - xem .env.example
│
└── frontend/                   # Frontend React + TypeScript + Tailwind
    ├── package.json, vite.config.ts
    ├── .env.local              # Secret frontend (KHÔNG commit) - xem .env.local.example
    └── src/
        ├── main.tsx, App.tsx
        ├── hooks/useAuth.tsx   # Auth context (đang ở MOCK MODE)
        ├── data/mockAuth.ts    # Tài khoản demo
        ├── lib/supabase.ts
        ├── layout/             # Header / Footer / PageHeader
        ├── components/         # Component dùng chung
        └── pages/
            ├── user/           # Landing, Auth, Topics, Practice, Quiz, ...
            └── admin/          # Dashboard, Users, Problems, Templates, Generator
```

## Chạy ở môi trường dev

Cần 2 terminal. Frontend gọi API qua đường dẫn tương đối `/api`, Vite proxy sang
backend `localhost:8080` (cấu hình ở `frontend/vite.config.ts`) nên **không bị CORS**.

**1. Backend** — cần PostgreSQL `testai_db` chạy ở `localhost:5432`:

```bash
cp .env.example .env      # rồi điền key thật vào .env
./mvnw spring-boot:run    # -> http://localhost:8080
```

**2. Frontend**:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev               # -> http://localhost:5173
```

Mở `http://localhost:5173`. Khi `VITE_SUPABASE_URL` còn trống, auth chạy ở
MOCK MODE với tài khoản demo trong `frontend/src/data/mockAuth.ts`:

| Email              | Mật khẩu   | Vai trò       |
| ------------------ | ---------- | ------------- |
| `student@demo.com` | `demo1234` | Sinh viên     |
| `teacher@demo.com` | `demo1234` | Giảng viên    |
| `admin@demo.com`   | `demo1234` | Quản trị viên |

## Build cho production

```bash
cd frontend && npm run build          # sinh ra frontend/dist/
cp -r dist/* ../src/main/resources/static/
cd .. && ./mvnw clean package         # 1 file JAR serve cả FE + API
```

## API backend

Tất cả endpoint đều nằm dưới prefix `/api`:

| Method   | Endpoint                    | Chức năng                    |
| -------- | --------------------------- | ---------------------------- |
| `POST`   | `/api/submit`               | Nộp code, chấm qua Judge0    |
| `POST`   | `/api/analyze`              | Phân tích lỗi bằng AI        |
| `GET`    | `/api/problems/drafts`      | Danh sách bài tập nháp       |
| `GET`    | `/api/problems/{id}`        | Chi tiết bài tập             |
| `POST`   | `/api/problems/{id}/verify` | Kiểm định bài tập            |
| `PUT`    | `/api/problems/{id}/publish`| Xuất bản bài tập             |
| `DELETE` | `/api/problems/{id}`        | Xoá bài tập                  |
| `POST`   | `/api/template/generate`    | Sinh đề từ template          |
