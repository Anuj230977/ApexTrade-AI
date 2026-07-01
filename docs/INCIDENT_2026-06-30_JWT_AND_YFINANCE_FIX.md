# Incident Note: 403 Market Requests and yFinance Timeout Bug

## What Happened
Two separate issues were showing up at the same time:

1. The Java gateway appeared to return `403` for market requests like `/api/market/price/AAPL`.
2. The Python market service was breaking on yFinance calls with `Ticker.__init__() got an unexpected keyword argument 'timeout'`.

The second bug was real and confirmed. The first bug was a misread of the security path: the Java filter was not actually sending a `403`, but it was still the right place to harden because it ran on every request.

## Root Cause 1: Invalid yFinance Constructor Argument

### Symptom
The Python service logged repeated failures for `/price/AAPL`, `/history/AAPL`, and `/signal/AAPL`.

### Cause
`backend-python/main.py` passed `timeout=10` directly into `yf.Ticker(...)`.

That constructor does not accept a `timeout` keyword argument in yFinance. The timeout belongs on the underlying request/history call path, not on `Ticker()`.

### Fix
In `backend-python/main.py`:

- `yf.Ticker(symbol, timeout=10)` became `yf.Ticker(symbol)` in:
  - `get_price()`
  - `get_history()`
  - `get_signal()`

### What Would Have Happened If We Had Not Fixed It
Every market-data request would keep failing at the Python layer, so the frontend would keep seeing 503-style failures or empty results even if the Java gateway was healthy.

## Root Cause 2: Java Security Filter Was Too Broad

### Symptom
The Java side looked like it was involved in the 403 issue, because the request flowed through Spring Security before reaching the controller.

### Cause
`JwtAuthFilter` was applied to every request, including public routes such as:

- `/api/auth/**`
- `/api/market/**`

Even though `SecurityConfig` already marked those routes as `permitAll()`, the filter still executed on them. That made the filter a possible source of false rejection and made debugging harder.

### Fix
In `backend-java/src/main/java/com/apextrade/security/JwtAuthFilter.java`:

- Added `shouldNotFilter(HttpServletRequest request)`
- Skipped filtering for:
  - `OPTIONS` requests
  - `/api/auth/**`
  - `/api/market/**`
  - `/error`

In `backend-java/src/main/java/com/apextrade/config/SecurityConfig.java`:

- Added `.requestMatchers("/error").permitAll()`

### What Would Have Happened If We Had Not Fixed It
The app might still work for some requests, but public endpoints would keep passing through JWT parsing unnecessarily. That increases the chance of confusing auth failures, especially if token validation, secret values, or error dispatch behavior changes later.

## How We Figured It Out

### 1. Checked the actual Python code path
We inspected `backend-python/main.py` and found the invalid constructor usage immediately.

### 2. Checked the Java security wiring
We inspected:

- `backend-java/src/main/java/com/apextrade/config/SecurityConfig.java`
- `backend-java/src/main/java/com/apextrade/security/JwtAuthFilter.java`
- `backend-java/src/main/java/com/apextrade/security/JwtUtil.java`

That showed:

- `permitAll()` was already set for `/api/market/**`
- the filter was installed before `UsernamePasswordAuthenticationFilter`
- the filter itself was not directly sending `403`

### 3. Verified the actual controller flow
`MarketController` proxies the request to Python, so the market endpoint itself is just a gateway layer.

### 4. Confirmed the runtime behavior
After the fixes:

- Python logs started returning `200 OK` for `/price/AAPL`, `/history/AAPL`, and `/signal/AAPL`
- Java no longer showed the problematic auth-path suspicion
- Browser inspection showed the market requests succeeding

## Exact Files Changed

- `backend-python/main.py`
- `backend-java/src/main/java/com/apextrade/security/JwtAuthFilter.java`
- `backend-java/src/main/java/com/apextrade/config/SecurityConfig.java`

## Validation Performed

- Java backend: `mvn test -q` passed
- Python syntax check: passed
- Runtime logs: Python market endpoints returned `200 OK`

## If This Happens Again

1. Check whether the failure is coming from the Java gateway or the Python market service.
2. Look at the exact endpoint in the browser network tab or server logs.
3. Search for invalid constructor arguments or unsupported kwargs in the Python service.
4. Check whether Spring Security is filtering a route that should be public.
5. Verify the JWT secret is stable across login and request validation.
6. Confirm the browser is not reusing an old token from local storage.

## About `.venv`

A `.venv` folder was not found inside this repository during cleanup.

If a local Python virtual environment was created and then stopped, it can be deleted safely if you do not need it. Do not delete:

- `backend-python/requirements.txt`
- source files under `backend-python/`
- any tracked dependency metadata

If a future local env is created for testing, keep it outside the repo or ignore it in Git.

## Short Version

- The Python break was caused by `yf.Ticker(..., timeout=10)`.
- The security concern was that the JWT filter was running on public routes.
- The fix was to remove the unsupported yFinance kwarg and bypass JWT filtering for public endpoints.
- The repo is now returning `200 OK` for the market calls again.
