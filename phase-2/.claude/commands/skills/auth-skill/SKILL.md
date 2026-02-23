---
name: auth-skill
description: Implement secure authentication systems including signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Auth Skill – Secure Authentication System

## Instructions

1. **User Signup**
   - Collect email and password
   - Validate input (email format, strong password)
   - Hash password before storing
   - Save user in database

2. **User Signin**
   - Validate email exists
   - Compare hashed password
   - Generate JWT token on success
   - Return secure response (no password)

3. **Password Hashing**
   - Use bcrypt or argon2
   - Never store plain text passwords
   - Use salt rounds (recommended: 10–12)
   - Handle async hashing properly

4. **JWT Token Implementation**
   - Sign token with secret key
   - Include user ID in payload
   - Set expiration time
   - Verify token in protected routes

5. **Protected Routes**
   - Extract token from headers
   - Verify using JWT secret
   - Attach user to request object
   - Deny access if invalid/expired

6. **Better Auth Integration**
   - Configure Better Auth provider
   - Connect database adapter
   - Setup session handling
   - Implement middleware for route protection

---

## Best Practices

- Always hash passwords
- Use environment variables for secrets
- Set token expiration (e.g., 1h or 7d)
- Implement refresh tokens if needed
- Validate all user inputs
- Return proper HTTP status codes
- Handle authentication errors securely
- Use HTTPS in production
- Implement rate limiting for login attempts

---

## Example Structure (Node.js + Express)

```javascript
// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
  });

  res.status(201).json({ message: "User created successfully" });
});

// Signin
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});
