# Cloud Engineer Internship - Midterm Project

Dự án hoàn chỉnh tích hợp giữa Ứng dụng Web API (Node.js), Hạ tầng dưới dạng Code (IaC Pulumi) và Tự động hóa CI/CD (GitHub Actions) trên Google Cloud Platform (GCP).

## 🏗️ Kiến trúc hệ thống (Architecture)

```text
 [ Người dùng (Internet) ]
            │
            ▼ (HTTP Request - Port 443)
 ┌────────────────────────────────────────────────────────┐
 │            Google Cloud Run (Serverless)               │
 │    - Tên dịch vụ: midterm-cloud-run-service            │
 │    - Cấu hình: Public (allUsers as run.invoker)        │
 └──────────────────────────┬─────────────────────────────┘
                            │ (Kéo Container Image)
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │          Google Artifact Registry (Docker Repo)        │
 │    - Tên kho chứa: midterm-docker-repo                 │
 │    - Đường dẫn: asia-southeast1-docker.pkg.dev/...     │
 └────────────────────────────────────────────────────────┘
```

---

## 🛠️ Hướng dẫn triển khai (Deployment Guide)

### 1. Triển khai cục bộ (Local Deployment)
Để chạy thử hạ tầng từ máy cá nhân của bạn:
1. Di chuyển vào thư mục hạ tầng: `cd infra`
2. Cài đặt các thư viện: `npm install`
3. Đăng nhập chế độ local: `& "$env:APPDATA\sst\bin\pulumi.exe" login --local`
4. Khởi tạo stack: `& "$env:APPDATA\sst\bin\pulumi.exe" stack init dev`
5. Cấu hình mật khẩu: `$env:PULUMI_CONFIG_PASSPHRASE="my-secret-key"`
6. Triển khai: `& "$env:APPDATA\sst\bin\pulumi.exe" up`

### 2. Triển khai tự động (GitOps CI/CD)
Mỗi khi push code lên nhánh `main`, pipeline GitHub Actions `.github/workflows/deploy.yml` sẽ tự động thực hiện:
*   Cài đặt môi trường Node.js và Pulumi CLI.
*   Xác thực với GCP sử dụng Secret `GCP_SA_KEY` (chứa Key JSON của Service Account).
*   Chạy `pulumi up` tự động bằng chế độ Local State để cập nhật ứng dụng.

---

## 📝 Nhật ký sự cố & Khắc phục (Postmortem)

Dưới đây là các sự cố tiêu biểu đã gặp phải trong quá trình học tập và cách giải quyết:

### 1. Sự cố Lỗi Cú pháp Line Continuation trên PowerShell (Day 1)
*   **Mô tả lỗi:** Khi copy lệnh tạo Service Account từ tài liệu Linux sử dụng ký tự `\` để xuống dòng, PowerShell báo lỗi `Missing expression after unary operator '--'`.
*   **Nguyên nhân:** PowerShell trên Windows sử dụng dấu backtick (`` ` ``) để xuống dòng thay vì dấu backslash (`\`) của Linux.
*   **Cách khắc phục:** Đã gộp lệnh chạy trên một dòng duy nhất hoặc đổi ký tự xuống dòng từ `\` sang `` ` ``.

### 2. Lỗi Quyền `SetIamPolicy` bị chặn trên GCP (Day 7)
*   **Mô tả lỗi:** Khi deploy Cloud Run kèm tham số `--allow-unauthenticated`, GCP Audit Logs báo lỗi đỏ `Permission 'run.services.setIamPolicy' denied`.
*   **Nguyên nhân:** Service Account `github-deployer` chỉ được cấp quyền `roles/run.developer` (không có quyền cấu hình bảo mật hay mở public cho ứng dụng).
*   **Cách khắc phục:** Đã chạy lệnh gcloud nâng cấp quyền cho Service Account lên `roles/run.admin` (Cloud Run Admin).

### 3. Lỗi Đóng gói Thư mục trên Windows (Day 9)
*   **Mô tả lỗi:** Khi chạy `pulumi up`, quá trình đóng gói ảnh Docker bị dừng và báo lỗi `failed to read dockerfile: archive/tar: invalid tar header`.
*   **Nguyên nhân:** File `.dockerignore` bị trống, dẫn đến Pulumi cố gắng nén cả thư mục `.git` và thư mục `node_modules` local (chứa hàng ngàn file nhỏ), gây vỡ cấu trúc file nén tar trên Windows.
*   **Cách khắc phục:** Đã cấu hình file `.dockerignore` chuẩn xác để bỏ qua `node_modules`, `.git` và `.github` trước khi chạy build.
