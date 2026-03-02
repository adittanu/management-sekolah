# ============================================================
# Stage 1: Build frontend assets (Node.js)
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY vite.config.js tsconfig.json tailwind.config.js postcss.config.js components.json ./
COPY resources/ resources/
COPY public/ public/

# Build client assets (skip tsc type-check & SSR for faster Docker builds)
RUN npx vite build

# ============================================================
# Stage 2: PHP Production Application
# ============================================================
FROM php:8.4-fpm AS production

# Pakai install-php-extensions — otomatis handle semua dependency
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions

# Install PHP extensions
RUN install-php-extensions \
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

# Install nginx & supervisor
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# OPcache config
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.max_accelerated_files=10000'; \
    echo 'opcache.memory_consumption=192'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.fast_shutdown=1'; \
} > /usr/local/etc/php/conf.d/opcache.ini

# Nginx: hapus default config
RUN rm -f /etc/nginx/sites-enabled/default

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-scripts \
    --no-interaction \
    --prefer-dist

# Copy semua source aplikasi
COPY . .

# Timpa dengan built frontend assets
COPY --from=frontend-builder /app/public/ public/

# Post-install
RUN composer dump-autoload --optimize

# Setup direktori & permissions
RUN mkdir -p \
        storage/logs \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/app/public \
        bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 storage bootstrap/cache

# Copy config files
COPY docker/nginx/default.conf /etc/nginx/sites-enabled/default.conf
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
