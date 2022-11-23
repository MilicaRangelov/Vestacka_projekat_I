from functools import reduce
from cprint import cprint


class Table:
    def __init__(self, rows, cols) -> None:
        self.rows = rows
        self.cols = cols
        print(rows, " ", cols)
        self.matrix = [[None for _ in range(self.cols)]
                       for _ in range(self.rows)]

    def draw_table(self) -> None:
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

    def is_valid(self, player, move) -> bool:
        # print(move)
        if (len(move) != 2):
            return False
        i = move[0]
        j = move[1]
        if i < 0 or i >= self.rows:
            return False
        if j < 0 or j >= self.cols:
            return False
        if (player == 'X'):
            if i+1 >= self.rows:
                return False
            if self.matrix[i][j] != None or self.matrix[i+1][j] != None:
                return False
        if (player == 'O'):
            if j+1 >= self.cols:
                return False
            if self.matrix[i][j] != None or self.matrix[i][j+1] != None:
                return False
        return True

    def play(self, player, move) -> bool:
        if (not self.is_valid(player, move)):
            return False
        self.matrix[move[0]][move[1]] = player
        self.matrix[move[0] + (1 if player == 'X' else 0)
                    ][move[1] + (1 if player == 'O' else 0)] = player

    def can_play(self, player) -> bool:
        for i in range(self.rows):
            for j in range(self.cols):
                if (self.is_valid(player, (i, j))):
                    return True
        return False

# TESTING


def main():
    table = Table(4, 4)
    move = (0, 0)
    player = 'X'
    while table.can_play(player):
        table.draw_table()
        print("\nTrenutno igra : ", player)
        move = reduce(lambda a, b:
                      (*a, int(b if ord(b) >= ord('0') and ord(b) <= ord('9') else ord(b) - ord('A'))), str.split(input("Unesi potez: ")), tuple())  # unos tuple (x, y)
        while not table.is_valid(player, move):
            move = reduce(lambda a, b: (*a, int(b)-1), str.split(
                input("Nevalidan potez unesi validan potez: ")), tuple())  # unos tuple (x, y)
        table.play(player, move)
        player = 'X' if player is 'O' else 'O'
    table.draw_table()
    player = 'X' if player is 'O' else 'O'
    print("Pobednik : ", player)


if __name__ == "__main__":
    main()
