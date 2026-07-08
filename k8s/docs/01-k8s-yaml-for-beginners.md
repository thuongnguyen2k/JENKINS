# Khóa Học Cấp Tốc: Viết File YAML Kubernetes (K8s) Từ Con Số 0

Nếu bạn vừa chuyển từ Docker Compose sang Kubernetes, hệ thống file YAML của K8s có thể trông rất dài dòng và đáng sợ. Nhưng đừng lo, tài liệu này được viết riêng cho bạn, lấy chính các file trong dự án E-Commerce của bạn ra làm ví dụ thực tế để "giải phẫu".

---

## 1. Tư duy "Khai Báo" (Declarative) - Bí quyết hiểu K8s

Trước khi gõ bất kỳ dòng code nào, bạn phải hiểu tư duy của K8s:
*   **Mệnh lệnh (Imperative - Giống bash script):** "Ê K8s, tạo cho tao 1 cái container, tên là A, dùng ảnh B, mở port C". (K8s không làm việc theo cách này).
*   **Khai báo (Declarative - Giống gọi món ở nhà hàng):** "Ê K8s, tao muốn có một hệ thống với kết quả cuối cùng là: 2 bản sao Backend, 2 bản sao Frontend, 1 cái Database. Mày tự làm cách nào tao không cần biết, miễn ra đúng kết quả đó".

File YAML chính là **"Tờ giấy gọi món"** (Order form) của bạn. Khi bạn nộp tờ giấy này (`kubectl apply -f`), K8s sẽ đọc và âm thầm điều động các Server (Worker nodes) đi "nấu" món ăn cho bạn. Nếu 1 server bị cháy, K8s tự động gọi server khác nấu lại để đảm bảo đúng số lượng bạn đã gọi trên giấy.

---

## 2. Bốn Trụ Cột Bắt Buộc Của Mọi Tờ Giấy Gọi Món

Dù là file YAML cấu hình mạng phức tạp hay chỉ là cấu hình 1 cái mật khẩu, nó luôn luôn phải có đủ 4 phần gốc này:

```yaml
apiVersion: ...
kind: ...
metadata: ...
spec: ...
```

### 🧱 2.1. `apiVersion` (Nhóm kỹ sư phụ trách)
K8s giống như một đại công trường với nhiều đội ngũ kỹ sư. Bạn gọi món gì thì phải gửi đúng cho đội đó.
*   `v1`: Đội cơ bản (Xử lý các món đơn giản: Service, Secret, ConfigMap, Pod).
*   `apps/v1`: Đội quản lý ứng dụng (Xử lý Deployment, StatefulSet).
*   `networking.k8s.io/v1`: Đội mạng lưới (Xử lý Ingress, NetworkPolicy).

### 🧱 2.2. `kind` (Tên món ăn)
Bạn đang muốn K8s chế tạo ra thực thể gì?
*   `Deployment`: Khung chứa ứng dụng không lưu dữ liệu (như Frontend, Backend). Chết đẻ cái mới.
*   `StatefulSet`: Khung chứa ứng dụng CÓ lưu dữ liệu (như Database Postgres). Chết đẻ cái mới nhưng phải giữ nguyên ổ cứng cũ và tên gọi cũ.
*   `Service`: Tổng đài nội bộ. Cấp 1 số điện thoại (IP) cố định để các ứng dụng gọi cho nhau, bất chấp việc các ứng dụng bị chết và đổi IP.
*   `Ingress`: Bác bảo vệ ở cổng công ty. Nhận request từ ngoài Internet (domain name) và chỉ đường vào đúng Service bên trong.
*   `ConfigMap` & `Secret`: Nơi lưu trữ biến môi trường (ENV) và mật khẩu, tách biệt hoàn toàn khỏi source code.

### 🧱 2.3. `metadata` (Chứng minh thư)
Dùng để đặt tên và cấp thẻ căn cước (Labels) cho món đồ đó.
```yaml
metadata:
  name: shop-backend      # Tên định danh (Bắt buộc)
  namespace: shop-staging # Phân khu chứa nó (để khỏi lộn với prod)
  labels:                 # Thẻ tag (CỰC KỲ QUAN TRỌNG ĐỂ KẾT NỐI)
    app: backend
```

### 🧱 2.4. `spec` (Yêu cầu chi tiết)
Đây là phần thân chính. Bạn yêu cầu chi tiết món ăn ra sao (Mấy bản sao? Dùng ảnh Docker nào? Ram bao nhiêu?).

