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
        $lastTaskId = $request->getParam('last_task_id');
        $taskName = $request->getParam('name');
        $taskDescription = $request->getParam('description');
        $taskDuration = $request->getParam('duration');
        $taskTags = $request->getParam('tags');

        if(!empty($taskName) && !empty($taskDuration)) {
            $current = array();

            if (file_exists($tasks_path)) {
                $current = json_decode(file_get_contents($tasks_path), true);
            }

            if (empty($taskTags)) {
                $current[$lastTaskId + 1] = ['name' => $taskName, 'description' => $taskDescription, 'duration' => $taskDuration, 'Tags' => null];
            } else {
                $tags = array();
                $tagsTasks = explode('/', $taskTags);

                foreach ($tagsTasks as $t) {
                    $tags[sizeof($tags) + 1] = ['name' => $t];
                }

                $current[$lastTaskId + 1] = ['name' => $taskName, 'description' => $taskDescription, 'duration' => $taskDuration, 'Tags' => $tags];
            }

            $to_json = json_encode($current);
            file_put_contents($tasks_path, $to_json);

            echo json_encode([$lastTaskId + 1 => $current[$lastTaskId + 1]]);
        }
    });

    $app->post('/{taskid}/addtag', function (ServerRequestInterface $request) use($tasks_path) {
        $taskId = $request->getAttribute('taskid');
        $lastTagId = $request->getParam('last_tag_id');
        $taskTags = $request->getParam('tags');

        $current = array();

        if (file_exists($tasks_path)) {
            $current = json_decode(file_get_contents($tasks_path), true);
        }

        if (!empty($taskTags)) {
            $tagsTasks = explode('/', $taskTags);

            foreach ($tagsTasks as $t) {
                if (!empty($t)) {
                    $current[$taskId]['Tags'][$lastTagId + 1] = ['name' => $t];
                }
            }

            $to_json = json_encode($current);
            file_put_contents($tasks_path, $to_json);

            echo json_encode([$taskId => $current[$taskId]]);
        }
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
            unset($current[$taskId]['Tags'][$tagId]);

            if (empty($current[$taskId]['Tags'])) {
                $current[$taskId]['Tags'] = null;
            }

            $to_json = json_encode($current);
            file_put_contents($tasks_path, $to_json);

            echo json_encode(['id_task' => $taskId, 'id_tag' => $tagId]);
        }
    });
});

$app->run();