# Transactions API Documentation

## Overview
The Transactions app manages all financial operations of the system with support for revenue tracking and expense categorization.

## Model Architecture

### Transaction Model

**Fields:**
- `id` (AutoField): Primary key
- `type` (CharField): REVENU or DEPENSE
- `categorie` (CharField): Required only for DEPENSE (ENTRETIEN, ASSURANCE, REPARATION, CARBURANT, AUTRE)
- `montant` (DecimalField): Transaction amount (must be positive)
- `description` (TextField): Optional transaction description
- `date` (DateTimeField): Transaction creation date (auto)
- `reservation` (ForeignKey): Link to Reservation (optional, nullable)
- `voiture` (ForeignKey): Link to Voiture (optional, nullable)
- `created_at` (DateTimeField): Record creation timestamp
- `updated_at` (DateTimeField): Record last update timestamp

**Business Rules:**
1. If `type = REVENU` → `categorie` must be null
2. If `type = DEPENSE` → `categorie` is required
3. `montant` must always be positive
4. If linked to `reservation` → `type` must be REVENU

---

## API Endpoints

### Base URL
```
http://localhost:8000/api/transactions/
```

### 1. List Transactions

**Endpoint:**
```
GET /api/transactions/
```

**Query Parameters:**
- `type` (optional): Filter by type (REVENU, DEPENSE)
- `categorie` (optional): Filter by category
- `voiture` (optional): Filter by vehicle ID
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)
- `ordering` (optional): Order by field (date, montant, type) - prefix with `-` for desc
- `search` (optional): Search in description or client name

**Request:**
```bash
curl -X GET "http://localhost:8000/api/transactions/?type=REVENU&ordering=-date" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Response:**
```json
{
    "count": 5,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "type": "REVENU",
            "type_display": "Revenue",
            "categorie": null,
            "categorie_display": null,
            "montant": "1500.00",
            "description": "Revenue from reservation: Ali Smaïl - AA123456",
            "date": "2026-02-15T10:30:00Z",
            "reservation": 1,
            "reservation_details": {
                "id": 1,
                "nom_client": "Ali Smaïl",
                "voiture": "AA123456 Toyota Corolla",
                "prix_total": "1500.00"
            },
            "voiture": 1,
            "voiture_details": {
                "id": 1,
                "matricule": "AA123456",
                "marque": "Toyota",
                "modele": "Corolla"
            },
            "created_at": "2026-02-15T10:30:00Z",
            "updated_at": "2026-02-15T10:30:00Z"
        }
    ]
}
```

---

### 2. Create Transaction

**Endpoint:**
```
POST /api/transactions/
```

**Request Body:**
```json
{
    "type": "DEPENSE",
    "categorie": "CARBURANT",
    "montant": "250.50",
    "description": "Fuel for vehicle AA123456",
    "voiture": 1,
    "reservation": null
}
```

**Response (201 Created):**
```json
{
    "id": 5,
    "type": "DEPENSE",
    "type_display": "Expense",
    "categorie": "CARBURANT",
    "categorie_display": "Fuel",
    "montant": "250.50",
    "description": "Fuel for vehicle AA123456",
    "date": "2026-02-15T11:00:00Z",
    "reservation": null,
    "reservation_details": null,
    "voiture": 1,
    "voiture_details": {
        "id": 1,
        "matricule": "AA123456",
        "marque": "Toyota",
        "modele": "Corolla"
    },
    "created_at": "2026-02-15T11:00:00Z",
    "updated_at": "2026-02-15T11:00:00Z"
}
```

**Validation Errors:**
```json
{
    "montant": ["Amount must be positive."],
    "categorie": ["Category is required for DEPENSE type."]
}
```

---

### 3. Retrieve Transaction

**Endpoint:**
```
GET /api/transactions/{id}/
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/transactions/1/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
    "id": 1,
    "type": "REVENU",
    "type_display": "Revenue",
    "categorie": null,
    "categorie_display": null,
    "montant": "1500.00",
    "description": "Revenue from reservation: Ali Smaïl - AA123456",
    "date": "2026-02-15T10:30:00Z",
    "reservation": 1,
    "reservation_details": {
        "id": 1,
        "nom_client": "Ali Smaïl",
        "voiture": "AA123456 Toyota Corolla",
        "prix_total": "1500.00"
    },
    "voiture": 1,
    "voiture_details": {
        "id": 1,
        "matricule": "AA123456",
        "marque": "Toyota",
        "modele": "Corolla"
    },
    "created_at": "2026-02-15T10:30:00Z",
    "updated_at": "2026-02-15T10:30:00Z"
}
```

---

### 4. Update Transaction

**Endpoint:**
```
PATCH /api/transactions/{id}/
PUT /api/transactions/{id}/
```

**PATCH (Partial Update):**
```bash
curl -X PATCH "http://localhost:8000/api/transactions/5/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated fuel expense",
    "montant": "300.00"
  }'
