# Nhập môn Xây dựng Helm Chart (Dễ hiểu cho người mới)

Bạn nói rất đúng! Không nên dùng đồ may sẵn mà không biết nó được dệt như thế nào. Chào mừng bạn đến với khóa huấn luyện "Thợ mộc K8s". 

Nếu file YAML thuần túy là những **Bức tượng đúc sẵn** (Cứng nhắc, muốn đổi màu phải đập đi đúc lại), thì Helm Chart chính là một **Khuôn đúc linh hoạt** (Chỉ cần đổ loại sơn bạn muốn vào, nó sẽ đúc ra bức tượng màu đó).

Để xây dựng một Helm Chart, bạn chỉ cần tạo một thư mục (ví dụ `helm/e-commerce`), bên trong bắt buộc phải có 3 thành phần cốt lõi:

---

## 1. File `Chart.yaml` (Căn cước công dân của Chart)
K8s cần biết cái khuôn đúc này tên gì, phiên bản bao nhiêu. File này rất đơn giản:

```yaml
apiVersion: v2
name: e-commerce           # Tên của Chart
description: A Helm chart for E-Commerce App
type: application          
version: 0.1.0             # Phiên bản của cái khuôn đúc này (Chart version)
appVersion: "1.0.0"        # Phiên bản của mã nguồn ứng dụng Java/React bên trong
```

---

## 2. Thư mục `templates/` (Xưởng đúc)
Thay vì vứt các file `deployment.yml`, `service.yml` cứng nhắc vào đây, chúng ta sẽ biến chúng thành các **Bản thiết kế có lỗ hổng** (Template).

Ngôn ngữ sử dụng là **Go Template**. Cứ chỗ nào cần thay đổi linh hoạt (ví dụ: số lượng Pod, dung lượng RAM, tên Image), bạn khoét một cái lỗ bằng cú pháp `{{ .Values.tên_biến }}`.

**Ví dụ:** File `frontend-deployment.yml` ĐÃ ĐƯỢC KHOÉT LỖ:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: {{ .Values.frontend.replicaCount }} # Khoét lỗ số lượng Pod
  selector:
    matchLabels:
      app: frontend
  template:
    ...
    spec:
      containers:
        - name: frontend
          # Khoét lỗ Tên Image và Tag
          image: {{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}
```
*Lưu ý khoảng trắng bên trong dấu ngoặc nhọn `{{ }}` là bắt buộc.*

---

## 3. File `values.yaml` (Bảng điều khiển)
Đây là nơi chứa "Sơn màu" để đổ vào các lỗ hổng ở phần số 2. File này định nghĩa các giá trị mặc định. Người dùng chỉ cần mở file này ra sửa, toàn bộ các file trong thư mục `templates` sẽ tự động được điền theo.

**Ví dụ `values.yaml`:**
```yaml
# Cấu hình cho Frontend
frontend:
  replicaCount: 1 # Ghi 1 ở đây, Helm sẽ rót số 1 vào chỗ {{ .Values.frontend.replicaCount }}
  image:
    repository: thuongnguyen2kvp/shop-frontend
    tag: "latest" # Rót chữ "latest" vào lỗ {{ .Values.frontend.image.tag }}
```

---

## 4. Tùy biến đa môi trường (Điều kỳ diệu của Helm)

Tại sao Helm lại ăn đứt Kustomize? Giả sử sếp yêu cầu:
*   Môi trường **Staging**: Chạy 1 Pod cho tiết kiệm tiền.
*   Môi trường **Production**: Chạy 3 Pod để chịu tải, RAM tăng gấp đôi.

Thay vì phải đi copy paste code nhọc nhằn, bạn chỉ cần tạo 2 file ghi đè cực mỏng:

**File `values-staging.yaml`:**
```yaml
frontend:
  replicaCount: 1
```

**File `values-production.yaml`:**
```yaml
frontend:
  replicaCount: 3 # Ghi đè thông số mặc định
```

Lúc chạy lệnh, bạn đứng từ xa chỉ tay năm ngón:
*   *"Ê K8s, đúc cho tao môi trường Staging!"* -> `helm install shop-staging ./e-commerce -f values-staging.yaml`
*   *"Ê K8s, đúc cho tao môi trường Production!"* -> `helm install shop-prod ./e-commerce -f values-production.yaml`

K8s sẽ tự động trộn file `values.yaml` mặc định với file `-f` bạn chỉ định, rót vào khuôn `templates` và tạo ra hàng loạt tài nguyên hoàn hảo!

👉 *Trong mã nguồn máy bạn hiện tại, tôi đã áp dụng chính xác 4 bước này vào thư mục `helm/e-commerce/`. Bạn có thể dùng VSCode mở các file trong đó ra xem để đối chiếu với lý thuyết nhé!*
