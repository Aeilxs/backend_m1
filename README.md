# Backend master project

```bash
# dev (avec hotreload)
docker-compose --profile dev up
```

## Check Auth

```bash
curl -X POST -H "Content-Type: application/json" -d '{
    "email": "test@example.com",
    "password": "password123",
    "returnSecureToken": true
}' "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=FIREBASE_API_KEY"
```

## Doc

[kafka ui](http://localhost:8080/ui)
[swagger](http://localhost:3000/doc)