---

## 3. Giải Phẫu Thực Tế Các File Trong Dự Án Của Bạn

Hãy cùng mở các file trong thư mục `k8s/base/` của bạn ra và đọc nó như đọc văn xuôi.

### 🔍 Giải phẫu 0: `namespace.yml` (Chia lô đất xây nhà)

Trong K8s, nếu bạn vứt mọi thứ vào chung một chỗ, nó sẽ cực kỳ lộn xộn (dev lẫn lộn với prod). `Namespace` giống như việc bạn phân lô đất ảo để cách ly hoàn toàn các môi trường với nhau.

```yaml
apiVersion: v1
kind: Namespace # Loại tài nguyên: Không gian làm việc
metadata:
  name: shop-staging # Tên của lô đất này
  labels:
    app.kubernetes.io/part-of: e-commerce # Dán nhãn để dễ quản lý (biết lô đất này thuộc dự án nào)
---
apiVersion: v1
kind: Namespace
metadata:
  name: shop-production # Lô đất thứ 2 (dùng cho môi trường thực tế)
  labels:
    app.kubernetes.io/part-of: e-commerce
```
*Ghi chú: Dấu `---` (3 dấu gạch ngang) cực kỳ hữu dụng. Nó giúp bạn khai báo 2 hoặc nhiều tài nguyên khác nhau chung trong một file YAML duy nhất để đỡ phải tạo nhiều file lắt nhắt.*

### 🔍 Giải phẫu 1: `frontend-deployment.yml` (Cách chạy 1 ứng dụng)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  # TÔI YÊU CẦU:
  replicas: 1  # 1. Luôn luôn giữ cho tôi 1 bản sao chạy (Nếu chết, K8s tự đẻ cái mới)

  selector:
    matchLabels:
      app: frontend # 2. Deployment này sẽ quản lý và làm "Đại ca" của tất cả các Pod có thẻ tên "app: frontend"

  template: # 3. KHUÔN ĐÚC POD (Đây là bản vẽ chi tiết để đẻ ra các bản sao)
    metadata:
      labels:
        app: frontend # Đẻ Pod ra thì nhớ dán cái thẻ này vào trán nó nhé!
    spec:
      containers: # Bên trong Pod chứa 1 container
        - name: frontend
          image: thuongnguyen2kvp/shop-frontend:latest # Kéo code từ kho này về
          ports:
            - containerPort: 80 # Mở cổng 80 cho container

          # QUẢN LÝ TÀI NGUYÊN (Chống cháy nổ Server)
          resources:
            requests: # Giữ chỗ tối thiểu (Phải có đủ 128MB RAM mới cho chạy)
              memory: "128Mi" 
              cpu: "100m" # 100 millicpu = 0.1 CPU core
            limits: # Cấu hình trần (Nếu app ngốn quá 256MB RAM -> K8s sẽ BẮN BỎ app ngay lập tức để cứu server)
              memory: "256Mi"
              cpu: "250m"

          # KIỂM TRA SỨC KHỎE ĐỊNH KỲ
          readinessProbe: # Bài test "Sẵn sàng đón khách chưa?"
            httpGet:
              path: / # Định kỳ K8s sẽ gõ cửa vào trang chủ (/)
              port: 80
            initialDelaySeconds: 5 # Đợi 5 giây sau khi bật mới gõ cửa
            periodSeconds: 10 # Cứ 10 giây gõ cửa 1 lần. 
            # (Nếu gõ cửa mà app báo lỗi 500, K8s sẽ chặn khách, không cho ai truy cập vào Pod này tới khi nó khỏe lại).
```

### 🔍 Giải phẫu 2: `frontend-service.yml` (Cách các app liên lạc nội bộ)

Trong Docker Compose, các app gọi nhau bằng tên container (ví dụ `http://backend:8080`). Nhưng ở K8s, Pod (container) bị chết và sinh ra liên tục, IP đổi liên tục. Nếu gọi theo IP của Pod thì hỏng bét.

