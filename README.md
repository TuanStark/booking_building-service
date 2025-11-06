# 🏢 Building Service

Service quản lý tòa nhà (buildings) cho hệ thống Dorm Booking System. Service này xử lý CRUD operations cho buildings, upload ảnh lên Cloudinary, và publish events lên Kafka.

## 🚀 Tính năng

### **Building Management**
- ✅ Tạo building mới
- ✅ Lấy danh sách buildings
- ✅ Lấy building theo ID
- ✅ Cập nhật building
- ✅ Xóa building
- ✅ Upload ảnh building lên Cloudinary
- ✅ Lọc và phân trang

### **Integration**
- ✅ Kafka event publishing (building.created, building.updated, building.deleted)
- ✅ Cloudinary integration (image upload)
- ✅ External service calls

### **Features**
- ✅ Image upload với validation
- ✅ File size limit (5MB)
- ✅ Image format validation (jpg, jpeg, png, gif)
- ✅ Helmet security headers

## 📁 Cấu trúc thư mục

```
src/
├── modules/
│   ├── buildings/        # Building module
│   │   ├── dto/         # Data Transfer Objects
│   │   ├── buildings.controller.ts
│   │   ├── buildings.service.ts
│   │   └── buildings.module.ts
│   └── kafka/           # Kafka integration
│       ├── kafka.module.ts
│       ├── kafka.producer.service.ts
│       └── kafka-topics.enum.ts
├── utils/
│   └── uploads.service.ts  # Cloudinary upload service
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── prisma.service.ts
└── main.ts
```

## ⚙️ Cấu hình

### **Environment Variables**

Tạo file `.env` trong thư mục root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/building_db"

# Application
PORT=3003
NODE_ENV=development

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=building-service
KAFKA_GROUP_ID=building-service-group

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Upload Settings
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif
```

## 🚀 Cài đặt và chạy

### **Yêu cầu**
- Node.js 18+
- PostgreSQL
- Kafka
- Cloudinary account

### **Cài đặt**

```bash
# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn

# Chạy database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### **Chạy development**

```bash
npm run start:dev
# hoặc
npm run dev
```

### **Build và chạy production**

```bash
# Build
npm run build

# Chạy production
npm run start:prod
```

## 📡 API Endpoints

### **Building Management**

#### `POST /buildings`
Tạo building mới với ảnh

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `name`: string (required)
  - `address`: string (required)
  - `description`: string (optional)
  - `image`: File (required, max 5MB, jpg/jpeg/png/gif)

**Example (curl):**
```bash
curl -X POST http://localhost:3003/buildings \
  -F "name=Building A" \
  -F "address=123 Main St" \
  -F "description=Nice building" \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "id": "building-uuid",
  "name": "Building A",
  "address": "123 Main St",
  "description": "Nice building",
  "imageUrl": "https://cloudinary.com/image.jpg",
  "imagePublicId": "cloudinary-public-id",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### `GET /buildings`
Lấy danh sách buildings (với phân trang)

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số items mỗi trang (default: 10)
- `search`: Tìm kiếm theo name hoặc address

**Example:**
```
GET /buildings?page=1&limit=10&search=Building
```

#### `GET /buildings/:id`
Lấy building theo ID

#### `PATCH /buildings/:id`
Cập nhật building

**Request:**
- Content-Type: `multipart/form-data` (nếu có ảnh) hoặc `application/json`
- Body: Các fields cần cập nhật

**Example:**
```json
{
  "name": "Updated Building Name",
  "address": "456 New St",
  "description": "Updated description"
}
```

#### `DELETE /buildings/:id`
Xóa building

## 🔄 Kafka Events

Service publish các events sau lên Kafka:

### **building.created**
Khi building mới được tạo

```json
{
  "buildingId": "building-uuid",
  "name": "Building A",
  "address": "123 Main St",
  "imageUrl": "https://cloudinary.com/image.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### **building.updated**
Khi building được cập nhật

### **building.deleted**
Khi building bị xóa

## 📝 Database Schema

Service sử dụng Prisma ORM. Xem file `prisma/schema.prisma` để biết chi tiết schema.

### **Main Models:**
- `Building` - Thông tin building

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 Tài liệu thêm

- [KAFKA_EVENT_HANDLING.md](./KAFKA_EVENT_HANDLING.md) - Chi tiết về Kafka events

## 🐳 Docker

```bash
# Build image
docker build -t building-service .

# Run với docker-compose
docker-compose up
```

## 🔒 Security

- Helmet security headers
- File upload validation
- File size limits
- File type validation
- Input validation với class-validator
- SQL injection protection (Prisma)

## 📝 Notes

- Service hỗ trợ upload ảnh lên Cloudinary
- Body parser được cấu hình với limit 100MB để hỗ trợ upload file lớn
- Ảnh được validate về format và size trước khi upload
- Kafka events được publish tự động khi có thay đổi

## 📄 License

MIT
