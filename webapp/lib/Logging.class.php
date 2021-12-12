<?PHP
namespace utils;
require_once '/var/www/vendor/autoload.php';
define('WEBAPP_DIR', '/var/www/webapp');
define('LOG4P_TYPE', 'file');
define('LOG4P_ENCODING', 'UTF-8');
define('ORG_ENCODING', 'auto');

class Logging
{

    private  $logger;

    public function __construct()
    {
        $config = realpath(WEBAPP_DIR . "/config/log4php.php");
        \Logger::configure($config);
        $this->logger = \Logger::getLogger("main");
    }

    public function fatal($message, $throwable = null)
    {
        $this->logger->fatal($this->format($message), $throwable);
    }

    public function error($message, $throwable = null)
    {
        $this->logger->error($this->format($message), $throwable);
    }

    public function warn($message, $throwable = null)
    {
        $this->logger->warn($this->format($message), $throwable);
    }

    public function info($message, $throwable = null)
    {
        $this->logger->info($this->format($message), $throwable);
    }

    public function debug($message, $throwable = null)
    {
        $this->logger->debug($this->format($message), $throwable);
    }

    public function trace($message, $throwable = null)
    {
        $this->logger->trace($this->format($message), $throwable);
    }

    protected function format($message)
    {
        if(is_array($message) || is_object($message))   {
            $message = print_r($message ,true);
        } else {
            $message = "\n{$message}";
        }
        return mb_convert_encoding($message, LOG4P_ENCODING, ORG_ENCODING);
    }
}