```

**Response (200 OK):**
```json
{
    "id": 5,
    "type": "DEPENSE",
    "type_display": "Expense",
    "categorie": "CARBURANT",
    "categorie_display": "Fuel",
    "montant": "300.00",
    "description": "Updated fuel expense",
    "date": "2026-02-15T11:00:00Z",
    "reservation": null,
    "reservation_details": null,
    "voiture": 1,
    "voiture_details": {
        "id": 1,
        "matricule": "AA123456",
        "marque": "Toyota",
        "modele": "Corolla"
    },
    "created_at": "2026-02-15T11:00:00Z",
    "updated_at": "2026-02-15T11:15:00Z"
}
```

---

### 5. Delete Transaction

**Endpoint:**
```
DELETE /api/transactions/{id}/
```

**Permissions:** Admin only

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/transactions/5/" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:** 204 No Content

---

## Custom Actions

### 6. Financial Summary

**Endpoint:**
```
GET /api/transactions/summary/
```

**Description:** Returns overall financial summary with total revenue, expenses, and profit.

**Response:**
```json
{
    "total_revenu": 5500.00,
    "total_depense": 1200.50,
    "profit": 4299.50,
    "transaction_count": 8,
    "currency": "DA"
}
```

**Query Parameters:**
- `type` (optional): Filter summary by type
- `voiture` (optional): Summary for specific vehicle
- `date_from` (optional): Summary from date
- `date_to` (optional): Summary to date

**Example with filters:**
```bash
curl -X GET "http://localhost:8000/api/transactions/summary/?type=DEPENSE&date_from=2026-01-01&date_to=2026-02-15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. Monthly Statistics

**Endpoint:**
```
GET /api/transactions/monthly-stats/
```

**Description:** Returns revenue, expenses, and profit grouped by month.

**Response:**
```json
{
    "monthly_stats": [
        {
            "month": "2026-02",
            "total_revenu": 3000.00,
            "total_depense": 600.00,
            "profit": 2400.00,
            "transaction_count": 4
        },
        {
            "month": "2026-01",
            "total_revenu": 2500.00,
            "total_depense": 600.50,
            "profit": 1899.50,
            "transaction_count": 4
        }
    ],
    "currency": "DA"
}
```

**Query Parameters:**
- `type` (optional): Filter by type
- `voiture` (optional): Monthly stats for specific vehicle
- `categorie` (optional): Monthly stats for specific expense category

---

### 8. Transactions by Vehicle

**Endpoint:**
```
GET /api/transactions/by-voiture/{voiture_id}/
```

**Description:** Returns all transactions for a specific vehicle with summary.