Đó là lý do ta cần `Service` - Một tổng đài đứng yên không bao giờ đổi số.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend  # Tên tổng đài nội bộ là "frontend"
spec:
  type: ClusterIP # Loại tổng đài: Chỉ tiếp khách nội bộ trong cụm K8s
  selector:
    app: frontend # SỢI DÂY LIÊN KẾT MA THUẬT: Tổng đài này sẽ chuyển máy tới TẤT CẢ các Pod nào bị dán cái mác "app=frontend" trên trán.
  ports:
    - port: 80       # Khách sẽ gọi vào số này (80)
      targetPort: 80 # Lễ tân sẽ nối máy vào cổng số (80) của cái Pod thực tế
```
*Ghi chú: Nếu Frontend gọi Backend, nó chỉ cần gọi `http://backend:8080` (Tên Service của Backend), K8s sẽ tự động tìm các Pod Backend đang sống rải rác trên các máy ảo để vứt request vào.*

### 🔍 Giải phẫu 3: `postgres-secret.yml` & `backend-configmap.yml` (Cách giấu mật khẩu)

Không ai code rành mạch mật khẩu Database vào file Deployment cả. Chúng ta tách nó ra:

**Secret (Chứa đồ nhạy cảm, K8s tự mã hóa base64):**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  POSTGRES_USER: shop_user
  POSTGRES_PASSWORD: shop_password # Mật khẩu để trần ở đây, K8s sẽ tự giấu đi
```

**ConfigMap (Chứa cấu hình không nhạy cảm):**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  SPRING_DATASOURCE_URL: "jdbc:postgresql://postgres:5432/shopdb" # Trỏ tới Service tên là "postgres"
```

Cách móc nối chúng vào Backend (Xem trong file `backend-deployment.yml`):
```yaml
          envFrom:
            - configMapRef:
                name: backend-config  # Hút mọi cấu hình từ ConfigMap bơm vào biến môi trường
            - secretRef:
                name: postgres-secret # Hút mật khẩu từ Secret bơm vào biến môi trường
```

### 🔍 Giải phẫu 4: `postgres-statefulset.yml` (Chạy Database trên K8s)

Database không thể dùng `Deployment` được, vì Deployment hễ Pod chết đẻ cái mới là **MẤT SẠCH DỮ LIỆU**. Database phải dùng `StatefulSet`.

```yaml
apiVersion: apps/v1
kind: StatefulSet # Khác bọt nằm ở đây
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  # ... (phần selector và template y chang Deployment) ...

  # ĐIỂM ĂN TIỀN NHẤT:
  volumeClaimTemplates: # Mỗi khi đẻ ra 1 Pod Postgres mới, TỰ ĐỘNG đi mua 1 ổ cứng mới gắn vào nó.
    - metadata:
        name: postgres-data # Tên ổ cứng
      spec:
        accessModes: [ "ReadWriteOnce" ] # Chế độ đọc/ghi cho 1 máy
        resources:
          requests:
            storage: 5Gi # Xin cấp ngay 1 ổ cứng 5GB để chứa Database
```
Nhờ `volumeClaimTemplates`, dù Pod Postgres có bị K8s bắn bỏ đi chăng nữa, thì ổ cứng 5GB vẫn nằm nguyên đó. Khi Pod mới sinh ra, nó sẽ tự động được cắm lại ổ cứng cũ và toàn bộ dữ liệu người dùng vẫn còn nguyên!

### 🔍 Giải phẫu 5: `ingress.yml` (Phân luồng giao thông Internet)

Service chỉ liên lạc nội bộ. Để người ngoài vào được app, ta cần Ingress (Nginx).

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: / # Thủ thuật của Nginx
spec:
  ingressClassName: nginx # Bảo K8s hãy dùng Nginx làm bảo vệ
  rules:
    - host: placeholder.shop.local # Nếu người dùng gõ Domain này trên trình duyệt...
      http:
        paths:
          - path: /api # Nếu họ truy cập đường dẫn /api...
            pathType: Prefix
            backend:
              service:
                name: backend # Thì đá khách thẳng vào Service backend
                port:
                  number: 8080
          
          - path: / # Còn lại tất cả các đường dẫn khác...
            pathType: Prefix
            backend:
              service:
                name: frontend # Thì đá khách vào Service frontend
                port:
                  number: 80
