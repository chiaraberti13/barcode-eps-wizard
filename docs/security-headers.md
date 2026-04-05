# Browser-side hardening headers

Header consigliati per hosting statico:

```text
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
Permissions-Policy: geolocation=(), microphone=(), camera=()
X-Frame-Options: DENY
Cross-Origin-Resource-Policy: same-site
```

## Note operative
- Adeguare `script-src` se vengono aggiunti CDN differenti.
- Se si elimina CSS inline, rimuovere `'unsafe-inline'` da `style-src`.
- Verificare header in ambiente di test con browser devtools (tab Network).
