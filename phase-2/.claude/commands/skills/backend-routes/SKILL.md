---
name: backend-routes
description: Generate backend routes, handle HTTP requests/responses, and connect to a database. Use for API development.
---
# Backend Routes & DB Handling

## Instructions

1. **Route Structure**
   - Define routes for CRUD operations (Create, Read, Update, Delete)
   - Use RESTful naming conventions (`/users`, `/products/:id`)
   - Group routes by resource

2. **Request Handling**
   - Parse JSON request bodies
   - Validate input data
   - Handle query parameters and route params

3. **Response Handling**
   - Return appropriate HTTP status codes (`200`, `201`, `400`, `404`, `500`)
   - Send JSON responses
   - Include error handling and meaningful messages

4. **Database Connection**
   - Connect to a relational (MySQL/PostgreSQL) or NoSQL (MongoDB) database
   - Perform CRUD operations using an ORM or query builder
   - Ensure proper error handling and connection closure

## Best Practices
- Use descriptive route names
- Keep business logic separate from route handlers
- Validate all user input
- Handle errors gracefully
- Use environment variables for DB credentials
- Write modular, reusable code

## Example Structure
```javascript
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB Connected'))
  .catch(err => console.error('DB Connection Error:', err));

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
