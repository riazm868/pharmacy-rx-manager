# API Documentation - Pharmacy RX Manager

## Overview

All API endpoints are available under `/api/` and follow RESTful conventions. Currently, the API does not require authentication but this will be added in future versions.

## Base URL

- Development: `http://localhost:3004/api`
- Production: `https://your-domain.com/api`

## Endpoints

### Patients

#### Get All Patients
```
GET /api/patients
```

**Query Parameters:**
- `search` (optional): Search patients by name, phone, or ID number

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "dob": "1980-01-01",
    "gender": "Male",
    "id_number": "123456789",
    "phone": "555-0123",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Patient
```
POST /api/patients
```

**Request Body:**
```json
{
  "name": "John Doe",
  "dob": "1980-01-01",
  "gender": "Male",
  "id_number": "123456789",
  "phone": "555-0123",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "zip": "12345"
}
```

### Medications

#### Get All Medications
```
GET /api/medications
```

**Query Parameters:**
- `search` (optional): Search medications by name

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Amoxicillin",
    "strength": "500mg",
    "count": 100,
    "lightspeed_item_id": "12345",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Lightspeed Integration

#### OAuth Callback
```
GET /api/lightspeed/auth
```

**Query Parameters:**
- `code`: Authorization code from Lightspeed
- `state`: State parameter for security

**Description:** Handles OAuth callback from Lightspeed and exchanges code for access token.

#### Sync Products
```
POST /api/lightspeed/sync
```

**Request Body:**
```json
{
  "accountId": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "itemsSynced": 42,
  "message": "Successfully synced 42 items from Lightspeed"
}
```

**Description:** Fetches products from Lightspeed and updates local medication inventory.

### Print Server

#### Test Connection
```
GET /api/test-connection
```

**Response:**
```json
{
  "status": "online",
  "printers": ["Zebra GK420D", "PDF Printer"],
  "message": "Print server is accessible"
}
```

#### Check Print Server Status
```
POST /api/test-connection
```

**Request Body:**
```json
{
  "url": "http://192.168.1.100:5000"
}
```

**Response:**
```json
{
  "online": true,
  "printers": ["Zebra GK420D"]
}
```

### Debug Endpoints (Development Only)

#### Memory Store Status
```
GET /api/debug/memory-store
```

**Response:**
```json
{
  "tokens": {
    "hasTokens": true,
    "tokenCount": 1
  },
  "syncStatus": {
    "lastSync": "2024-01-01T00:00:00Z",
    "itemsSynced": 42
  }
}
```

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)",
  "code": "ERROR_CODE (optional)"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required (future)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently no rate limiting is implemented. This will be added in future versions.

## CORS

CORS is enabled for all origins in development. Production will restrict to specific domains.

## Future Enhancements

1. **Authentication**: JWT-based authentication for all endpoints
2. **Pagination**: Add pagination support for list endpoints
3. **Filtering**: Advanced filtering options for all resources
4. **Webhooks**: Real-time notifications for inventory changes
5. **Batch Operations**: Support for bulk create/update operations
6. **API Versioning**: Implement versioned endpoints (e.g., `/api/v1/`)

## Examples

### Search for Patients
```bash
curl "http://localhost:3004/api/patients?search=john"
```

### Create a New Medication
```bash
curl -X POST "http://localhost:3004/api/medications" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ibuprofen",
    "strength": "200mg",
    "count": 500
  }'
```

### Sync with Lightspeed
```bash
curl -X POST "http://localhost:3004/api/lightspeed/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "123456"
  }'
``` 