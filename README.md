# PIN Module Documentation

## Overview

The PIN module provides functionality for managing Personal Identification Numbers (PINs) for organizers in the Radar system. It handles PIN creation, storage, and recovery operations with secure password hashing.

## Model

### Pin Model

The `Pin` model stores PIN information associated with organizer emails.

**Fields:**
- `pin` (CharField, max_length=255): The hashed PIN value
- `Email` (EmailField, max_length=150): The organizer's email address

**Features:**
- Automatic password hashing on save using Django's `make_password`
- Prevents double-hashing by checking if PIN is already hashed
- String representation returns email and PIN

**Example:**
```python
from radar.PIN.models import Pin

# Create a new PIN
pin = Pin.objects.create(
    Email='organizer@example.com',
    pin='1234'
)
# PIN is automatically hashed before saving
```

## API Endpoints

### 1. Create/Set PIN

**Endpoint:** `POST /pin/`

**Description:** Creates or updates a PIN for an organizer. The organizer must exist in the system.

**Request Body:**
```json
{
    "Email": "organizer@example.com",
    "pin": "1234"
}
```

**Success Response (201 Created):**
```json
{
    "Message": "PIN saved successfully!"
}
```

**Error Responses:**
- `400 Bad Request`: If organizer does not exist or validation fails
  ```json
  {
      "Message": "Organizer does not exist"
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/pin/ \
  -H "Content-Type: application/json" \
  -d '{"Email": "organizer@example.com", "pin": "1234"}'
```

---

### 2. Forgot PIN

**Endpoint:** `POST /forgot-pin/`

**Description:** Initiates the PIN recovery process by sending a PIN change link to the organizer's email.

**Request Body:**
```json
{
    "Email": "organizer@example.com"
}
```

**Success Response (200 OK):**
```json
{
    "message": "PIN change link sent to email.",
    "email": "organizer@example.com"
}
```

**Error Responses:**
- `400 Bad Request`: If organizer does not exist
  ```json
  {
      "Message": "Organizer does not exist"
  }
  ```
- `500 Internal Server Error`: If email sending fails
  ```json
  {
      "error": "Failed to send PIN change email. Please try again."
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/forgot-pin/ \
  -H "Content-Type: application/json" \
  -d '{"Email": "organizer@example.com"}'
```

**Notes:**
- Sends an email with a redirect link to the change-pin endpoint
- Uses OTP generation (6-digit random number)
- Logs email sending status for debugging

---

### 3. Change PIN

**Endpoint:** `POST /change-pin/`

**Description:** Changes an existing PIN for an organizer. Requires both new PIN and confirmation.

**Request Body:**
```json
{
    "Email": "organizer@example.com",
    "Pin": "5678",
    "ConfirmPin": "5678"
}
```

**Success Response (201 Created):**
```json
{
    "Message": "New PIN saved successfully!"
}
```

**Error Responses:**
- `400 Bad Request`: If organizer does not exist
  ```json
  {
      "Message": "Organizer does not exist"
  }
  ```
- `400 Bad Request`: If PINs do not match
  ```json
  {
      "Message": "New PIN and Confirm PIN do not match"
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/change-pin/ \
  -H "Content-Type: application/json" \
  -d '{
    "Email": "organizer@example.com",
    "Pin": "5678",
    "ConfirmPin": "5678"
  }'
```

**Notes:**
- Uses `update_or_create` to handle both new and existing PINs
- Automatically hashes the new PIN before saving
- Validates that new PIN and confirmation PIN match

---

## Security Features

1. **Password Hashing**: All PINs are automatically hashed using Django's `pbkdf2_sha256` algorithm before storage
2. **Double-Hash Prevention**: The model checks if a PIN is already hashed before re-hashing
3. **Email Verification**: All operations require the organizer to exist in the system
4. **PIN Confirmation**: Change PIN endpoint requires confirmation to prevent typos

## Serializers

### PinSerializer

Serializes PIN data for API requests and responses.

**Fields:**
- `pin`: The PIN value
- `Email`: The organizer's email

**Usage:**
```python
from radar.PIN.serializers import PinSerializer

serializer = PinSerializer(data={'Email': 'user@example.com', 'pin': '1234'})
if serializer.is_valid():
    serializer.save()
```

## Admin Interface

The `Pin` model is registered in Django admin, allowing administrators to:
- View all PINs
- Edit PIN records
- Delete PIN records

Access at: `/admin/PIN/pin/`

## Dependencies

- `django.contrib.auth.hashers`: For password hashing
- `rest_framework`: For API views and serializers
- `radar.auth.models`: For OrganizerRegistration and StudentRegistration models
- `radar.auth.gmail_utils`: For sending PIN change emails

## Error Handling

All endpoints include comprehensive error handling:
- Validates organizer existence before operations
- Returns descriptive error messages
- Uses appropriate HTTP status codes
- Logs important events (email sending, errors)

## Logging

The module uses Python's logging framework with logger name `radar.PIN`:
- Logs email sending failures
- Logs successful email deliveries
- Helps with debugging and monitoring

## Testing

The `tests.py` file is currently empty. Consider adding tests for:
- PIN creation and validation
- PIN hashing functionality
- Email sending in forgot PIN flow
- PIN change with matching/not matching PINs
- Error cases (non-existent organizer, etc.)

## URL Configuration

The PIN URLs are configured in `urls.py`:
- `/pin/` → `PinView`
- `/forgot-pin/` → `ForgotPinView`
- `/change-pin/` → `ChangePinView`

Make sure these URLs are included in your main `urls.py` configuration.

