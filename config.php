<?php
require 'vendor/autoload.php';

use League\OAuth2\Client\Provider\GenericProvider;
use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Configuration from .env
$client_id = $_ENV['CLIENT_ID'];
$client_secret = $_ENV['CLIENT_SECRET'];

// Dynamically determine the redirect URI.
$redirect_uri = "https://$_SERVER[HTTP_HOST]" . dirname( $_SERVER['PHP_SELF'] ) . '/auth.php';

$provider = new GenericProvider([
    'clientId'                => $client_id,
    'clientSecret'            => $client_secret,
    'redirectUri'             => $redirect_uri,
    'urlAuthorize'            => 'https://api.netatmo.com/oauth2/authorize',
    'urlAccessToken'          => 'https://api.netatmo.com/oauth2/token',
    'urlResourceOwnerDetails' => '' // Not used
]);
