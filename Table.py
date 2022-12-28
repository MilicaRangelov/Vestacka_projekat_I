from copy import deepcopy
from functools import reduce
from termcolor import cprint

from MinMax import MinMax


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
        return

    def draw_table(self) -> None:
        for move_x in self.played_x:
            self.matrix[move_x[0]][move_x[1]] = 'X'
        for move_y in self.played_o:
            self.matrix[move_y[0]][move_y[1]] = 'O'

        print(' ', end=' ')
        for i in range(1, self.cols+1):
            cprint('  ' + (chr(64+i)), 'grey',
                   attrs=['bold'], end=' ')  # column indices
        print()
        print(' ', end=' ')
        for j in range(0, self.cols):  # horizontal walls
            cprint('====', attrs=['bold'], end='')
        print()
        nrows = list(range(0, self.rows))
        nrows.reverse()
        for i in nrows:
            cprint('' + str(i + 1) if len(str(i+1)) > 1 else len(str(i+1))
                   * ' ' + str(i + 1), 'grey', attrs=['bold'], end='')
            cprint(' | ', attrs=['bold'], end='')        # row index
            for j in range(0, self.cols):  # cells and vertical walls

                if self.matrix[i][j] == None:
                    print(' ', end=' | ')
                else:
                    if self.matrix[i][j] == 'X':
                        cprint(self.matrix[i][j], 'red', end='')
                    else:
                        cprint(self.matrix[i][j], 'blue', end='')
                    cprint(' | ', attrs=['bold'], end='')

                if (j == self.cols-1):
                    cprint('' + str(i + 1) if len(str(i+1)) > 1 else len(str(i+1))*' ' + str(i + 1), 'grey',
                           attrs=['bold'], end='')
                    print()
            print(' ', end=' ')
            for j in range(0, self.cols):  # horizontal walls
                cprint('====', attrs=['bold'], end='')
            print()

        print(' ', end=' ')
        for i in range(1, self.cols+1):
            cprint('  ' + (chr(64+i)), 'grey',
                   attrs=['bold'], end=' ')  # column indices
        print()
        return

    def is_valid(self, player, move) -> bool:
        if player == 'X' and (move in self.remaining_x):
            return True
        if player == 'O' and (move in self.remaining_o):
            return True
        return False

    def play(self, player, move):
        (playedx, playedo, discardx, discardo) = (set(), set(), set(), set())

        if not self.is_valid(player, move):
            return (False, playedx, playedo, discardx, discardo)

        if player == 'X':
            self.played_x.add(move)
            self.played_x.add((move[0] + 1, move[1]))

            playedx.add(move)
            playedx.add((move[0] + 1, move[1]))

            self.remaining_x.remove(move)
            discardx.add(move)
            if (move[0] + 1, move[1]) in self.remaining_x:
                self.remaining_x.remove((move[0] + 1, move[1]))
                discardx.add((move[0] + 1, move[1]))

            if (move[0]-1, move[1]) in self.remaining_x:
                self.remaining_x.remove((move[0] - 1, move[1]))
                discardx.add((move[0] - 1, move[1]))

            if move in self.remaining_o:
                self.remaining_o.remove(move)
                discardo.add(move)

            if (move[0]+1, move[1]) in self.remaining_o:
                self.remaining_o.remove((move[0]+1, move[1]))
                discardo.add((move[0]+1, move[1]))

            if (move[0], move[1]-1) in self.remaining_o:
                self.remaining_o.remove((move[0], move[1]-1))
                discardo.add((move[0], move[1]-1))

            if (move[0]+1, move[1]-1) in self.remaining_o:
                self.remaining_o.remove((move[0]+1, move[1]-1))
                discardo.add((move[0]+1, move[1]-1))

        else:
            self.played_o.add(move)
            self.played_o.add((move[0], move[1] + 1))

            playedo.add(move)
            playedo.add((move[0], move[1] + 1))

            self.remaining_o.remove(move)
            discardo.add(move)

            if (move[0], move[1] + 1) in self.remaining_o:
                self.remaining_o.remove((move[0], move[1] + 1))
                discardo.add((move[0], move[1] + 1))

            if (move[0], move[1]-1) in self.remaining_o:
                discardo.add((move[0], move[1] - 1))
                self.remaining_o.remove((move[0], move[1] - 1))

            if move in self.remaining_x:
                self.remaining_x.remove(move)
                discardx.add(move)

            if (move[0], move[1]+1) in self.remaining_x:
                self.remaining_x.remove((move[0], move[1]+1))
                discardx.add((move[0], move[1]+1))

            if (move[0] - 1, move[1]) in self.remaining_x:
                self.remaining_x.remove((move[0] - 1, move[1]))
                discardx.add((move[0] - 1, move[1]))

            if (move[0] - 1, move[1] + 1) in self.remaining_x:
                self.remaining_x.remove((move[0] - 1, move[1] + 1))
                discardx.add((move[0] - 1, move[1] + 1))

        return (True, playedx, playedo, discardx, discardo)

    def restore(self, playedx, playedo, discardx, discardo):
        for p in playedx:
            self.played_x.remove(p)
        for p in playedo:
            self.played_o.remove(p)
        for p in discardx:
            self.remaining_x.add(p)
        for p in discardo:
            self.remaining_o.add(p)
        return

    def can_play(self, player) -> bool:
        if player == 'X':
            return len(self.remaining_x) > 0
        if player == 'O':
            return len(self.remaining_o) > 0
        return False

    def is_not_empty(self, move) -> bool:
        # in range
        if move[0] < 0 or move[1] < 0:
            return True
        if move in self.played_x or move in self.played_o:
            return True
        return False

    def call_MinMax(self, player):
        minmax = MinMax()
        return minmax.minimax((self, None), 6, player, (self, -10, None), (self, 10, None))

    def safe_state_count(self, player) -> int:
        num = 0
        if player == 'X':
            for s in self.remaining_x:
                if (s[0], s[1]) not in self.remaining_o and (s[0]+1, s[1]) not in self.remaining_o and (s[0], s[1]-1) not in self.remaining_o and (s[0]+1, s[1]-1) not in self.remaining_o:
                    num += 1
                    if (s[0] == 0 and (s[1] == 0 or s[1] == self.cols-1)) or (s[0] == self.rows-2 and (s[1] == 0 or s[1] == self.cols-1)):
                        num +=1
        else:
            for s in self.remaining_o:
                if (s[0], s[1]) not in self.remaining_x and (s[0], s[1]+1) not in self.remaining_x and (s[0]-1, s[1]) not in self.remaining_x and (s[0]-1, s[1]+1) not in self.remaining_x:
                    num += 1
                    if (s[1] == 0 and (s[0] == 0 or s[0] == self.rows-1)) or (s[1] == self.cols-2 and (s[0] == 0 or s[0] == self.rows-1)):
                        num += 2
        return num

    def set_table_by_creating(self, px, po):
        self.matrix = [[None for _ in range(self.cols)]
                       for _ in range(self.rows)]
        for x in px:
            self.matrix[x[0]][x[1]] = 'X'
            self.matrix[x[0]+1][x[1]] = 'X'
        for y in po:
            self.matrix[y[0]][y[1]] = 'O'
            self.matrix[y[0]][y[1]+1] = 'O'

        self.remaining_x = px
        self.remaining_o = po
        self.played_x = set()
        self.played_o = set()

        for i in len(self.matrix):
            for j in len(self.matrix[0]):
                if self.matrix[i][j] is None:
                    if self.matrix[i][j+1] is None:
                        self.remaining_o.add((i, j))
                    if self.matrix[i+1][j] is None:
                        self.remaining_x.add((i, j))

    def get_hash(self):
        return reduce(lambda a, b: a * (b[0]+1) * (b[1]+1), self.played_x, 1) * reduce(lambda a, b: a * (b[0]+1) * (b[1]+1), self.played_o, 2)
