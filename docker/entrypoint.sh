#!/bin/sh
set -e

cd /var/www/html

echo "=========================================="
echo " Sekolah Kita - Starting Application"
echo "=========================================="

# Validasi APP_KEY
if [ -z "$APP_KEY" ]; then
    echo "❌ ERROR: APP_KEY belum di-set!"
    echo "   Jalankan: php artisan key:generate --show"
    echo "   Lalu set hasilnya sebagai environment variable APP_KEY"
    exit 1
fi

# Tunggu MySQL siap
echo "⏳ Menunggu koneksi database..."
MAX_RETRIES=30
RETRY=0

until php -r "
try {
    \$dsn = 'mysql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: '3306') . ';dbname=' . getenv('DB_DATABASE');
    new PDO(\$dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
} catch (Exception \$e) {
    exit(1);
}
" 2>/dev/null; do
    RETRY=$((RETRY + 1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        echo "❌ Database tidak bisa diakses setelah ${MAX_RETRIES} percobaan!"
        exit 1
    fi
    echo "   Database belum siap, mencoba lagi ($RETRY/$MAX_RETRIES)..."
    sleep 3
done

echo "✅ Database terhubung!"

# Jalankan migrasi
echo "🔄 Menjalankan migrasi..."
php artisan migrate --force
echo "✅ Migrasi selesai"

# Cache konfigurasi untuk performance
echo "🔄 Warming up cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "✅ Cache siap"

# Storage symlink
php artisan storage:link 2>/dev/null || true

# Fix permissions (kalau volume baru di-mount)
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

echo "🚀 Menjalankan services (nginx + php-fpm + queue)..."
echo "=========================================="

exec /usr/bin/supervisord -c /etc/supervisord.conf
