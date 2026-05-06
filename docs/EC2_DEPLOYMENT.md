# Deploy Pack & Pally Web (Next.js) on AWS EC2

This guide runs **updatedpackandpally** on an Ubuntu EC2 instance behind **Nginx** with **HTTPS**. The app talks to **wanderly-1** using `API_BASE_URL` (for example `https://api.packandpally.com/api`).

## Prerequisites

- AWS account and permissions to create EC2 instances, security groups, and (optional) Elastic IPs
- SSH key pair (`.pem`) for the instance
- A DNS hostname pointing at the instance (for example `app.packandpally.com`) for production HTTPS
- Production values for all environment variables (see [Environment variables](#environment-variables))
- **wanderly-1** deployed and reachable; CORS on the API must allow your web origin (e.g. `https://app.packandpally.com`)

## Architecture (short)

| Component | Role |
|-----------|------|
| **Next.js** (`npm start`) | Listens on **127.0.0.1:3000** by default — not exposed to the internet directly |
| **Nginx** | Listens on **80** and **443**; proxies to `http://127.0.0.1:3000` |
| **PM2** | Keeps the Node process alive and restarts it after reboot (with `pm2 startup`) |

**Note:** `http://127.0.0.1:3000` is **localhost on the EC2 machine only**. It is **not** your public IP. Visitors use your **domain** or the instance **public IP** on ports **80/443** via Nginx.

---

## 1. Launch EC2

1. Open **EC2 → Launch instance**.
2. **AMI:** Ubuntu Server **22.04 LTS** or **24.04 LTS**.
3. **Instance type:** **t3.small** or larger recommended (`npm run build` can run out of memory on **t3.micro**).
4. **Key pair:** Select or create a key pair; save the `.pem` file securely.
5. **Network:** Use a VPC/subnet that can receive inbound **HTTP/HTTPS** if the site is public.
6. **Storage:** At least **20–30 GB** gp3.

---

## 2. Security group (inbound rules)

Create or attach a security group with:

| Type | Port | Source | Notes |
|------|------|--------|--------|
| SSH | **22** | Your IP (recommended) | Avoid opening SSH to `0.0.0.0/0` unless necessary |
| HTTP | **80** | `0.0.0.0/0` | Used for HTTP and Let’s Encrypt challenges |
| HTTPS | **443** | `0.0.0.0/0` | Public site over TLS |

**Do not** open **3000** to the world if Nginx proxies to Next on localhost.

---

## 3. Elastic IP (optional, recommended)

1. **EC2 → Elastic IPs → Allocate**.
2. **Associate** the address with your instance.

This keeps a stable public IP for DNS (A record).

---

## 4. DNS

At your DNS host (e.g. SiteGround):

- Create an **A record** for your app host (e.g. `app`) pointing to the instance **Elastic IP** (or current public IPv4).

---

## 5. SSH into the server

On your laptop:

```bash
chmod 400 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

(Default Ubuntu AMI user is often `ubuntu`; Amazon Linux uses `ec2-user`.)

---

## 6. System packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx
```

---

## 7. Node.js (LTS)

Next.js 16 expects a current Node version (**20+**). Example with NodeSource (Node 20):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

---

## 8. PM2

```bash
sudo npm install -g pm2
```

---

## 9. Application code on the server

Choose one approach.

### Option A — Git

```bash
sudo mkdir -p /var/www/packandpally
sudo chown "$USER:$USER" /var/www/packandpally
cd /var/www/packandpally
git clone YOUR_REPOSITORY_URL updatedpackandpally
cd updatedpackandpally
```

### Option B — Copy from your machine (SCP)

From your laptop (adjust paths):

```bash
scp -i /path/to/your-key.pem -r /path/to/updatedpackandpally ubuntu@YOUR_EC2_PUBLIC_IP:/var/www/packandpally/
```

---

## 10. Environment variables

On the server, in the project directory:

```bash
cd /var/www/packandpally/updatedpackandpally
nano .env.production
```

Set production values (examples — names must match what the app expects):

- `API_BASE_URL` — wanderly API base URL
- `GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_APPLE_CLIENT_ID`, `NEXT_PUBLIC_APPLE_REDIRECT_URI` (must match the **live** app URL, e.g. `https://app.packandpally.com/...`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Stripe, Prisma, auth, and signup secrets as required by your deployment

**Do not commit** `.env.production` or real secrets to Git.

Configure **Google** and **Apple** developer consoles with the correct OAuth redirect URLs for your production hostname.

---

## 11. Install, Prisma, build

```bash
cd /var/www/packandpally/updatedpackandpally
npm ci
npx prisma generate
# If you use migrations against the production database:
# npx prisma migrate deploy
npm run build
```

Fix any build errors (missing env vars, Node version, database URL) before continuing.

---

## 12. Run with PM2

```bash
cd /var/www/packandpally/updatedpackandpally
pm2 start npm --name "packandpally-web" -- start
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Run the `sudo env PATH=...` command that `pm2 startup` prints once so PM2 starts on boot.

Verify **on the server**:

```bash
curl -I http://127.0.0.1:3000
```

---

## 13. Nginx reverse proxy

Create a site config (replace `app.packandpally.com` with your hostname):

```bash
sudo nano /etc/nginx/sites-available/packandpally-app
```

```nginx
server {
    listen 80;
    server_name app.packandpally.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/packandpally-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 14. HTTPS (Let’s Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.packandpally.com
```

Follow the prompts. Certbot will install certificates and adjust Nginx for **443**.

---

## 15. Updates after the first deploy

```bash
cd /var/www/packandpally/updatedpackandpally
git pull
npm ci
npx prisma generate
# npx prisma migrate deploy   # if needed
NODE_OPTIONS="--max-old-space-size=3072" npm run build
pm2 restart packandpallyweb
```

---

## Verification checklist

| Check | Command or action |
|--------|-------------------|
| Next responds locally on EC2 | `curl -I http://127.0.0.1:3000` |
| Nginx | `sudo nginx -t`, `systemctl status nginx` |
| Public site | Open `https://your-hostname` in a browser |
| App logs | `pm2 logs packandpally-web` |

---

## Troubleshooting

- **502 Bad Gateway:** Next is not running or not on port 3000 — check `pm2 status` and logs.
- **Build killed / out of memory:** Use a larger instance or add swap; avoid **t3.micro** for `next build`.
- **OAuth / Apple failures:** Redirect URIs and `NEXT_PUBLIC_*` URLs must match the **production** hostname (e.g. `https://app.packandpally.com`).
- **API errors:** Confirm `API_BASE_URL` on the server and CORS on wanderly for your web origin.
