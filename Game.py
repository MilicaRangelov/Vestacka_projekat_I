from copy import deepcopy
from functools import cache, reduce
from Table import Table
import random
import concurrent.futures


class Game:
    def __init__(self):
        self.rows = 0
        self.cols = 0
        self.player = 'X'
        self.current_on_move = 'X'
        self.stanja = 0
        self.stanjahash = dict()
        self.abhash = dict()
        self.playedMoves = 0

    def set_table_size(self):
        self.rows = -1
        r = input("Unesite visina tabele(preporuceno 8): ")
        while self.rows < 0:
            i = -1
            try:
                i = int(r)
                self.rows = i
            except:
                r = input("Nije validna vrednosti, pokusaj ponovo: ")

        self.cols = -1
        r = input("Unesite sirinu tabele(preporuceno 8): ")
        while self.cols < 0:
            i = -1
            try:
                i = int(r)
                self.cols = i
            except:
                r = input("Nije validna vrednosti, pokusaj ponovo: ")

        self.table = Table(self.rows, self.cols)

    def set_player(self):
        self.player = input(
            "X ( vertikalno, prvi) ili O (horizontalno, drugi) : ")
        while self.player not in ['X', 'O']:
            self.player = input("Moguce je izabrati samo X ili O : ")
        print(self.player)

    def set_random_table(self):
        p = 'X'
        for i in range(int((self.rows * self.cols)/6)):
            x = -1
            y = -1
            while not self.table.is_valid(p, (x, y)):
                x = random.randrange(self.cols)
                y = random.randrange(self.rows)
            self.table.play(p, (x, y))
            p = 'X' if p == 'O' else 'O'
        self.table.draw_table()

    def next_move(self) -> bool:
        if (not self.table.can_play(self.current_on_move)):
            return False
        move = (0, 0)

        print("Trenutno igra : ", self.current_on_move)

        self.stanja = 0
        if self.current_on_move == self.player:
            # move = self.get_move_from_player()
            # game = self.table.call_MinMax(self.current_on_move)
           # move = self.get_next_move_alpha_beta()
            move = self.get_next_move_alpha_beta(self.current_on_move, 1 + self.playedMoves)
            self.table.play(self.current_on_move, move)
            print(move)
        else:
            print("POZIV AI")
            # move = self.get_move_from_player()
            # game = self.table.call_MinMax(self.current_on_move)
            move = self.get_next_move_alpha_beta(self.current_on_move, 1 + self.playedMoves)
            # move = self.get_move_from_player()
            self.playedMoves += 1
            self.table.play(self.current_on_move, move)
            print(move)

        print("Broj krajnjih stanja : ", self.stanja)

        print("Broj zagarantovanih poteza : ",
              self.table.safe_state_count(self.current_on_move))

        self.current_on_move = 'X' if self.current_on_move == 'O' else 'O'
        return True

    def get_move_from_player(self):
        move = (-1, -1)
        uspesno = False
        while not uspesno:
            r = (-1, -1)
            try:
                unos = str.split(input("Unesi potez u obliku \"BROJ BROJ\": "))
                if unos[1].isdigit():
                    r = (int(unos[0])-1, int(unos[1])-1)
                else:
                    r = (int(unos[0]) - 1, ord(unos[1]) - ord('A'))
                move = r
            except:
                print("Nevalidan unos")
                continue
            if not self.table.is_valid(self.current_on_move, move):
                print("Nevalidan potez")
            else:
                uspesno = True

        return move

    def draw_table(self):
        self.table.draw_table()

    def get_winner(self):
        if not self.table.can_play(self.current_on_move):
            return 'X' if self.current_on_move == 'O' else 'O'
        return "NO WINNER"

    def get_next_move_alpha_beta(self, player, depth):
        move = (-1, -1)

        bestMove = 0
        if (player == 'X'):
            bestMove = -9999
            for x in self.table.remaining_x:
                pov = self.table.play('X', x)
                score = self.alphabeta(
                    'O', depth-1, -9999, 9999, self.table.get_hash())
                self.table.restore(pov[1], pov[2], pov[3], pov[4])
                value = max(bestMove, score)
                if value > bestMove:
                    bestMove = value
                    move = x
        else:
            bestMove = 9999
            for x in self.table.remaining_o:
                pov = self.table.play('O', x)
                score = self.alphabeta(
                    'X', depth-1, -9999, 9999, self.table.get_hash())
                self.table.restore(pov[1], pov[2], pov[3], pov[4])
                value = min(bestMove, score)
                if value < bestMove:
                    bestMove = value
                    move = x

        return move

    # @cache
    def state_value(self, player, tablehash) -> int:
        # if tablehash in self.stanjahash.keys():
        #     return self.stanjahash[tablehash]

        self.stanja += 1
        score = self.table.safe_state_count(
            'X') - self.table.safe_state_count('O')

        # self.stanjahash[tablehash] = score
        return score

    # @cache
    def alphabeta(self, player, depth, alpha, beta, tablehash):
        if tablehash in self.abhash.keys():
            return self.abhash[tablehash]

        if depth == 0 or not self.table.can_play(player):
            return self.state_value(player, tablehash)

        if (player == 'X'):
            bestMove = -9999
            for x in self.table.remaining_x:
                pov = self.table.play('X', x)
                bestMove = self.alphabeta(
                    'O', depth-1, alpha, beta, self.table.get_hash())
                self.table.restore(pov[1], pov[2], pov[3], pov[4])
                alpha = max(bestMove, alpha)
                if beta <= alpha:
                    break
            self.abhash[tablehash] = bestMove
            return bestMove
        else:
            bestMove = 9999
            for x in self.table.remaining_o:
                pov = self.table.play('O', x)
                bestMove = self.alphabeta(
                    'X', depth-1, alpha, beta, self.table.get_hash())
                self.table.restore(pov[1], pov[2], pov[3], pov[4])
                beta = min(bestMove, beta)
                if beta <= alpha:
                    break
            self.abhash[tablehash] = bestMove
            return bestMove


def main():
    game = Game()
    game.set_table_size()
    game.set_player()
    game.draw_table()
    while game.next_move():
        game.draw_table()
    print("POBEDNIK : ", game.get_winner())


if __name__ == "__main__":
    main()
