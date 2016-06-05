(function ($) {
    angular.module('gameOfLife').controller('AppController', AppController);

    function AppController ($scope, $http, $interval, ngDialog) {

        var intervalPromise;

        toastr.options = {
            "positionClass": "toast-top-center"
        };

        $scope.step = 0;

        $scope.boardSize = 20;
        $scope.delay = 1;
        $scope.debug = false;
        $scope.iterations = 0;
        $scope.boards = [];

        $scope.goToStepTwo = goToStepTwo;
        $scope.goToStepThree = goToStepThree;
        $scope.toggleCell = toggleCell;
        $scope.setRandomSeed = setRandomSeed;
        $scope.stopIteration = stopIteration;
        $scope.saveSeedToDb = saveSeedToDb;
        $scope.loadSeedFromDb = loadSeedFromDb;

        return;

        function goToStepTwo() {
            $scope.boards[0] = getEmptyBoardState($scope.boardSize);

            $scope.step = 1;
        }

        function goToStepThree() {
            $scope.step = 2;
            startGameOfLife();
        }

        function setRandomSeed() {
            $scope.boards[0] = getRandomBoardState();
        }

        function saveSeedToDb() {
            ngDialog.open({
                template: 'views/save-seed.html',
                scope: $scope,
                controller: function ($scope, $http) {
                    $scope.seedName = '';

                    $scope.save = save;

                    function save () {
                        var seedInfo = {
                            name: $scope.seedName,
                            width: $scope.$parent.boards[0].length,
                            height: $scope.$parent.boards[0].length,
                            seed: $scope.$parent.boards[0]
                        };

                        $http.post('/seed/add', seedInfo)
                            .then(function(response){
                                toastr.success('Seed added!');
                            });

                        ngDialog.close();
                    }
                }
            });
        }

        function loadSeedFromDb() {
            $http.get('/seed')
                .then(function(seeds){
                    $scope.dialogData = seeds.data.seeds;

                     ngDialog.open({
                        template: 'views/load-seed.html',
                        scope: $scope,
                        data: $scope.dialogData,
                        controller: function($scope, $http){
                            $scope.board = $scope.$parent.boards[0];

                            $scope.load = load;

                            function load(id) {
                                $http.get('seed/' + id)
                                    .then(function(seed){
                                        var currentSeed = seed.data.seed;
                                        $scope.board = getEmptyBoardState(currentSeed[0].width);

                                        $.each(currentSeed, function(index, value){
                                            $scope.board[value['x']][value['y']] = 1;
                                        });

                                        $scope.boards[0] = $scope.board;

                                        toastr.success('Seed loaded');
                                    });

                                ngDialog.close();
                            };
                        }
                    });
            });
        }

        function toggleCell(board, row, col) {
            board[row][col] = !board[row][col];
        }

        function startGameOfLife() {
            intervalPromise = $interval(function () {
                $scope.iterations++;

                if ($scope.debug === true) {
                    $scope.boards.push(getNewBoardState());
                } else {
                    $scope.boards = [getNewBoardState()];
                }

            }, $scope.delay * 1000);
        }

        function stopIteration() {
            $interval.cancel(intervalPromise);
        }

        function getEmptyBoardState(size) {
            var i,
                j,
                board = [];

            for (i = 0; i < size; i++) {
                board[i] = [];

                for (j = 0; j < size; j++) {
                    board[i][j] = 0;
                }
            }
            return board;
        }

        function getRandomBoardState() {
            var i,
                j,
                board = [];

            for (i = 0; i < $scope.boardSize; i++) {
                board[i] = [];

                for (j = 0; j < $scope.boardSize; j++) {
                    board[i][j] = Math.floor(Math.random() * 2);
                }
            }
            return board;
        }

        function getNewBoardState() {
            var currentBoardState = $scope.boards[$scope.boards.length-1],
                newBoardState = angular.copy(currentBoardState);

            for (var row = 0; row < currentBoardState.length; row++) {
                for (var col = 0; col < currentBoardState.length; col++) {
                    var state = currentBoardState[row][col],
                        neighbours = getCurrentCellNeighbours(currentBoardState, row, col);

                        newBoardState[row][col] = getNewCellState(state, neighbours);
                }
            }

            return newBoardState;
        }

        function getNewCellState(currentCellState, neighbours) {
            var dead = 0,
                alive = 0,
                state = 0;

            for (var i = 0; i < neighbours.length; i++) {
                if (!neighbours[i]) {
                    dead++;
                } else {
                    alive++;
                }
            }

            // if the cell is dead and has 3 living neighbours or is alive and has 2 or 3
            if ((!currentCellState && alive === 3)
                || (currentCellState && (alive === 2 || alive === 3))
            ) {
                state = 1;
            }

            return state;
        }

        function getCurrentCellNeighbours(board, row, col) {
            var neighbours = [],
                potentialNeighbours = [
                    {x: row, y: col + 1},
                    {x: row, y: col - 1},
                    {x: row + 1, y: col},
                    {x: row - 1, y: col},
                    {x: row + 1, y: col + 1},
                    {x: row + 1, y: col - 1},
                    {x: row - 1, y: col + 1},
                    {x: row - 1, y: col - 1}
                ];

            $.each(potentialNeighbours, function (i, elem) {
                if ($.isArray(board[elem.x]) && typeof board[elem.x][elem.y] !== 'undefined') {
                    neighbours.push(board[elem.x][elem.y]);
                }
            });

            return neighbours;
        }
    };
})(window.jQuery);