"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var weightRandom = function () {
    return 0;
};
var weightSmart = function (state, player) {
    return (state.availableMoves[player].length + 1)
        / state.availableMoves[(player + 1) % 2].length;
};
var weightSafe = function (state, player) {
    return (state.availableMoves[player].length + 1)
        * (state.getSafeMoves(player) + 1)
        / (state.getMaxMoves((player + 1) % 2)
            * state.availableMoves[(player + 1) % 2].length + 1);
};
var weightFullParametersAdd = function (state, player, params) {
    return params[0] * state.availableMoves[player].length
        + params[1] * state.availableMoves[(player + 1) % 2].length
        + params[2] * state.getMaxMoves(player)
        + params[3] * state.getMaxMoves((player + 1) % 2)
        + params[4] * state.getSafeMoves(player)
        + params[5] * state.getSafeMoves((player + 1) % 2);
};
var weightFullParametersAddWL = function (state, player, params) {
    var normalResult = params[0] * state.availableMoves[player].length
        + params[1] * state.availableMoves[(player + 1) % 2].length
        + params[2] * state.getMaxMoves(player)
        + params[3] * state.getMaxMoves((player + 1) % 2)
        + params[4] * state.getSafeMoves(player)
        + params[5] * state.getSafeMoves((player + 1) % 2);
    if ((state.getSafeMoves(player) > state.getMaxMoves((player + 1) % 2)) || (state.turn % 2 !== player && state.getSafeMoves(player) >= state.getMaxMoves((player + 1) % 2))) {
        return normalResult + state.numFields * state.numFields;
    }
    else if ((state.getMaxMoves(player) < state.getSafeMoves((player + 1) % 2)) || (state.turn % 2 === player && state.getMaxMoves(player) <= state.getSafeMoves((player + 1) % 2))) {
        return normalResult - state.numFields * state.numFields;
    }
    return normalResult;
};
var AI = (function () {
    function AI(name, weight, params) {
        this.name = name;
        this.weight = weight;
        this.params = params;
    }
    AI.prototype.place = function (state) {
        var _this = this;
        if (state.availableMoves[state.turn % 2].length === 1) {
            return state.availableMoves[state.turn % 2][0];
        }
        var weightedMoves = state.availableMoves[state.turn % 2].map(function (position) {
            return ({ position: position, quality: _this.weight(state.placeAt(position), state.turn % 2, _this.params) });
        });
        var bestOptionScore = Math.max.apply(Math, weightedMoves.map(function (weightedMove) { return weightedMove.quality; }));
        var bestOptions = weightedMoves.filter(function (weightedMove) { return weightedMove.quality === bestOptionScore; });
        var chosenOption = chooseRandom(bestOptions);
        return chosenOption !== undefined ? chosenOption.position : undefined;
    };
    return AI;
}());
var AI_MaxMin = (function (_super) {
    __extends(AI_MaxMin, _super);
    function AI_MaxMin(name, weight, params, dynDepthFactor) {
        var _this = _super.call(this, name, weight, params) || this;
        _this.dynDepthFactor = dynDepthFactor;
        return _this;
    }
    AI_MaxMin.prototype.rateMaxMin = function (state, player, depth) {
        var _this = this;
        if (depth === 1 || state.availableMoves[state.turn % 2].length === 0) {
            return this.weight(state, player, this.params);
        }
        else {
            var childScores = state.availableMoves[state.turn % 2].map(function (position) {
                return _this.rateMaxMin(state.placeAt(position), player, depth - 1);
            });
            if (state.turn % 2 === player) {
                return Math.max.apply(Math, childScores);
            }
            else {
                return Math.min.apply(Math, childScores);
            }
        }
    };
    AI_MaxMin.prototype.place = function (state) {
        var _this = this;
        if (state.availableMoves[state.turn % 2].length === 1) {
            return state.availableMoves[state.turn % 2][0];
        }
        var start = new Date().getTime();
        var dynDepth = 1 + this.dynDepthFactor / Math.sqrt(state.availableMoves[0].length + state.availableMoves[1].length);
        if (DEBUG) {
            console.log(dynDepth);
        }
        var weightedMoves = state.availableMoves[state.turn % 2].map(function (position) {
            return ({ position: position, quality: _this.rateMaxMin(state.placeAt(position), state.turn % 2, Math.floor(dynDepth)) });
        });
        if (DEBUG) {
            console.log(new Date().getTime() - start);
        }
        var bestOptionScore = Math.max.apply(Math, weightedMoves.map(function (weightedMove) { return weightedMove.quality; }));
        var bestOptions = weightedMoves.filter(function (weightedMove) { return weightedMove.quality === bestOptionScore; });
        var chosenOption = chooseRandom(bestOptions);
        return chosenOption !== undefined ? chosenOption.position : undefined;
    };
    return AI_MaxMin;
}(AI));
var AI_AlphaBeta = (function (_super) {
    __extends(AI_AlphaBeta, _super);
    function AI_AlphaBeta(name, weight, params, dynDepthFactor) {
        var _this = _super.call(this, name, weight, params) || this;
        _this.dynDepthFactor = dynDepthFactor;
        return _this;
    }
    AI_AlphaBeta.prototype.rateAlphaBeta = function (state, player, depth, alpha, beta) {
        var _this = this;
        if (depth === 1 || state.availableMoves[state.turn % 2].length === 0) {
            return this.weight(state, player, this.params);
        }
        else {
            if (state.turn % 2 === player) {
                var maxValue = alpha;
                if (depth <= 2) {
                    for (var _i = 0, _a = state.availableMoves[state.turn % 2]; _i < _a.length; _i++) {
                        var position = _a[_i];
                        var curValue = this.rateAlphaBeta(state.placeAt(position), player, depth - 1, maxValue, beta);
                        if (curValue > maxValue) {
                            maxValue = curValue;
                            if (maxValue >= beta) {
                                break;
                            }
                        }
                    }
                }
                else {
                    var possibleOutcomes = state.availableMoves[state.turn % 2].map(function (position) {
                        var newState = state.placeAt(position);
                        return [newState, _this.weight(newState, player, _this.params)];
                    });
                    possibleOutcomes.sort(function (possibilityA, possibilityB) { return (possibilityB[1] - possibilityA[1]); });
                    for (var _b = 0, possibleOutcomes_1 = possibleOutcomes; _b < possibleOutcomes_1.length; _b++) {
                        var outcome = possibleOutcomes_1[_b];
                        var curValue = this.rateAlphaBeta(outcome[0], player, depth - 1, maxValue, beta);
                        if (curValue > maxValue) {
                            maxValue = curValue;
                            if (maxValue >= beta) {
                                break;
                            }
                        }
                    }
                }
                return maxValue;
            }
            else {
                var minValue = beta;
                if (depth <= 2) {
                    for (var _c = 0, _d = state.availableMoves[state.turn % 2]; _c < _d.length; _c++) {
                        var position = _d[_c];
                        var curValue = this.rateAlphaBeta(state.placeAt(position), player, depth - 1, alpha, minValue);
                        if (curValue < minValue) {
                            minValue = curValue;
                            if (minValue <= alpha) {
                                break;
                            }
                        }
                    }
                }
                else {
                    var possibleOutcomes = state.availableMoves[state.turn % 2].map(function (position) {
                        var newState = state.placeAt(position);
                        return [newState, _this.weight(newState, player, _this.params)];
                    });
                    possibleOutcomes.sort(function (possibilityA, possibilityB) { return (possibilityA[1] - possibilityB[1]); });
                    for (var _e = 0, possibleOutcomes_2 = possibleOutcomes; _e < possibleOutcomes_2.length; _e++) {
                        var outcome = possibleOutcomes_2[_e];
                        var curValue = this.rateAlphaBeta(outcome[0], player, depth - 1, alpha, minValue);
                        if (curValue < minValue) {
                            minValue = curValue;
                            if (minValue <= alpha) {
                                break;
                            }
                        }
                    }
                }
                return minValue;
            }
        }
    };
    AI_AlphaBeta.prototype.place = function (state) {
        var _this = this;
        if (state.availableMoves[state.turn % 2].length === 1) {
            return state.availableMoves[state.turn % 2][0];
        }
        var start = new Date().getTime();
        var dynDepth = 1 + this.dynDepthFactor / Math.sqrt(state.availableMoves[0].length + state.availableMoves[1].length);
        if (DEBUG) {
            console.log(dynDepth);
        }
        var maxValue = Number.NEGATIVE_INFINITY;
        var bestOption;
        var possibleOutcomes = state.availableMoves[state.turn % 2].map(function (position) {
            var newState = state.placeAt(position);
            return [position, newState, _this.weight(newState, state.turn % 2, _this.params)];
        });
        possibleOutcomes.sort(function (possibilityA, possibilityB) { return (possibilityB[2] - possibilityA[2]); });
        for (var _i = 0, possibleOutcomes_3 = possibleOutcomes; _i < possibleOutcomes_3.length; _i++) {
            var outcome = possibleOutcomes_3[_i];
            var curValue = this.rateAlphaBeta(outcome[1], state.turn % 2, Math.floor(dynDepth), maxValue, Number.POSITIVE_INFINITY);
            if (curValue > maxValue) {
                maxValue = curValue;
                bestOption = outcome[0];
            }
        }
        if (DEBUG) {
            console.log(new Date().getTime() - start);
        }
        return bestOption;
    };
    return AI_AlphaBeta;
}(AI));
var AI_AlphaBeta_TT = (function (_super) {
    __extends(AI_AlphaBeta_TT, _super);
    function AI_AlphaBeta_TT(name, weight, params, dynDepthFactor) {
        var _this = _super.call(this, name, weight, params) || this;
        _this.dynDepthFactor = dynDepthFactor;
        return _this;
    }
    AI_AlphaBeta_TT.prototype.rateAlphaBetaTT = function (state, player, depth, alpha, beta, transpositionTable) {
        var _this = this;
        if (depth === 1 || state.availableMoves[state.turn % 2].length === 0) {
            return this.weight(state, player, this.params);
        }
        else {
            if (depth >= 3) {
                var cachedValue = transpositionTable.getValue(state);
                if (cachedValue !== undefined) {
                    return cachedValue;
                }
            }
            var result = void 0;
            if (state.turn % 2 === player) {
                var maxValue = alpha;
                if (depth <= 2) {
                    for (var _i = 0, _a = state.availableMoves[state.turn % 2]; _i < _a.length; _i++) {
                        var position = _a[_i];
                        var curValue = this.rateAlphaBetaTT(state.placeAt(position), player, depth - 1, maxValue, beta, transpositionTable);
                        if (curValue > maxValue) {
                            maxValue = curValue;
                            if (maxValue >= beta) {
                                break;
                            }
                        }
                    }
                }
                else {
                    var possibleOutcomes = state.availableMoves[state.turn % 2].map(function (position) {
                        var newState = state.placeAt(position);
                        return [newState, _this.weight(newState, player, _this.params)];
                    });
                    possibleOutcomes.sort(function (possibilityA, possibilityB) { return (possibilityB[1] - possibilityA[1]); });
                    for (var _b = 0, possibleOutcomes_4 = possibleOutcomes; _b < possibleOutcomes_4.length; _b++) {
                        var outcome = possibleOutcomes_4[_b];
                        var curValue = this.rateAlphaBetaTT(outcome[0], player, depth - 1, maxValue, beta, transpositionTable);
                        if (curValue > maxValue) {
                            maxValue = curValue;
                            if (maxValue >= beta) {
                                break;
                            }
                        }
                    }
                }
                result = maxValue;
            }
            else {
                var minValue = beta;
                if (depth <= 2) {
                    for (var _c = 0, _d = state.availableMoves[state.turn % 2]; _c < _d.length; _c++) {
                        var position = _d[_c];
                        var curValue = this.rateAlphaBetaTT(state.placeAt(position), player, depth - 1, alpha, minValue, transpositionTable);
                        if (curValue < minValue) {
                            minValue = curValue;
                            if (minValue <= alpha) {
                                break;
                            }
                        }
                    }
                }
                else {
                    var possibleOutcomes = state.availableMoves[state.turn % 2].map(function (position) {
                        var newState = state.placeAt(position);
                        return [newState, _this.weight(newState, player, _this.params)];
                    });
                    possibleOutcomes.sort(function (possibilityA, possibilityB) { return (possibilityA[1] - possibilityB[1]); });
                    for (var _e = 0, possibleOutcomes_5 = possibleOutcomes; _e < possibleOutcomes_5.length; _e++) {
                        var outcome = possibleOutcomes_5[_e];
                        var curValue = this.rateAlphaBetaTT(outcome[0], player, depth - 1, alpha, minValue, transpositionTable);
                        if (curValue < minValue) {
                            minValue = curValue;
                            if (minValue <= alpha) {
                                break;
                            }
                        }
                    }
                }
                result = minValue;
            }
            if (depth >= 3) {
                transpositionTable.setValue(state, result);
            }
            return result;
        }
    };
    AI_AlphaBeta_TT.prototype.place = function (state) {
        var _this = this;
        if (state.availableMoves[state.turn % 2].length === 1) {
            return state.availableMoves[state.turn % 2][0];
        }
        var start = new Date().getTime();
        var transpositionTable = new TranspositionTable(state.numFields);
        var dynDepth = 1 + this.dynDepthFactor / Math.sqrt(state.availableMoves[0].length + state.availableMoves[1].length);
        if (DEBUG) {
            console.log(dynDepth);
        }
        var maxValue = Number.NEGATIVE_INFINITY;
        var bestOption;
        var possibleOutcomes = state.availableMoves[state.turn % 2].map(function (position) {
            var newState = state.placeAt(position);
            return [position, newState, _this.weight(newState, state.turn % 2, _this.params)];
        });
        possibleOutcomes.sort(function (possibilityA, possibilityB) { return (possibilityB[2] - possibilityA[2]); });
        for (var _i = 0, possibleOutcomes_6 = possibleOutcomes; _i < possibleOutcomes_6.length; _i++) {
            var outcome = possibleOutcomes_6[_i];
            var curValue = this.rateAlphaBetaTT(outcome[1], state.turn % 2, Math.floor(dynDepth), maxValue, Number.POSITIVE_INFINITY, transpositionTable);
            if (curValue > maxValue) {
                maxValue = curValue;
                bestOption = outcome[0];
            }
        }
        if (DEBUG) {
            console.log(transpositionTable.hits, transpositionTable.misses);
            console.log(new Date().getTime() - start);
        }
        return bestOption;
    };
    return AI_AlphaBeta_TT;
}(AI));
var AI_AlphaBeta_TT_SO = (function (_super) {
    __extends(AI_AlphaBeta_TT_SO, _super);
    function AI_AlphaBeta_TT_SO(name, weight, params, dynDepthFactor) {
        var _this = _super.call(this, name, weight, params) || this;
        _this.dynDepthFactor = dynDepthFactor;
        return _this;
    }
    AI_AlphaBeta_TT_SO.prototype.rateAlphaBetaTTSO = function (state, player, depth, alpha, beta, transpositionTable) {
        var _this = this;
        if (depth === 1 || state.availableMoves[state.turn % 2].length === 0) {
            return this.weight(state, player, this.params);
        }
        else {
            if (depth >= 3) {
                var cachedValue = transpositionTable.getValue(state);
                if (cachedValue !== undefined) {
                    return cachedValue;
                }
            }
            var result = void 0;
            if (state.turn % 2 === player) {
                var maxValue = alpha;
                if (depth <= 2) {
                    for (var _i = 0, _a = state.availableMoves[state.turn % 2]; _i < _a.length; _i++) {
                        var position = _a[_i];
                        var curValue = this.rateAlphaBetaTTSO(state.placeAt(position), player, depth - 1, maxValue, beta, transpositionTable);
                        if (curValue > maxValue) {
                            maxValue = curValue;
                            if (maxValue >= beta) {
                                break;
                            }
                        }
                    }
                }
                else {
                    var possibleOutcomes = state.availableMoves[state.turn % 2].map(function (position) {
                        var newState = state.placeAt(position);
                        return [newState, _this.weight(newState, player, _this.params)];
                    });
                    if (state.getSafeMoves(state.turn % 2) > 0 && state.getMaxMoves(state.turn % 2) > state.getSafeMoves(state.turn % 2)) {
                        possibleOutcomes = possibleOutcomes.filter(function (possibility) { return (possibility[0].availableMoves[(state.turn + 1) % 2].length < state.availableMoves[(state.turn + 1) % 2].length); });
                    }
                    possibleOutcomes.sort(function (possibilityA, possibilityB) { return (possibilityB[1] - possibilityA[1]); });
                    for (var _b = 0, possibleOutcomes_7 = possibleOutcomes; _b < possibleOutcomes_7.length; _b++) {
                        var outcome = possibleOutcomes_7[_b];
                        var curValue = this.rateAlphaBetaTTSO(outcome[0], player, depth - 1, maxValue, beta, transpositionTable);
                        if (curValue > maxValue) {
                            maxValue = curValue;
                            if (maxValue >= beta) {
                                break;
                            }
                        }
                    }
                }
                result = maxValue;
            }
            else {
                var minValue = beta;
                if (depth <= 2) {
                    for (var _c = 0, _d = state.availableMoves[state.turn % 2]; _c < _d.length; _c++) {
                        var position = _d[_c];
                        var curValue = this.rateAlphaBetaTTSO(state.placeAt(position), player, depth - 1, alpha, minValue, transpositionTable);
                        if (curValue < minValue) {
                            minValue = curValue;
                            if (minValue <= alpha) {
                                break;
                            }
                        }
                    }
                }
                else {
                    var possibleOutcomes = state.availableMoves[state.turn % 2].map(function (position) {
                        var newState = state.placeAt(position);
                        return [newState, _this.weight(newState, player, _this.params)];
                    });
                    if (state.getSafeMoves(state.turn % 2) > 0 && state.getMaxMoves(state.turn % 2) > state.getSafeMoves(state.turn % 2)) {
                        possibleOutcomes = possibleOutcomes.filter(function (possibility) { return (possibility[0].availableMoves[(state.turn + 1) % 2].length < state.availableMoves[(state.turn + 1) % 2].length); });
                    }
                    possibleOutcomes.sort(function (possibilityA, possibilityB) { return (possibilityA[1] - possibilityB[1]); });
                    for (var _e = 0, possibleOutcomes_8 = possibleOutcomes; _e < possibleOutcomes_8.length; _e++) {
                        var outcome = possibleOutcomes_8[_e];
                        var curValue = this.rateAlphaBetaTTSO(outcome[0], player, depth - 1, alpha, minValue, transpositionTable);
                        if (curValue < minValue) {
                            minValue = curValue;
                            if (minValue <= alpha) {
                                break;
                            }
                        }
                    }
                }
                result = minValue;
            }
            if (depth >= 3) {
                transpositionTable.setValue(state, result);
            }
            return result;
        }
    };
    AI_AlphaBeta_TT_SO.prototype.place = function (state) {
        var _this = this;
        if (state.availableMoves[state.turn % 2].length === 1) {
            return state.availableMoves[state.turn % 2][0];
        }
        var start = new Date().getTime();
        var transpositionTable = new TranspositionTable(state.numFields);
        var dynDepth = 1 + this.dynDepthFactor / Math.sqrt(state.availableMoves[0].length + state.availableMoves[1].length);
        if (DEBUG) {
            console.log(dynDepth);
        }
        var maxValue = Number.NEGATIVE_INFINITY;
        var bestOption;
        var possibleOutcomes = state.availableMoves[state.turn % 2].map(function (position) {
            var newState = state.placeAt(position);
            return [position, newState, _this.weight(newState, state.turn % 2, _this.params)];
        });
        if (state.getSafeMoves(state.turn % 2) > 0 && state.getMaxMoves(state.turn % 2) > state.getSafeMoves(state.turn % 2)) {
            possibleOutcomes = possibleOutcomes.filter(function (possibility) { return (possibility[1].availableMoves[(state.turn + 1) % 2].length < state.availableMoves[(state.turn + 1) % 2].length); });
        }
        possibleOutcomes.sort(function (possibilityA, possibilityB) { return (possibilityB[2] - possibilityA[2]); });
        for (var _i = 0, possibleOutcomes_9 = possibleOutcomes; _i < possibleOutcomes_9.length; _i++) {
            var outcome = possibleOutcomes_9[_i];
            var curValue = this.rateAlphaBetaTTSO(outcome[1], state.turn % 2, Math.floor(dynDepth), maxValue, Number.POSITIVE_INFINITY, transpositionTable);
            if (curValue > maxValue) {
                maxValue = curValue;
                bestOption = outcome[0];
            }
        }
        if (DEBUG) {
            console.log(transpositionTable.hits, transpositionTable.misses);
            console.log(new Date().getTime() - start);
        }
        return bestOption;
    };
    return AI_AlphaBeta_TT_SO;
}(AI));
var ais = [
    new AI("Random \"AI\" (Lv. 0.0)", weightRandom, []),
    new AI("Easy AI (Lv. 1.0)", weightSmart, []),
    new AI("Safe AI (Lv. 1.1)", weightSafe, []),
    new AI_MaxMin("MaxMin AI (Lv. 2.0)", weightSafe, [], 20),
    new AI_AlphaBeta("AlphaBeta AI (Lv. 3.0)", weightSafe, [], 40),
    new AI_AlphaBeta("AlphaBeta AI (Lv. 3.1)", weightFullParametersAdd, [0.5, -2, 1, -1.5, 5, -3], 45),
    new AI_AlphaBeta_TT("AlphaBeta TT AI (Lv. 3.2)", weightFullParametersAdd, [0.5, -2, 1, -1.5, 5, -3], 50),
    new AI_AlphaBeta_TT_SO("AlphaBeta TT AI (Lv. 3.3)", weightFullParametersAddWL, [0.5, -2, 1, -1.5, 5, -3], 55)
];
var GameState = (function () {
    function GameState(numFields, field, turn, availableMoves) {
        this.numFields = numFields;
        this.field = field;
        this.turn = turn;
        this.availableMoves = availableMoves;
        this.maxMoves = [undefined, undefined];
        this.safeMoves = [undefined, undefined];
    }
    GameState.createGameState = function (numFields) {
        var field = [];
        for (var y = 0; y < numFields; y++) {
            field[y] = [];
            for (var x = 0; x < numFields; x++) {
                field[y][x] = 0;
            }
        }
        var availableMoves = [[], []];
        for (var row = 0; row < numFields - 1; row++) {
            for (var col = 0; col < numFields; col++) {
                availableMoves[1].push({ row: row, col: col });
            }
        }
        for (var row = 0; row < numFields; row++) {
            for (var col = 0; col < numFields - 1; col++) {
                availableMoves[0].push({ row: row, col: col });
            }
        }
        return new GameState(numFields, field, 1, availableMoves);
    };
    GameState.prototype.getMaxMoves = function (player) {
        if (this.maxMoves[player] === undefined) {
            var numMoves = 0;
            if (player === 1) {
                for (var col = 0; col < this.numFields; col++) {
                    for (var row = 0; row < this.numFields - 1; row++) {
                        if (this.field[row][col] === 0 && this.field[row + 1][col] === 0) {
                            numMoves++;
                            row++;
                        }
                    }
                }
            }
            else if (player === 0) {
                for (var row = 0; row < this.numFields; row++) {
                    for (var col = 0; col < this.numFields - 1; col++) {
                        if (this.field[row][col] === 0 && this.field[row][col + 1] === 0) {
                            numMoves++;
                            col++;
                        }
                    }
                }
            }
            this.maxMoves[player] = numMoves;
        }
        return this.maxMoves[player];
    };
    GameState.prototype.getSafeMoves = function (player) {
        if (this.safeMoves[player] === undefined) {
            var numMoves = 0;
            if (player === 1) {
                for (var col = 0; col < this.numFields; col++) {
                    for (var row = 0; row < this.numFields - 1; row++) {
                        if (this.field[row][col] === 0 && this.field[row + 1][col] === 0
                            && (col <= 0 || (this.field[row][col - 1] !== 0 && this.field[row + 1][col - 1] !== 0))
                            && (col >= this.numFields - 1 || (this.field[row][col + 1] !== 0 && this.field[row + 1][col + 1] !== 0))) {
                            numMoves++;
                            row++;
                        }
                    }
                }
            }
            else if (player === 0) {
                for (var row = 0; row < this.numFields; row++) {
                    for (var col = 0; col < this.numFields - 1; col++) {
                        if (this.field[row][col] === 0 && this.field[row][col + 1] === 0
                            && (row <= 0 || (this.field[row - 1][col] !== 0 && this.field[row - 1][col + 1] !== 0))
                            && (row >= this.numFields - 1 || (this.field[row + 1][col] !== 0 && this.field[row + 1][col + 1] !== 0))) {
                            numMoves++;
                            col++;
                        }
                    }
                }
            }
            this.safeMoves[player] = numMoves;
        }
        return this.safeMoves[player];
    };
    GameState.prototype.placeAt = function (position) {
        var newField = [];
        for (var y = 0; y < this.numFields; y++) {
            newField[y] = [];
            for (var x = 0; x < this.numFields; x++) {
                newField[y][x] = this.field[y][x];
            }
        }
        if (this.turn % 2 === 1) {
            if (this.field[position.row][position.col] === 0 && this.field[position.row + 1][position.col] === 0) {
                newField[position.row][position.col] = 1;
                newField[position.row + 1][position.col] = 1;
            }
            else {
                console.log("Player 1 was about to make an illegal move!");
                return this;
            }
        }
        else {
            if (this.field[position.row][position.col] === 0 && this.field[position.row][position.col + 1] === 0) {
                newField[position.row][position.col] = 2;
                newField[position.row][position.col + 1] = 2;
            }
            else {
                console.log("Player 2 was about to make an illegal move!");
                return this;
            }
        }
        var newMoves1 = this.availableMoves[1].filter(function (_a) {
            var row = _a.row, col = _a.col;
            return newField[row][col] === 0 && newField[row + 1][col] === 0;
        });
        var newMoves2 = this.availableMoves[0].filter(function (_a) {
            var row = _a.row, col = _a.col;
            return newField[row][col] === 0 && newField[row][col + 1] === 0;
        });
        return new GameState(this.numFields, newField, this.turn + 1, [newMoves2, newMoves1]);
    };
    return GameState;
}());
var Game = (function () {
    function Game(numFields, playerTypes) {
        this.playerTypes = playerTypes;
        this.state = GameState.createGameState(numFields);
    }
    return Game;
}());
var TOURNAMENT_PLAYS = [
    [0, 0, 0, 9, 7, 4, 2],
    [0, 0, 0, 1, 2, 2, 1, 2, 3],
    [0, 0, 0, 10, 20, 20, 20, 10, 10, 2, 1]
];
var TOURNAMENT_WEIGHTS = [
    [0, 0, 0, 1, 3, 12, 48],
    [0, 0, 0, 2, 2, 2, 3, 3, 5],
    [0, 0, 0, 2, 2, 3, 4, 12, 24, 36, 48]
];
var GENETIC_POPULATION_SIZE = 20;
var GENETIC_ITERATIONS = 100;
var GENETIC_DEPTH_FACTOR = 20;
var GENETIC_WEIGHT_VARIANT = weightFullParametersAdd;
function testAISingle(ais, size) {
    var playthroughGame = GameState.createGameState(size);
    while (playthroughGame.availableMoves[playthroughGame.turn % 2].length > 0) {
        var aiMove = ais[playthroughGame.turn % 2].place(playthroughGame);
        if (aiMove !== undefined) {
            playthroughGame = playthroughGame.placeAt(aiMove);
        }
        else {
            console.error("AI didn't move");
            break;
        }
    }
    return playthroughGame.turn % 2 === 0 ? [0, 1] : [1, 0];
}
function testAIMultiple(_a, tournamentID) {
    var ai0 = _a[0], ai1 = _a[1];
    var wins = [0, 0];
    for (var boardSize = 0; boardSize < TOURNAMENT_PLAYS[tournamentID].length; boardSize++) {
        if (TOURNAMENT_PLAYS[tournamentID][boardSize] > 0) {
            for (var i = 0; i < TOURNAMENT_PLAYS[tournamentID][boardSize]; i++) {
                var result1 = testAISingle([ai0, ai1], boardSize);
                wins[0] += result1[0] * TOURNAMENT_WEIGHTS[tournamentID][boardSize];
                wins[1] += result1[1] * TOURNAMENT_WEIGHTS[tournamentID][boardSize];
                var result2 = testAISingle([ai1, ai0], boardSize);
                wins[0] += result2[1] * TOURNAMENT_WEIGHTS[tournamentID][boardSize];
                wins[1] += result2[0] * TOURNAMENT_WEIGHTS[tournamentID][boardSize];
            }
        }
    }
    return wins;
}
function genetic() {
    var population = [];
    for (var i = 0; i < GENETIC_POPULATION_SIZE; i++) {
        population.push([new AI_AlphaBeta("initial", GENETIC_WEIGHT_VARIANT, [0, 0, 0, 0, 0, 0], GENETIC_DEPTH_FACTOR), 0, 0]);
    }
    for (var iteration = 0; iteration < GENETIC_ITERATIONS; iteration++) {
        for (var _i = 0, population_1 = population; _i < population_1.length; _i++) {
            var entity = population_1[_i];
            entity[1] = 0;
            entity[2] = 0;
        }
        for (var _a = 0, population_2 = population; _a < population_2.length; _a++) {
            var entity = population_2[_a];
            var result = testAIMultiple([entity[0], ais[2]], 0);
            entity[1] += result[0];
            entity[2] += result[1];
        }
        population.sort(function (a, b) { return (b[1] - b[2]) - (a[1] - a[2]); });
        console.log(String(iteration + 1) + " iterations done, top 10:");
        var tableContent = [];
        for (var i = 0; i < 10; i++) {
            tableContent.push([population[i][0].name].concat((population[i][0].params.map(function (param) { return param.toFixed(3); })), [population[i][1], population[i][2]]));
        }
        console.table(tableContent);
        var paramsSum = [0, 0, 0, 0, 0, 0];
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 6; j++) {
                paramsSum[j] += (10 - i) * population[i][0].params[j];
            }
        }
        population[GENETIC_POPULATION_SIZE / 2][0] = new AI_AlphaBeta("avg(" + String(iteration + 1) + ")", GENETIC_WEIGHT_VARIANT, paramsSum.map(function (param) { return (param / 55); }), GENETIC_DEPTH_FACTOR);
        for (var i = GENETIC_POPULATION_SIZE / 2 + 1; i < GENETIC_POPULATION_SIZE; i++) {
            var parent_1 = population[Math.floor(Math.random() * Math.random() * GENETIC_POPULATION_SIZE / 2)][0];
            var randomizedParams = [0, 0, 0, 0, 0, 0];
            for (var j = 0; j < 6; j++) {
                randomizedParams[j] = parent_1.params[j] + Math.random() * Math.random() * (Math.random() < 0.5 ? 1 : -1);
            }
            population[i][0] = new AI_AlphaBeta(parent_1.name + "-" + String(i - GENETIC_POPULATION_SIZE / 2), GENETIC_WEIGHT_VARIANT, randomizedParams, GENETIC_DEPTH_FACTOR);
        }
    }
    console.log("end-avg: ", population[GENETIC_POPULATION_SIZE / 2][0].params.map(function (param) { return param.toFixed(3); }));
}
var colorBoard1 = "#686868";
var colorBoard2 = "#989898";
var colorHoverWhite = "rgba(240, 240, 240, 0.7)";
var colorHoverBlack = "rgba(16, 16, 16, 0.7)";
var colorWhite = "#F0F0F0";
var colorBlack = "#101010";
var colorBorderDefault = "#404040";
var colorBorderWon = "#00FF00";
var colorBorderLost = "#FF0000";
var sleepTime = 300;
var DEBUG = false;
var statsTurn;
var statsMoves;
var statsMaxMoves;
var statsSafeMoves;
var playerSelectors;
var canvas;
var ctx;
var dimension;
var displayScale;
var timeoutAI;
var isTouch = false;
var touchPreview = false;
var mousePosition;
var hoverPosition;
var game;
window.onload = function () {
    canvas = document.getElementById("cnvs");
    canvas.onselectstart = function () { return false; };
    ctx = canvas.getContext("2d");
    statsTurn = document.getElementById("stats_turn");
    statsMoves = [
        document.getElementById("stats_moves_2"),
        document.getElementById("stats_moves_1")
    ];
    statsMaxMoves = [
        document.getElementById("stats_max_moves_2"),
        document.getElementById("stats_max_moves_1")
    ];
    statsSafeMoves = [
        document.getElementById("stats_safe_moves_2"),
        document.getElementById("stats_safe_moves_1")
    ];
    playerSelectors = [
        document.getElementById("newGame_player2"),
        document.getElementById("newGame_player1")
    ];
    for (var _i = 0, playerSelectors_1 = playerSelectors; _i < playerSelectors_1.length; _i++) {
        var playerSelector = playerSelectors_1[_i];
        for (var i = 0; i < ais.length; i++) {
            var option = document.createElement("option");
            option.value = String(i + 1);
            option.text = ais[i].name;
            playerSelector.add(option);
        }
    }
    playerSelectors[0].selectedIndex = 1;
    window.addEventListener("resize", resize, false);
    canvas.addEventListener("click", mouseClick, false);
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.addEventListener("mouseleave", mouseLeave, false);
    canvas.addEventListener("touchstart", touchEvent, false);
    resize();
    updateStats();
};
function newGame() {
    if (timeoutAI !== undefined) {
        clearTimeout(timeoutAI);
        timeoutAI = undefined;
    }
    game = new Game(parseInt(document.getElementById("newGame_size").value), playerSelectors.map(function (selector) { return parseInt(selector.value); }));
    for (var _i = 0, playerSelectors_2 = playerSelectors; _i < playerSelectors_2.length; _i++) {
        var playerSelector = playerSelectors_2[_i];
        playerSelector.style.borderColor = colorBorderDefault;
    }
    hoverPosition = undefined;
    touchPreview = false;
    render();
    updateStats();
    playIfAI();
}
function placeAt(position) {
    if (game !== undefined) {
        game.state = game.state.placeAt(position);
    }
    updateHover();
    render();
    updateStats();
    if (game !== undefined) {
        if (game.state.availableMoves[game.state.turn % 2].length === 0) {
            playerSelectors[game.state.turn % 2].style.borderColor = colorBorderLost;
            playerSelectors[(game.state.turn + 1) % 2].style.borderColor = colorBorderWon;
        }
        else {
            playIfAI();
        }
    }
}
function playIfAI() {
    if (game !== undefined && game.playerTypes[game.state.turn % 2] !== 0) {
        var gameConst_1 = game;
        timeoutAI = setTimeout(function () {
            timeoutAI = undefined;
            var aiMove = ais[gameConst_1.playerTypes[gameConst_1.state.turn % 2] - 1].place(gameConst_1.state);
            if (aiMove !== undefined) {
                placeAt(aiMove);
            }
            else {
                console.error("AI didn't move");
            }
        }, sleepTime);
    }
}
function updateHover() {
    var newHover;
    if (mousePosition !== undefined && game !== undefined) {
        if (game.state.turn % 2 === 1 && game.playerTypes[1] === 0) {
            var newX = clamp(Math.floor(mousePosition.x * game.state.numFields / dimension), 0, game.state.numFields - 1);
            var newY = clamp(Math.floor(mousePosition.y * game.state.numFields / dimension - 0.5), 0, game.state.numFields - 2);
            if (game.state.field[newY][newX] === 0 && game.state.field[newY + 1][newX] === 0) {
                newHover = { row: newY, col: newX };
            }
        }
        else if (game.state.turn % 2 === 0 && game.playerTypes[0] === 0) {
            var newX = clamp(Math.floor(mousePosition.x * game.state.numFields / dimension - 0.5), 0, game.state.numFields - 2);
            var newY = clamp(Math.floor(mousePosition.y * game.state.numFields / dimension), 0, game.state.numFields - 1);
            if (game.state.field[newY][newX] === 0 && game.state.field[newY][newX + 1] === 0) {
                newHover = { row: newY, col: newX };
            }
        }
    }
    if (((hoverPosition === undefined) !== (newHover === undefined)) || (hoverPosition !== undefined && newHover !== undefined
        && (hoverPosition.row !== newHover.row || hoverPosition.col !== newHover.col))) {
        hoverPosition = newHover;
        touchPreview = false;
        return true;
    }
    return false;
}
function resize() {
    displayScale = window.devicePixelRatio || 1;
    if (dimension !== canvas.clientWidth * displayScale) {
        dimension = canvas.clientWidth * displayScale;
        canvas.width = dimension;
        canvas.height = dimension;
        render();
    }
}
function touchEvent() {
    isTouch = true;
}
function mouseClick(event) {
    moveMouseTo(event);
    updateHover();
    if (isTouch && !touchPreview) {
        touchPreview = true;
    }
    else if (game !== undefined && hoverPosition !== undefined) {
        placeAt(hoverPosition);
    }
    isTouch = false;
}
function mouseMove(event) {
    moveMouseTo(event);
    if (updateHover()) {
        render();
    }
}
function mouseLeave() {
    moveMouseTo(undefined);
    if (updateHover()) {
        render();
    }
}
function moveMouseTo(event) {
    if (event !== undefined) {
        mousePosition = { x: event.offsetX * displayScale, y: event.offsetY * displayScale };
    }
    else {
        mousePosition = undefined;
    }
}
function updateStats() {
    if (game !== undefined) {
        statsTurn.value = String(game.state.turn);
        statsMoves[1].value = String(game.state.availableMoves[1].length);
        statsMoves[0].value = String(game.state.availableMoves[0].length);
        statsMaxMoves[1].value = String(game.state.getMaxMoves(1));
        statsMaxMoves[0].value = String(game.state.getMaxMoves(0));
        statsSafeMoves[1].value = String(game.state.getSafeMoves(1));
        statsSafeMoves[0].value = String(game.state.getSafeMoves(0));
    }
    else {
        statsTurn.value = "";
        statsMoves[1].value = "";
        statsMoves[0].value = "";
        statsMaxMoves[1].value = "";
        statsMaxMoves[0].value = "";
        statsSafeMoves[1].value = "";
        statsSafeMoves[0].value = "";
    }
}
function render() {
    ctx.fillStyle = colorBoard1;
    ctx.fillRect(0, 0, dimension, dimension);
    if (game !== undefined) {
        var fieldSize = dimension / game.state.numFields;
        ctx.fillStyle = colorBoard2;
        for (var row = 0; row < game.state.numFields; row++) {
            for (var col = 0; col < game.state.numFields; col++) {
                if ((row + col) % 2 === 0) {
                    ctx.fillRect(col * fieldSize, row * fieldSize, fieldSize, fieldSize);
                }
            }
        }
        ctx.fillStyle = colorWhite;
        for (var col = 0; col < game.state.numFields; col++) {
            for (var row = 0; row < game.state.numFields - 1; row++) {
                if (game.state.field[row][col] === 1 && game.state.field[row + 1][col] === 1) {
                    ctx.fillRect((col + 0.1) * fieldSize, (row + 0.1) * fieldSize, 0.8 * fieldSize, 1.8 * fieldSize);
                    row++;
                }
            }
        }
        ctx.fillStyle = colorBlack;
        for (var row = 0; row < game.state.numFields; row++) {
            for (var col = 0; col < game.state.numFields - 1; col++) {
                if (game.state.field[row][col] === 2 && game.state.field[row][col + 1] === 2) {
                    ctx.fillRect((col + 0.1) * fieldSize, (row + 0.1) * fieldSize, 1.8 * fieldSize, 0.8 * fieldSize);
                    col++;
                }
            }
        }
        if (hoverPosition !== undefined) {
            if (game.state.turn % 2 === 1) {
                ctx.fillStyle = colorHoverWhite;
                ctx.fillRect((hoverPosition.col + 0.15) * fieldSize, (hoverPosition.row + 0.15) * fieldSize, 0.7 * fieldSize, 1.7 * fieldSize);
            }
            else {
                ctx.fillStyle = colorHoverBlack;
                ctx.fillRect((hoverPosition.col + 0.15) * fieldSize, (hoverPosition.row + 0.15) * fieldSize, 1.7 * fieldSize, 0.7 * fieldSize);
            }
        }
    }
}
var NUM_32BIT_VALUES = 4294967296;
var TranspositionTable = (function () {
    function TranspositionTable(dimension) {
        this.hits = 0;
        this.misses = 0;
        this.dimension = dimension;
        this.zobrist = new Uint32Array(dimension * dimension);
        for (var i = 0; i < dimension * dimension; i++) {
            this.zobrist[i] = Math.random() * NUM_32BIT_VALUES;
        }
        this.dataTable = Object.create(null);
    }
    TranspositionTable.prototype.getValue = function (key) {
        var entry = this.dataTable[this.hash(key)];
        if (entry !== undefined && this.matches(entry.key, key)) {
            this.hits++;
            return entry.score;
        }
        this.misses++;
        return undefined;
    };
    TranspositionTable.prototype.setValue = function (key, score) {
        this.dataTable[this.hash(key)] = { key: key, score: score };
    };
    TranspositionTable.prototype.hash = function (key) {
        var hashValue = 0;
        for (var row = 0; row < this.dimension; row++) {
            for (var col = 0; col < this.dimension; col++) {
                if (key.field[row][col] !== 0) {
                    hashValue ^= this.zobrist[row * this.dimension + col];
                }
            }
        }
        return hashValue;
    };
    TranspositionTable.prototype.matches = function (key1, key2) {
        for (var row = 0; row < this.dimension; row++) {
            for (var col = 0; col < this.dimension; col++) {
                if ((key1.field[row][col] === 0) !== (key2.field[row][col] === 0)) {
                    return false;
                }
            }
        }
        return true;
    };
    return TranspositionTable;
}());
function sleep(millis) {
    var start = new Date().getTime();
    while (new Date().getTime() - start < millis) { }
}
function clamp(x, lower, upper) {
    return Math.min(Math.max(lower, x), upper);
}
function logBase(base, x) {
    return Math.log(x) / Math.log(base);
}
function chooseRandom(elements) {
    return elements.length > 0 ? elements[Math.floor(Math.random() * elements.length)] : undefined;
}
//# sourceMappingURL=game.js.map
