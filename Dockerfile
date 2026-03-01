# ============================================================
# Stage 1: Build frontend assets (Node.js)
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy source files yang dibutuhkan untuk build
COPY vite.config.js tsconfig.json tailwind.config.js postcss.config.js components.json ./
COPY resources/ resources/
COPY public/ public/

# Build client assets (skip tsc & SSR — SSR tidak dijalankan di production)
RUN npx vite build

# ============================================================
# Stage 2: PHP Production Application (Debian-based)
# ============================================================
FROM php:8.2-fpm AS production

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    libzip-dev \
    libxml2-dev \
    libonig-dev \
    libicu-dev \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        xml \
        ctype \
        bcmath \
        fileinfo \
        tokenizer \
        zip \
        gd \
        intl \
        pcntl \
        opcache

# OPcache config untuk performance
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.max_accelerated_files=10000'; \
    echo 'opcache.memory_consumption=192'; \
    echo 'opcache.max_wasted_percentage=10'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.fast_shutdown=1'; \
} > /usr/local/etc/php/conf.d/opcache.ini

# Nginx: disable default config, pakai config kita
RUN rm -f /etc/nginx/sites-enabled/default

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies (production only) — layer cache
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-scripts \
    --no-interaction \
    --prefer-dist

# Copy semua source aplikasi
COPY . .

# Timpa dengan built assets dari Stage 1
COPY --from=frontend-builder /app/public/ public/

# Jalankan post-install scripts
RUN composer dump-autoload --optimize

# Buat direktori yang diperlukan & set permissions
RUN mkdir -p \
        storage/logs \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/app/public \
        bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 storage bootstrap/cache

# Copy konfigurasi Docker
COPY docker/nginx/default.conf /etc/nginx/sites-enabled/default.conf
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
