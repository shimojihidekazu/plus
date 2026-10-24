#!/bin/bash
set -e

cert=/var/www/certificate/plus.microsystems.company.crt
key=/var/www/certificate/plus.microsystems.company.key
chain=/var/www/certificate/plus.microsystems.company.chainfile.pem

if [ -s "$cert" ] && [ -s "$key" ] && [ -s "$chain" ]; then
  a2ensite plus-ssl.conf >/dev/null
else
  a2dissite plus-ssl.conf >/dev/null || true
  echo "SSL certificate is missing. HTTPS vhost is disabled."
fi

exec apache2-foreground
