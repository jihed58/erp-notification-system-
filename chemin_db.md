# Database Schema – ERP Notification System

## Overview
The schema stores users and alert rules that drive the notification engine.

## Collections

### User
| Field        | Type   | Required? | Notes |
|--------------|--------|-----------|-------|
| `name`       | String | Yes       | Full name |
| `email`      | String | Yes       | Unique |
| `passwordHash`| String| Yes       | Hashed with bcrypt |
| `role`       | String | Yes       | |
| `createdAt`  | Date   | Auto      | |
| `updatedAt`  | Date   | Auto      | |

### AlertRule
| Field        | Type                | Required? | Notes |
|--------------|---------------------|-----------|-------|
| `name`       | String              | Yes       | Readable label |
| `module`     | String              | Yes       | ERP module (`inventory`, `finance`, …) |
| `conditions` | Array of sub‑docs   | Yes       | Trigger logic |
| `channels`   | Array<String>       | Yes       | `email`, `inapp`, `webhook` |
| `isActive`   | Boolean             | Yes       | Default `true` |
| `createdBy`  | ObjectId (ref `User`) | Yes     | Reference to creator |
| `createdAt`  | Date                | Auto      | |
| `updatedAt`  | Date                | Auto      | |

## ER Diagram
```mermaid
erDiagram
    USER ||--o{ ALERTRULE : creates
    USER {
        string _id PK
        string name
        string email
        string passwordHash
        string role
    }
    ALERTRULE {
        string _id PK
        string name
        string module
        array conditions
        array channels
        boolean isActive
        ObjectId createdBy FK
    }