```

### 🔍 Giải phẫu 6: `postgres-service.yml` (Headless Service - Bí mật của Database)

Database cần một loại Service đặc biệt. Nếu dùng Service thông thường, nó sẽ ném traffic lộn xộn vào các Pod theo kiểu quay vòng (Round-robin). Nhưng với Database, ta cần giao tiếp chính xác với 1 Pod cụ thể để đọc/ghi dữ liệu.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  clusterIP: None # ĐIỂM QUAN TRỌNG: Headless Service (Không tạo IP tổng đài chung)
  selector:
    app: postgres
  ports:
    - port: 5432
```
Khi cấu hình `clusterIP: None`, K8s sẽ KHÔNG tạo ra 1 IP ảo đứng giữa nữa. Thay vào đó, khi Backend gọi `postgres:5432`, hệ thống phân giải tên miền (DNS) của K8s sẽ trả về **trực tiếp IP thật** của cái Pod Postgres đang chạy.

### 🔍 Giải phẫu 7: `backend-deployment.yml` (Liveness vs Readiness Probe)

Trong file backend, tôi đã cấu hình 2 bài kiểm tra sức khỏe rất kỹ lưỡng (dựa trên thư viện Spring Boot Actuator) để đảm bảo Backend Java không bao giờ bị sập:

```yaml
          # 1. READINESS: Đã khởi động xong và sẵn sàng nhận khách chưa?
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
          
          # 2. LIVENESS: Còn sống hay đã chết đứng (Treo RAM)?
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
```
*   **Readiness (Sẵn sàng):** Nếu bài test này fail, K8s kết luận app đang bận xử lý nặng hoặc đang quá tải. K8s sẽ rút tên Pod này khỏi Service (giấu đi không cho khách mới vào), nhưng **không giết Pod**.
*   **Liveness (Sinh tồn):** Nếu bài test này fail, K8s kết luận app này đã bị treo cứng (deadlock). Nó sẽ **RÚT ĐIỆN VÀ KHỞI ĐỘNG LẠI** (Restart) cái Pod đó ngay lập tức để cứu hệ thống.

---

## 4. Cấp Độ Kỹ Sư Thực Thụ: Kustomize & Auto Scaling

Để tổ chức code chuẩn doanh nghiệp, chúng ta không copy-paste file. Chúng ta dùng `Kustomize`.

### 🔍 Giải phẫu 8: `kustomization.yml` (Phép thuật ghi đè)

Trong thư mục `overlays/production/`, file `kustomization.yml` là nơi quy tụ mọi thứ:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base # 1. Bê toàn bộ 10 file gốc ở thư mục base vào đây
  - hpa.yml    # 2. Cộng thêm file Auto-scaling (chỉ môi trường prod mới có)

namespace: shop-production # 3. Ép TẤT CẢ các file phải nằm trong không gian shop-production

patches: # 4. Kỹ thuật "Phẫu thuật thẩm mỹ" (Ghi Đè)
  - target:
      kind: Ingress
      name: shop-ingress
    patch: |-
      - op: replace
        path: /spec/rules/0/host
        value: shop.local # Đổi tên miền ảo thành tên miền thật (shop.local)
  - target:
      kind: Deployment
      name: backend
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 2 # Đổi số lượng Server Backend lên 2 máy để chạy khỏe hơn
```
Chỉ với 1 file vài chục dòng, bạn đã tạo ra một phiên bản Production hoàn toàn mới mẻ từ bộ xương gốc (Base). Sạch sẽ và cực kỳ chuyên nghiệp!

### 🔍 Giải phẫu 9: `hpa.yml` (Horizontal Pod Autoscaler - Tự động nhân bản)

Nằm trong thư mục `production`, đây là "vũ khí tối thượng" của K8s. Nó giúp bạn ngủ ngon vào ban đêm mà không lo sập server khi có sự kiện siêu sale.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2 # Lúc bình thường: Chạy 2 server
  maxReplicas: 5 # Lúc Sale đông khách: Tối đa được mướn 5 server
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70 # ĐIỀU KIỆN KÍCH HOẠT: Bất cứ khi nào CPU trung bình của các Pod vượt quá 70%, LẬP TỨC ĐẺ THÊM POD!
```
K8s sẽ liên tục đo đạc thông qua `metrics-server`. Khi lưu lượng truy cập giảm xuống (hết bão sale), K8s sẽ từ từ xóa bỏ các Pod dư thừa để trả lại tài nguyên RAM/CPU cho máy chủ.

Đó là toàn bộ "bí kíp võ công" để vận hành một hệ thống K8s chuẩn Production. Chúc mừng bạn đã hoàn thành khóa huấn luyện cường độ cao này! 🚀
