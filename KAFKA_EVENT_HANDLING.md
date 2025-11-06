# 🏢 Kafka Event Handling - Building Service

## 📋 Tổng quan

Building Service **CHỈ GỬI** events qua Kafka, **KHÔNG NHẬN** events từ Kafka. Building là entity cấp cao nhất, chỉ cần thông báo cho các service khác khi có thay đổi.

## 🎯 Các Event được GỬI

### **Building Events:**

#### **`building.created`**
```json
{
  "id": "building-uuid",
  "name": "Hotel ABC",
  "address": "123 Main Street",
  "images": "https://example.com/image.jpg",
  "city": "Ho Chi Minh",
  "country": "Vietnam",
  "description": "Luxury hotel in downtown",
  "longtitude": "106.6297",
  "latitude": "10.8231",
  "imagePublicId": "cloudinary-public-id",
  "roomsCount": 0,
  "createdAt": "2025-01-07T10:00:00Z",
  "updatedAt": "2025-01-07T10:00:00Z"
}
```

#### **`building.updated`**
```json
{
  "id": "building-uuid",
  "name": "Hotel ABC Updated",
  "address": "123 Main Street Updated",
  "images": "https://example.com/new-image.jpg",
  "city": "Ho Chi Minh",
  "country": "Vietnam",
  "description": "Updated luxury hotel",
  "longtitude": "106.6297",
  "latitude": "10.8231",
  "imagePublicId": "new-cloudinary-public-id",
  "roomsCount": 0,
  "createdAt": "2025-01-07T10:00:00Z",
  "updatedAt": "2025-01-07T11:00:00Z"
}
```

#### **`building.deleted`**
```json
{
  "id": "building-uuid"
}
```

## 🔄 Luồng hoạt động

### **Scenario 1: Tạo Building mới**
```
1. User tạo building → POST /buildings
2. Building Service tạo building → building.created event
3. Các service khác nhận event → Update cache/indexes
```

### **Scenario 2: Cập nhật Building**
```
1. User update building → PUT /buildings/:id
2. Building Service update building → building.updated event
3. Các service khác nhận event → Update cache/indexes
```

### **Scenario 3: Xóa Building**
```
1. User xóa building → DELETE /buildings/:id
2. Building Service xóa building → building.deleted event
3. Các service khác nhận event → Cleanup related data
```

## 🚫 Tại sao KHÔNG nhận events?

### **Building Service không cần nhận:**

#### **❌ Booking Events:**
- `booking.created` → Room Service đã handle
- `booking.canceled` → Room Service đã handle
- Building không cần biết chi tiết booking

#### **❌ Payment Events:**
- `payment.success` → Payment Service handle
- `payment.failed` → Payment Service handle
- Building không liên quan đến payment

#### **❌ Room Events:**
- `room.created` → Room Service gửi
- `room.updated` → Room Service gửi
- `room.deleted` → Room Service gửi
- Building chỉ cần biết qua database queries

## 🏗️ Architecture

### **Building Service Role:**
```
┌─────────────────┐
│ Building Service│
│                 │
│ ✅ CRUD Building│
│ ✅ Upload Images│
│ ✅ Send Events  │
│ ❌ No Consumer  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Kafka Producer  │
│                 │
│ building.created │
│ building.updated │
│ building.deleted │
└─────────────────┘
```

### **Other Services nhận Building Events:**
- **Room Service** → Update room building references
- **Search Service** → Update search indexes
- **Cache Service** → Update cached building data
- **Analytics Service** → Track building statistics

## 🛠️ Implementation

### **KafkaProducerService Methods:**
```typescript
// Building events
async emitBuildingCreatedEvent(payload: any) {
  await this.kafkaClient.emit(KafkaTopics.BUILDING_CREATED, payload);
}

async emitBuildingUpdatedEvent(payload: any) {
  await this.kafkaClient.emit(KafkaTopics.BUILDING_UPDATED, payload);
}

async emitBuildingDeletedEvent(payload: any) {
  await this.kafkaClient.emit(KafkaTopics.BUILDING_DELETED, payload);
}
```

