# Nginx Reverse Proxy Setup

This project can run with Docker Compose while Nginx runs directly on the host machine.

## Request flow

```text
Internet
  -> Nginx on the host
  -> http://127.0.0.1:3000
  -> backend container
  -> PostgreSQL container
```

## Docker Compose

The backend should be published only on localhost:

```yml
ports:
  - "127.0.0.1:3000:3000"
```

Do not expose PostgreSQL publicly in production.

## Example Nginx config

Create a new Nginx site config:

```bash
sudo nano /etc/nginx/sites-available/fitpulse-api
```

Example config:

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/fitpulse-api /etc/nginx/sites-enabled/fitpulse-api
sudo nginx -t
sudo systemctl reload nginx
```

## HTTPS

After DNS points `api.example.com` to the server, enable HTTPS with Certbot or another TLS solution.

Example:

```bash
sudo certbot --nginx -d api.example.com
```

## Environment variables

For production, set:

```env
EXPO_PUBLIC_API_URL=https://api.example.com/api
```

For browser-based frontend deployments, prefer a specific CORS origin:

```env
CORS_ORIGIN=https://app.example.com
```

For local development, this is acceptable:

```env
CORS_ORIGIN=*
```

## Important: Docker hostnames vs host machine

Inside Docker Compose, the backend must connect to Postgres using host `db`:

```env
DATABASE_URL=postgres://fitpulse:fitpulse_dev_password@db:5432/fitpulse
```

Nginx runs outside Docker, so Nginx must connect to the backend through the host port:

```nginx
proxy_pass http://127.0.0.1:3000;
```

Do not use this from host Nginx:

```nginx
proxy_pass http://db:3000;
```

`db` is only a Docker Compose service name inside the Docker network. The host Nginx does not know this name.
