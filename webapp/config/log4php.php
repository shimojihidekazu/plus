<?php
return [
    'rootLogger' => [
        'appenders' => ['default'],
    ],
    'appenders' => [
        'default' => [
            'class' => 'LoggerAppenderDailyFile',
            'params' => [
                //'file' => '/var/www/cache/app_log.%s',
                'file' => '/var/www/logs/app_log.%s',
            ],
            'layout' => [
                'class' => 'LoggerLayoutPattern',
                'params' => [
                    'conversionPattern' => '%date{Y-m-d H:i:s,u} [%-5level] %sessionid %msg%n%throwable',
                ]
            ]
        ]
    ]
];