### **BuildingService Integration:**
```typescript
// Create building
const building = await this.prisma.building.create({...});
await this.kafkaProducer.emitBuildingCreatedEvent(building);

// Update building  
const building = await this.prisma.building.update({...});
await this.kafkaProducer.emitBuildingUpdatedEvent(building);

// Delete building
await this.prisma.building.delete({...});
await this.kafkaProducer.emitBuildingDeletedEvent({ id });
```

## 📊 Kafka Topics

### **Building Service Topics:**
```typescript
export enum KafkaTopics {
  // Building events (GỬI)
  BUILDING_CREATED = 'building.created',
  BUILDING_UPDATED = 'building.updated', 
  BUILDING_DELETED = 'building.deleted',
  
  // Other topics (KHÔNG SỬ DỤNG)
  BOOKING_CREATED = 'booking.created',
  BOOKING_CANCELED = 'booking.canceled',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
  ROOM_CREATED = 'room.created',
  ROOM_UPDATED = 'room.updated',
  ROOM_DELETED = 'room.deleted',
  USER_REGISTERED = 'user.registered',
  USER_UPDATED = 'user.updated',
  NOTIFICATION_SENT = 'notification.sent',
  REVIEW_CREATED = 'review.created',
  REVIEW_UPDATED = 'review.updated',
  PAYMENT_STATUS_UPDATED = 'payment.status.updated',
}
```

## 🧪 Testing

### **Test Building Events:**

#### **1. Test building.created:**
```bash
# Tạo building qua API
POST /buildings
{
  "name": "Test Hotel",
  "address": "Test Address"
}

# Kết quả mong đợi:
# ✅ Building created: building-uuid
# ✅ Kafka event: building.created
```

#### **2. Test building.updated:**
```bash
# Update building qua API
PUT /buildings/building-uuid
{
  "name": "Updated Hotel"
}

# Kết quả mong đợi:
# ✅ Building updated: building-uuid
# ✅ Kafka event: building.updated
```

#### **3. Test building.deleted:**
```bash
# Xóa building qua API
DELETE /buildings/building-uuid

# Kết quả mong đợi:
# ✅ Building deleted: building-uuid
# ✅ Kafka event: building.deleted
```

## 📝 Logs mẫu

```
✅ Building created: building-uuid-123
📤 [Kafka] Building created event sent: { id: "building-uuid-123", name: "Hotel ABC" }

✅ Building updated: building-uuid-123  
📤 [Kafka] Building updated event sent: { id: "building-uuid-123", name: "Hotel ABC Updated" }

✅ Building deleted: building-uuid-123
📤 [Kafka] Building deleted event sent: { id: "building-uuid-123" }
```

## ⚙️ Configuration

### **Environment Variables:**
```env
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=building-service
KAFKA_GROUP_ID=building-group
```

### **Module Structure:**
```typescript
@Module({
  imports: [
    PrismaModule,
    KafkaModule, // Chỉ có Producer, không có Consumer
    MulterModule.register({...}),
  ],
  controllers: [BuildingController],
  providers: [BuildingService, PrismaService, UploadService],
})
export class BuildingsModule {}
```

## 🚀 Benefits

1. **Simplicity:** Building Service chỉ focus vào CRUD operations
2. **Performance:** Không cần consume events, giảm overhead
3. **Clarity:** Role rõ ràng - Building chỉ gửi events
4. **Scalability:** Có thể scale độc lập với các service khác
5. **Maintainability:** Code đơn giản, dễ maintain

## 🔄 Integration với các Service khác

### **Building Service → Other Services:**
- **Room Service** nhận `building.created` → Tạo rooms cho building mới
- **Search Service** nhận `building.updated` → Update search indexes
- **Cache Service** nhận `building.deleted` → Remove from cache
- **Analytics Service** nhận tất cả events → Track building statistics

### **Other Services → Building Service:**
- **Không có** - Building Service không nhận events từ service khác
- **Database queries** - Các service khác query building data trực tiếp
- **API calls** - Các service khác gọi Building Service APIs nếu cần
