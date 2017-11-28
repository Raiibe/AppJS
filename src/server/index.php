<?php
require_once 'vendor/autoload.php';// Autoload our dependencies with Composer

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

$app = new \Slim\App();
$app->add(function(ServerRequestInterface $request, ResponseInterface $response, callable $next){
    $response = $response->withHeader('Content-type', 'application/json; charset=utf-8');
    $response = $response->withHeader('Access-Control-Allow-Origin', '*');
    $response = $response->withHeader('Access-Control-Allow-Methods', 'OPTION, GET, POST, PUT, PATCH, DELETE');
    return $next($request, $response);
});

$tasks_path = realpath('..') . '/database/tasks.json';

$tasks = array();
if(file_exists($tasks_path)){
    $tasks = json_decode(file_get_contents($tasks_path), true);
}

$app->group('/tasks', function() use($app, $tasks_path, $tasks) {
    $app->get('[/]', function() use($tasks) {
        echo json_encode($tasks);
    });

    $app->post('/addtask', function(ServerRequestInterface $request) use($tasks_path, $tasks) {

        $taskName = $request->getParam('name');
        $taskDescription = $request->getParam('description');
        $taskDuration = $request->getParam('duration');
        if(!empty($taskName) && !empty($taskDuration)){
            if(file_exists($tasks_path)){
                $current = json_decode(file_get_contents($tasks_path), true);
            }
            $current[]['name'] = $taskName;
            $current[]['description'] = $taskDescription;
            $current[]['duration'] = $taskDuration;

            $to_json = json_encode($current);
            file_put_contents($tasks_path, $to_json);
            echo $to_json;
        }
    });
});

$app->run();
