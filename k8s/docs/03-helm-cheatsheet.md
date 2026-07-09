# 🚀 Bí kíp Vận hành Helm (Helm Cheat Sheet)

Giống như K8s, Helm cũng có những "câu thần chú" đặc trưng giúp bạn quản lý các bản phát hành (Release) một cách gọn gàng và chuyên nghiệp.

Lưu ý: Luôn nhớ thêm cờ `-n <namespace>` nếu bạn đang làm việc ở một namespace cụ thể (ví dụ: `-n shop-staging`).

---

## 1. 🏗️ Khởi tạo và Cài đặt (Install & Dry-run)

- **Cài đặt một Chart mới vào K8s:**
  Cú pháp: `helm install <Tên_Release> <Đường_dẫn_Chart> -f <File_Values>`
  ```bash
  helm install shop-staging ./helm/e-commerce -f ./helm/e-commerce/values-staging.yaml -n shop-staging --create-namespace
  ```

- **Render thử YAML (Dry-run):**
  Lệnh này RẤT QUAN TRỌNG. Nó giúp bạn xem trước toàn bộ file YAML sẽ được sinh ra mà KHÔNG áp dụng lên cụm K8s. Dùng để test xem file `values.yaml` đã ăn vào `templates/` đúng chưa.
  ```bash
  helm template shop-staging ./helm/e-commerce -f ./helm/e-commerce/values-staging.yaml
  ```

---

## 2. 🔍 Giám sát và Kiểm tra (Management)

- **Xem danh sách các ứng dụng (Release) đang chạy:**
  Giống như `docker ps`, lệnh này cho biết bạn đã cài những ứng dụng nào qua Helm.
  ```bash
  helm list -n shop-staging
  
  # Xem tất cả ứng dụng ở mọi namespace
  helm list -A
  ```

- **Kiểm tra trạng thái của một ứng dụng:**
  Xem ứng dụng đã deploy thành công chưa, chạy lúc nào.
  ```bash
  helm status shop-staging -n shop-staging
  ```

- **Lôi cổ cấu hình YAML đang chạy ra xem (Extract):**
  Nếu bạn quên mất ứng dụng hiện tại đang chạy cấu hình gì, lệnh này sẽ móc cái K8s Secret ra và in toàn bộ RAW YAML lên màn hình.
  ```bash
  helm get all shop-staging -n shop-staging
  
  # Chỉ lôi phần Values ra xem
  helm get values shop-staging -n shop-staging
  ```

---

## 3. 🔄 Nâng cấp và "Quay xe" (Upgrade & Rollback) - Tinh hoa của Helm

- **Nâng cấp (Upgrade):**
  Khi bạn sửa file `values.yaml` hoặc có Image mới, hãy dùng lệnh này để cập nhật (Helm sẽ chỉ update những chỗ có thay đổi, zero-downtime).
  ```bash
  helm upgrade shop-staging ./helm/e-commerce -f ./helm/e-commerce/values-staging.yaml -n shop-staging
  ```

- **Xem lịch sử nâng cấp (History):**
  Biết được ứng dụng đã nâng cấp bao nhiêu lần, bản nào lỗi, bản nào thành công.
  ```bash
  helm history shop-staging -n shop-staging
  ```

- **"Quay xe" (Rollback):**
  Bản nâng cấp số 5 bị lỗi sập web? Chỉ tốn 1 giây để lùi về bản số 4 đang chạy ngon lành.
  ```bash
  # Quay lại phiên bản số 4
  helm rollback shop-staging 4 -n shop-staging
  
  # Quay lại phiên bản liền trước đó
  helm rollback shop-staging -n shop-staging
  ```

---

## 4. 🗑️ Xóa bỏ (Uninstall)

- **Gỡ bỏ hoàn toàn ứng dụng:**
  Chỉ với 1 lệnh, Helm sẽ gom và dọn sạch sẽ tất cả Pod, Service, Ingress... thuộc về ứng dụng này mà không để lại rác.
  ```bash
  helm uninstall shop-staging -n shop-staging
  ```

---

## 5. 📦 Quản lý Chợ ứng dụng (Helm Repo)
*(Dùng khi bạn muốn cài các ứng dụng của người khác như Prometheus, Grafana, Nginx Ingress...)*

- **Thêm một cửa hàng (Repo) vào Helm:**
  ```bash
  helm repo add bitnami https://charts.bitnami.com/bitnami
  ```
- **Cập nhật danh sách ứng dụng:**
  ```bash
  helm repo update
  ```
- **Tìm kiếm ứng dụng trong chợ:**
  ```bash
  helm search repo nginx
  ```