**Example:**
```bash
curl -X GET "http://localhost:8000/api/transactions/by-voiture/1/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
    "voiture_id": "1",
    "transactions": [
        {
            "id": 1,
            "type": "REVENU",
            "type_display": "Revenue",
            "categorie": null,
            "categorie_display": null,
            "montant": "1500.00",
            "description": "Revenue from reservation: Ali Smaïl - AA123456",
            "date": "2026-02-15T10:30:00Z",
            "reservation": 1,
            "reservation_details": {
                "id": 1,
                "nom_client": "Ali Smaïl",
                "voiture": "AA123456 Toyota Corolla",
                "prix_total": "1500.00"
            },
            "voiture": 1,
            "voiture_details": {
                "id": 1,
                "matricule": "AA123456",
                "marque": "Toyota",
                "modele": "Corolla"
            },
            "created_at": "2026-02-15T10:30:00Z",
            "updated_at": "2026-02-15T10:30:00Z"
        }
    ],
    "summary": {
        "total_revenu": 1500.00,
        "total_depense": 250.50,
        "profit": 1249.50,
        "transaction_count": 2
    }
}
```

**Error Response (404):**
```json
{
    "detail": "No transactions found for this vehicle."
}
```

---

## Filtering & Querying Examples

### Filter by Type and Date Range
```bash
curl -X GET "http://localhost:8000/api/transactions/?type=DEPENSE&date_from=2026-01-01&date_to=2026-02-15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Category and Vehicle
```bash
curl -X GET "http://localhost:8000/api/transactions/?categorie=ENTRETIEN&voiture=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search and Order
```bash
curl -X GET "http://localhost:8000/api/transactions/?search=fuel&ordering=-montant" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Combined Filters
```bash
curl -X GET "http://localhost:8000/api/transactions/?type=DEPENSE&categorie=CARBURANT&voiture=1&date_from=2026-01-01&ordering=-date" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Automatic Revenue Creation

When a Reservation is created, a REVENU transaction is automatically created with:
- `type`: REVENU
- `montant`: reservation.prix_total
- `reservation`: Link to the created reservation
- `voiture`: Link to the reservation's vehicle
- `description`: "Revenue from reservation: {client_name} - {vehicle_matricule}"

**No manual action needed** - the transaction is created automatically via Django signals.

---

## Authentication

All endpoints require authentication via token or session.

**Set Authorization Header:**
```bash
curl -X GET "http://localhost:8000/api/transactions/" \
  -H "Authorization: Token YOUR_AUTH_TOKEN"
```

---

## Permissions

- **List, Create, Retrieve, Update**: IsAuthenticated (any logged-in user)
- **Delete**: IsAuthenticated + IsAdminUser (admin only)

---

## Error Handling

### 400 Bad Request
```json
{
    "montant": ["Amount must be positive."],
    "categorie": ["Category is required for DEPENSE type."]
}
```

### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
    "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
    "detail": "Not found."
}
```

---

## Best Practices

1. **Always use select_related()** - Queries use select_related for optimization
2. **Filter large datasets** - Use date_from, date_to, and type filters
3. **Check permissions** - Delete operations require admin privileges
4. **Validate amounts** - Amounts must be positive (enforced server-side)
5. **Business rule enforcement** - Type/category relationship validated automatically
6. **Use decimal format** - Always use strings for decimal fields in JSON

---

## Database Indexes

The Transaction model includes indexes for efficient querying:
- `(type, date)` - Fast filtering by type and date range
- `(voiture, date)` - Fast filtering by vehicle and date
- `reservation` - Fast lookup of reservation transactions

---

## Aggregation & Performance

All statistics endpoints use Django ORM aggregation for performance:
- `Sum()` for total calculations
- `TruncMonth()` for monthly grouping
- No N+1 query issues due to careful use of select_related
- Optimized for large datasets

---

## Admin Interface

Access the admin panel at:
```
http://localhost:8000/admin/transactions/transaction/
```

Features:
- List display with formatted amounts and dates
- Filter by type, category, date, and vehicle
- Search by description, client name, or vehicle
- Readonly financial summary
- Delete restricted to superusers
- Date hierarchy navigation
