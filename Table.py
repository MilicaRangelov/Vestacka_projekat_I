from functools import reduce
from cprint import cprint


class Table:
    def __init__(self, rows, cols) -> None:
        self.rows = rows
        self.cols = cols
        self.matrix = [[None for _ in range(self.cols)]
                       for _ in range(self.rows)]
        self.remaining_x = set()
        self.remaining_o = set()
        self.played_x = set()
        self.played_o = set()

        for i in range(rows-1):
            for j in range(cols):
                self.remaining_x.add((i, j))
        for i in range(rows):
            for j in range(cols-1):
                self.remaining_o.add((i, j))

    def draw_table(self) -> None:
        for move_x in self.played_x:
            self.matrix[move_x[0]][move_x[1]] = 'X'
        for move_y in self.played_o:
            self.matrix[move_y[0]][move_y[1]] = 'O'

        print(self.played_x, ' : ', self.remaining_x)
        print(self.played_o, ' : ', self.remaining_o)

        print(' ', end=' ')
        for i in range(1, self.cols+1):
            print('  ' + (chr(64+i)), end=' ')  # column indices
        print()
        print(' ', end=' ')
        for j in range(0, self.cols):  # horizontal walls
            print('===', end='=')
        print()
        for i in range(0, self.rows):
            print(chr(ord('0') + i + 1) if i <
                  10 else chr(ord('A')+i-10), end=' | ')  # row index
            for j in range(0, self.cols):  # cells and vertical walls

                if self.matrix[i][j] == None:
                    print(' ', end=' | ')
                else:
                    print(self.matrix[i][j], end=' | ')

                if (j == self.cols-1):
                    print(chr(ord('0') + i + 1), end='')
                    print()
            print(' ', end=' ')
            for j in range(0, self.cols):  # horizontal walls
                print('===', end='=')
            print()

        print(' ', end=' ')
        for i in range(1, self.cols+1):
            print('  ' + (chr(64+i)), end=' ')  # column indices
        print()
        return

    # def is_valid(self, player, move) -> bool:
    #     # print(move)
    #     if (len(move) != 2):
    #         return False
    #     i = move[0]
    #     j = move[1]
    #     if i < 0 or i >= self.rows:
    #         return False
    #     if j < 0 or j >= self.cols:
    #         return False
    #     if (player == 'X'):
    #         if i+1 >= self.rows:
    #             return False
    #         if self.matrix[i][j] != None or self.matrix[i+1][j] != None:
    #             return False
    #     if (player == 'O'):
    #         if j+1 >= self.cols:
    #             return False
    #         if self.matrix[i][j] != None or self.matrix[i][j+1] != None:
    #             return False
    #     return True

    def is_valid(self, player, move) -> bool:
        if player == 'X' and (move in self.remaining_x):
            return True
        if player == 'O' and (move in self.remaining_o):
            return True
        return False

    # def play(self, player, move) -> bool:
    #     if (not self.is_valid(player, move)):
    #         return False
    #     self.matrix[move[0]][move[1]] = player
    #     self.matrix[move[0] + (1 if player == 'X' else 0)
    #                 ][move[1] + (1 if player == 'O' else 0)] = player

    def play(self, player, move) -> bool:
        if not self.is_valid(player, move):
            return False
        if player == 'X':
            self.played_x.add(move)
            self.played_x.add((move[0] + 1, move[1]))
            self.remaining_x.discard(move)
            self.remaining_o.discard(move)
            self.remaining_o.discard((move[0], move[1] - 1))
            self.remaining_o.discard((move[0] + 1, move[1]))
            self.remaining_o.discard((move[0] + 1, move[1] - 1))
        else:
            self.played_o.add(move)
            self.played_o.add((move[0], move[1] + 1))
            self.remaining_o.discard(move)
            self.remaining_x.discard(move)
            self.remaining_x.discard((move[0] - 1, move[1]))
            self.remaining_x.discard((move[0] - 1, move[1] + 1))
            self.remaining_x.discard((move[0], move[1] + 1))

    def can_play(self, player) -> bool:
        for i in range(self.rows):
            for j in range(self.cols):
                if (self.is_valid(player, (i, j))):
                    return True
        return False
