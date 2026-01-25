# SECURITY AUDIT REPORT - United Rehabs
## Date: January 25, 2026
## Status: PRE-LAUNCH REVIEW

---

## 🔴 CRITICAL ISSUES (Must Fix Before Launch)

### 1. JWT Secret Key - HARDCODED DEFAULT
**File:** `/app/backend/auth.py`
**Issue:** JWT secret key has a hardcoded fallback value
```python
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "united-rehabs-secret-key-change-in-production")
```
**Risk:** If JWT_SECRET_KEY is not set in production, anyone who reads the code can forge admin tokens
**Fix:** Remove default value, require env variable

### 2. CORS Configuration - WILDCARD
**File:** `/app/backend/.env`
**Issue:** `CORS_ORIGINS="*"` allows any website to make API requests
**Risk:** Cross-site attacks, data theft
**Fix:** Set specific allowed origins for production

### 3. DataForSEO Credentials Exposed
**File:** `/app/backend/.env`
**Issue:** Plain text credentials in .env file that may be committed
```
DATAFORSEO_USERNAME=vdepagadala@gmail.com
DATAFORSEO_PASSWORD=FO0RStUQFoA4tn55
```
**Risk:** API abuse, billing charges
**Fix:** Use secret management system for production

### 4. Admin Account with Weak/Known Password
**Database:** User `admin@unitedrehabs.com` exists with password `admin_password`
**Risk:** Anyone reading documentation or tests can access admin panel
**Fix:** Force password change before production, use strong password

---

## 🟡 MEDIUM ISSUES (Should Fix)

### 5. No Rate Limiting on API Endpoints
**Issue:** No rate limiting on authentication or public endpoints
**Risk:** Brute force attacks, DDoS, API abuse
**Fix:** Add rate limiting middleware (e.g., slowapi)

### 6. XSS Vulnerability - dangerouslySetInnerHTML
**Files:** Multiple components use `dangerouslySetInnerHTML`
- `/app/frontend/src/pages/PrivacyPolicy.tsx`
- `/app/frontend/src/pages/AboutUs.tsx`
- `/app/frontend/src/components/article/RichContentEditor.tsx`
**Risk:** XSS attacks if content is not properly sanitized
**Mitigation:** Uses `sanitizeHtml` in some places - verify all uses

### 7. No Security Headers
**Issue:** Missing HTTP security headers
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy
- Strict-Transport-Security
**Fix:** Add security headers middleware

### 8. Token Storage in localStorage
**File:** `/app/frontend/src/lib/api.ts`
**Issue:** JWT tokens stored in localStorage
**Risk:** XSS attacks can steal tokens
**Alternative:** Consider httpOnly cookies for production

---

## 🟢 GOOD PRACTICES FOUND

✅ Password hashing with bcrypt
✅ JWT token expiration (24 hours)
✅ Pydantic input validation
✅ Admin-only routes protected with `require_admin`
✅ MongoDB queries use parameterized queries (no injection risk)
✅ Error responses don't expose stack traces
✅ Environment variables for sensitive config (mostly)

---

## 🔧 RECOMMENDED FIXES

### Immediate (Before Launch):
1. Generate strong JWT secret key for production
2. Restrict CORS to actual domain(s)
3. Change admin password
4. Remove/rotate DataForSEO credentials
5. Add rate limiting

### Post-Launch:
1. Add security headers
2. Consider httpOnly cookie for tokens
3. Add audit logging for admin actions
4. Implement IP-based blocking
5. Set up security monitoring
