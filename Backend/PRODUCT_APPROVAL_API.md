# Product Approval System - API Documentation

## Overview
This implementation adds a product approval system where all products are set to PENDING status by default, and only ADMIN users can approve or decline products.

## Changes Made

### 1. Database & Model
- **Product.java** - Already has `ProductStatus` enum with values: PENDING, APPROVED, DECLINED
- All new products are automatically set to PENDING status

### 2. Repository Layer
**ProductRepo.java** - Added new queries:
- `getProductsByStatus(ProductStatus status)` - Get products by specific status
- `getPendingProducts()` - Get all pending products

### 3. Service Layer
**ProductService.java** - Added admin approval methods:
- `getPendingProducts()` - Retrieve all pending products
- `getProductsByStatus(ProductStatus status)` - Get products by status
- `approveProduct(int productId, int adminId)` - Approve a product
- `declineProduct(int productId, int adminId)` - Decline a product
- `updateProductStatus(int productId, ProductStatus status, int adminId)` - Generic status update

### 4. Controller Layer

#### AdminController.java (NEW)
Admin-only endpoints for product approval:

**GET** `/api/v1/admin/products/pending`
- Returns all products with PENDING status
- Requires ADMIN role

**GET** `/api/v1/admin/products/status/{status}`
- Returns products filtered by status (PENDING/APPROVED/DECLINED)
- Requires ADMIN role

**PUT** `/api/v1/admin/products/{productId}/approve`
- Approves a product
- Requires ADMIN role
- Request body: `{"adminId": 1}`

**PUT** `/api/v1/admin/products/{productId}/decline`
- Declines a product
- Requires ADMIN role
- Request body: `{"adminId": 1}`

**PUT** `/api/v1/admin/products/{productId}/status`
- Updates product status to any value
- Requires ADMIN role
- Request body: `{"adminId": 1, "status": "APPROVED"}`

#### ProductController.java (UPDATED)
Public endpoints now filter by approval status:

**GET** `/api/v1/products`
- Now returns only APPROVED products by default
- Add `?includeAll=true` to see all products (for authenticated users)

**GET** `/api/v1/products/category/{category}`
- Now returns only APPROVED products by default
- Add `?includeAll=true` to see all products

### 5. DTO Layer
**ProductStatusUpdateRequest.java** (NEW)
```json
{
  "adminId": 1,
  "status": "APPROVED"  // Optional: PENDING, APPROVED, or DECLINED
}
```

**ProductResponseDTO.java**
- Now includes `productStatus` field in response

## API Usage Examples

### 1. Seller adds a product (Status: PENDING by default)
```
POST /api/v1/products/add-product
Content-Type: multipart/form-data

productRequest: {
  "sellerId": 2,
  "productModel": "Classic Car",
  "modelYear": 1965,
  "startPrice": 50000,
  "priceJump": 1000,
  "description": "Vintage classic car",
  "auctionDate": "2025-12-01",
  "auctionStartTime": "10:00:00",
  "auctionDuration": 60,
  "category": "Classic"
}
mainImage: [file]
additionalImages: [file1, file2]
```

Response:
```json
{
  "productId": 1,
  "sellerId": 2,
  "productModel": "Classic Car",
  "productStatus": "PENDING",
  ...
}
```

### 2. Admin views pending products
```
GET /api/v1/admin/products/pending
Authorization: Bearer {admin_token}
```

Response:
```json
[
  {
    "productId": 1,
    "productStatus": "PENDING",
    ...
  }
]
```

### 3. Admin approves a product
```
PUT /api/v1/admin/products/1/approve
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "adminId": 1
}
```

Response:
```json
{
  "productId": 1,
  "productStatus": "APPROVED",
  "updatedAt": "2025-11-05",
  "updatedBy": 1,
  ...
}
```

### 4. Admin declines a product
```
PUT /api/v1/admin/products/1/decline
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "adminId": 1
}
```

### 5. Public views approved products only
```
GET /api/v1/products
```

Returns only products with APPROVED status.

### 6. Seller views their own products (including pending/declined)
```
GET /api/v1/products/seller/2
Authorization: Bearer {seller_token}
```

Returns all products for that seller regardless of status.

## Security Notes

1. **@PreAuthorize("hasRole('ADMIN')")** - Ensures only ADMIN users can access approval endpoints
2. All products default to PENDING status when created
3. Public endpoints only show APPROVED products
4. Sellers can see their own products regardless of status
5. Only ADMIN can change product status

## Database Updates Required

Make sure your products table has the `product_status` column:
```sql
ALTER TABLE products 
ADD COLUMN product_status VARCHAR(20) DEFAULT 'PENDING';
```

Or ensure your JPA auto-creates it properly with the enum.

## Testing Checklist

- [ ] Seller can add product (should be PENDING)
- [ ] Public cannot see PENDING products
- [ ] Admin can view pending products
- [ ] Admin can approve product
- [ ] Admin can decline product
- [ ] Public can see APPROVED products
- [ ] Public cannot see DECLINED products
- [ ] Seller can see their own products (all statuses)
- [ ] Non-admin users cannot access admin endpoints

