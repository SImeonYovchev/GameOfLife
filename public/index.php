<?php

use Phalcon\Mvc\Micro;
use Phalcon\Db\Adapter\Pdo\Postgresql;
use Phalcon\Http\Response;

$app = new Micro();

$config = [
  'host' => 'localhost',
  'dbname' => 'gameoflife',
  'username' => 'syovchev',
  'password' => '1234qwer'
];

$connection = new Postgresql($config);

$app->get(
    '/seed',
    function () use ($connection){
        $response = new Response();
        
        $sql = 'SELECT id, name, width, height FROM seed';
        $result = $connection->query($sql);
        $rows = $result->fetchAll();

        if (empty($rows)) {
            $response->setStatusCode(404, 'Not Found');
        }

        $response->setStatusCode(200, 'OK');
        $response->setJsonContent(['seeds' => $rows]);
        $response->send();
    }
);

$app->get(
    '/seed/{id}',
    function ($id) use ($connection) {
        $response = new Response();
        $response->setContentType('Application/json');

        $sql = sprintf('SELECT s.width, s.height, c.x, c.y FROM seed AS s INNER JOIN seed_alive_cell c ON s.id = c.seed_id WHERE s.id = \'%s\'', $id);
        $result = $connection->query($sql);
        $rows = $result->fetchAll();

        if (empty($rows)) {
            $response->setStatusCode(404, 'Not Found');
        }

        $response->setJsonContent(['seed' => $rows]);
        $response->send();
    }
);

$app->post(
    '/seed/add',
    function () use ($connection, $app) {
        $seedParams = $app->request->getJsonRawBody();
        $random = new \Phalcon\Security\Random();
        $response = new Response();
        $response->setContentType('Application/json');

        try {
            $sql = "INSERT INTO seed VALUES (:id, :name, :width, :height)";
            $seedId = $random->uuid();

            $connection->query($sql, ['id'=>$seedId, 'name'=> $seedParams->name, 'width'=> $seedParams->width, 'height'=>$seedParams->height]);

            $sqlSeedAliveCell = 'INSERT INTO seed_alive_cell VALUES ';
            $values = [];
            $seed = $seedParams->seed;

            for ($x = 0; $x < count($seed); $x++) {
                for ($y = 0; $y < count($seed); $y++) {
                    if ($seed[$x][$y] == 1) {
                        $seedAliveCellId = $random->uuid();
                        $values[] = sprintf('(\'%s\', \'%s\', %d, %d)', $seedAliveCellId, $seedId, $x, $y);
                    }
                }
            }

            $sqlSeedAliveCell .= implode(', ', $values);

            $response->setJsonContent(array('seed' => $sqlSeedAliveCell));
            $connection->query($sqlSeedAliveCell);
            $response->send();
        } catch (Exception $e) {
            $response->setStatusCode(400, 'Bad Request')->sendHeaders();
        }
    }
);

$app->notFound(
    function () use ($app) {
        $app->response->setStatusCode(404, 'Not Found')->sendHeaders();
        echo 'This is crazy, but this page was not found!';
    }
);

$app->handle();