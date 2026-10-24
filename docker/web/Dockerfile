FROM php:8.2.35-apache-bookworm
# PHP 設定ファイル
# COPY php.ini /etc/php.ini
COPY php.ini /usr/local/etc/php/php.ini
COPY conf.d/zz-hardening.ini /usr/local/etc/php/conf.d/zz-hardening.ini

# Composerのインストール
RUN cd /usr/bin && curl -s http://getcomposer.org/installer | php && ln -s /usr/bin/composer.phar /usr/bin/composer

# ミドルウェアインストール
# https://hub.docker.com/_/php/
RUN apt-get update && apt-get install -y \
        net-tools \
        cron \
        vim \
        libxml2-dev \
        libzip-dev \
        wget \
        msmtp \
        msmtp-mta

# modRewriteを有効化する
RUN mv /etc/apache2/mods-available/rewrite.load /etc/apache2/mods-enabled
RUN echo "alias ll='ls -al'" >> /root/.bashrc


# 仮想ホスト設定を sites-available に配置
COPY ./000-default.conf /etc/apache2/sites-available/000-default.conf
COPY ./plus-ssl.conf /etc/apache2/sites-available/plus-ssl.conf

# 仮想ホストを有効化
RUN a2ensite 000-default.conf
RUN a2ensite plus-ssl.conf
RUN a2enmod ssl

# タイムゾーン設定
RUN ln -sf  /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

CMD ["apache2-foreground"]