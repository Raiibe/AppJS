<?php
require_once 'vendor/autoload.php';// Autoload our dependencies with Composer

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

$app = new \Slim\App();
$app->add(function (ServerRequestInterface $request, ResponseInterface $response, callable $next){
    $response = $response->withHeader('Content-type', 'application/json; charset=utf-8');
    $response = $response->withHeader('Access-Control-Allow-Origin', '*');
    $response = $response->withHeader('Access-Control-Allow-Methods', 'OPTION, GET, POST, PUT, PATCH, DELETE');
    return $next($request, $response);
});

$tasks_path = realpath('..') . '/database/tasks.json';

$tasks = array();
if(file_exists($tasks_path)){
    $tasks = json_decode(file_get_contents($tasks_path));
}

$app->group('/tasks', function () use($app, $tasks_path, $tasks) {
    $app->get('[/]', function () use($tasks) {
        echo json_encode($tasks);
    });

    $app->post('/addtask', function (ServerRequestInterface $request) use($tasks_path) {
        $newTask = $request->getParams();
        $newTaskId = $newTask['id'];
        $taskName = $newTask['name'];
        $taskDescription = $newTask['description'];
        $taskDuration = $newTask['duration'];
        $taskTags = $newTask['tags'];

        if(!empty($taskName) && !empty($taskDuration)) {
            $current = array();

            if (file_exists($tasks_path)) {
                $current = json_decode(file_get_contents($tasks_path), true);
            }

            if (empty($taskTags)) {
                $current[$newTaskId] = ['id' => $newTaskId, 'name' => $taskName, 'description' => $taskDescription, 'duration' => $taskDuration, 'tags' => null];
            } else {
                $current[$newTaskId] = ['id' => $newTaskId, 'name' => $taskName, 'description' => $taskDescription, 'duration' => $taskDuration, 'tags' => $taskTags];
            }

            $to_json = json_encode($current);
            file_put_contents($tasks_path, $to_json);

            echo $to_json;
        }
    });

    $app->post('/{taskid}/addtag', function (ServerRequestInterface $request) use($tasks_path) {
        $task = $request->getParams();

        $current = array();

        if (file_exists($tasks_path)) {
            $current = json_decode(file_get_contents($tasks_path), true);
        }
        $current[$task['id']] = $task;

        $to_json = json_encode($current);
        file_put_contents($tasks_path, $to_json);

        echo $to_json;
    });

    $app->delete('/{taskid}', function (ServerRequestInterface $request) use($tasks_path) {
        $taskId = $request->getAttribute('taskid');

        if (file_exists($tasks_path)) {
            $current = json_decode(file_get_contents($tasks_path), true);
            unset($current[$taskId]);

            if (!empty($current)) {
                $to_json = json_encode($current);
                file_put_contents($tasks_path, $to_json);
            } else {
                file_put_contents($tasks_path, '');
            }
            echo json_encode(['id_task' => $taskId]);
        }
    });

    $app->delete('/{taskid}/tags/{tagid}', function (ServerRequestInterface $request) use($tasks_path) {
        $taskId = $request->getAttribute('taskid');
        $tagId = $request->getAttribute('tagid');

        if (file_exists($tasks_path)) {
            $current = json_decode(file_get_contents($tasks_path), true);
            unset($current[$taskId]['tags'][$tagId]);

            if (empty($current[$taskId]['tags'])) {
                $current[$taskId]['tags'] = null;
            }

            $to_json = json_encode($current);
            file_put_contents($tasks_path, $to_json);

            echo json_encode(['id_task' => $taskId, 'id_tag' => $tagId]);
        }
    });
});

$app->run();