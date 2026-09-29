# Production Deployment Guide: Enat Milk Shop

This guide outlines step-by-step instructions to deploy **Enat Milk Shop** (built on NexoPOS) to a production server environment.

---

## 1. Production Architecture Overview

- **OS**: Ubuntu 24.04 LTS VPS or Linux Container Host (DigitalOcean, Hetzner, AWS EC2, Render, Railway).
- **Backend**: PHP 8.2-FPM with Laravel 12 framework runtime.
- **Database**: MySQL 8.0+ or Managed MariaDB.
- **Cache & Queue**: Redis (handles NexoPOS caching and background message/notification queues).
- **Process Manager**: Supervisord (keeps queue workers and cron schedules running).
- **Web Server**: Nginx with SSL/TLS (Certbot / Let's Encrypt).

---

## 2. Option A: Deployment via Docker Compose (Recommended)

1. Clone the repository on the target Linux VPS:
   ```bash
   git clone https://github.com/abigiya-solomon/enat-milk-shop.git
   cd enat-milk-shop
   ```

2. Create production `.env` environment file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with production keys, database credentials, and site URL:
   ```env
   APP_NAME="Enat Milk Shop"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-domain.com
   DB_CONNECTION=mysql
   DB_HOST=mysql
   DB_DATABASE=enat_milk_shop
   DB_USERNAME=enat_user
   DB_PASSWORD=your_secure_password
   ```

4. Launch containers:
   ```bash
   cd deployment
   docker-compose up -d --build
   ```

5. Run database migrations & link storage:
   ```bash
   docker-compose exec app php artisan migrate --force
   docker-compose exec app php artisan storage:link
   ```

---

## 3. Option B: Deployment on Ubuntu VPS (Standard Nginx + PHP-FPM)

1. Install PHP 8.2 & extensions:
   ```bash
   sudo apt update
   sudo apt install -y php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml php8.2-bcmath php8.2-gd php8.2-curl php8.2-zip nginx redis-server supervisor
   ```

2. Copy Nginx server configuration:
   ```bash
   sudo cp deployment/nginx.conf /etc/nginx/sites-available/enat-milk-shop
   sudo ln -s /etc/nginx/sites-available/enat-milk-shop /etc/nginx/sites-enabled/
   sudo systemctl reload nginx
   ```

3. Install SSL Certificate with Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

4. Setup Supervisor Queue Workers:
   ```bash
   sudo cp deployment/supervisord.conf /etc/supervisor/conf.d/enat-milk-shop.conf
   sudo supervisorctl reread
   sudo supervisorctl update
   ```

---

## 4. Post-Deployment Verification Checklist

- [ ] Run `php artisan migrate --force` to ensure all `enat_*` tables are migrated.
- [ ] Verify `public/storage` symlink exists for supplier receipt screenshot uploads.
- [ ] Check queue worker status: `supervisorctl status`.
- [ ] Access `/dashboard/enat/suppliers` in browser to verify module navigation.
