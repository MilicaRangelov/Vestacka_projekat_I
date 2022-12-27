from copy import deepcopy
from functools import cache, reduce
from Table import Table
import random


class Game:
    def __init__(self):
        self.rows = 0
        self.cols = 0
        self.player = 'X'
        self.current_on_move = 'X'

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

        if self.current_on_move == self.player:
            #move = self.get_move_from_player()
            # game = self.table.call_MinMax(self.current_on_move)
            move = self.get_next_move_alpha_beta()
            self.table.play(self.current_on_move, move)
            print(move)
        else:
            print("POZIV AI")  # TODO : ovde cemo da pozovemo AI da odigra
            # move = self.get_move_from_player()
            # game = self.table.call_MinMax(self.current_on_move)
            self.stanja = 0
            move = self.get_next_move_alpha_beta()
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

    def get_next_move(self):
        move = (-1, -1)
        if self.current_on_move == 'X':
            bestScore = -99
            for m in deepcopy(self.table.remaining_x):
                played = self.table.play('X', m)
                score = self.minimax('X', self.table)
                if bestScore < score:
                    bestScore = score
                    move = m
                self.table.restore(played[1], played[2], played[3], played[4])
        else:
            bestScore = 99
            for m in deepcopy(self.table.remaining_o):
                played = self.table.play('O', m)
                score = self.minimax('O', self.table)
                if bestScore > score:
                    bestScore = score
                    move = m
                self.table.restore(played[1], played[2], played[3], played[4])

        return move

    def get_next_move_alpha_beta(self):
        move = (-1, -1)
        score = 0
        if self.current_on_move == 'X':
            bestScore = -99999
            for m in (self.table.remaining_x):
                played = self.table.play('X', m)
                score = self.alphabeta(
                    'O', 10, -9999, 9999, self.table.get_hash())
                if bestScore < score:
                    bestScore = score
                    move = m
                self.table.restore(played[1], played[2], played[3], played[4])
            score = bestScore

        else:
            bestScore = 99999
            for m in (self.table.remaining_o):
                played = self.table.play('O', m)
                score = self.alphabeta(
                    'X', 10, -9999, 9999, self.table.get_hash())
                if bestScore > score:
                    bestScore = score
                    move = m
                self.table.restore(played[1], played[2], played[3], played[4])
            score = bestScore
        print(score)
        return move

    @cache
    def minimax(self, player, table) -> int:
        bestScore = 0
        if not table.can_play(player):
            return -1 if player == 'X' else 1

        if player == 'X':
            bestScore = 99
            for m in deepcopy(table.remaining_o):
                played = table.play('O', m)
                score = self.minimax('O', table)
                if bestScore > score:
                    bestScore = score
                table.restore(played[1], played[2], played[3], played[4])
        else:
            bestScore = -99
            for m in deepcopy(table.remaining_x):
                played = table.play('X', m)
                score = self.minimax('X', table)
                if bestScore < score:
                    bestScore = score
                table.restore(played[1], played[2], played[3], played[4])
        return bestScore

    # @cache
    def state_value(self, table) -> int:
        self.stanja += 1
        score = ((len(self.table.remaining_x) + 1) * (self.table.safe_state_count('X') + 1)) / \
            ((len(self.table.remaining_o) + 1) *
             (self.table.safe_state_count('O') + 1))
        #score = -(self.table.safe_state_count('X') + 1)
        return score if self.current_on_move == 'X' else -score
       # return -1 if self.table.safe_state_count('O') > self.table.safe_state_count('X') else 1
        # return self.table.safe_state_count('X') if self.current_on_move == 'X' else - self.table.safe_state_count('O')
        # return 1
        # return self.table.safe_state_count('X') - self.table.safe_state_count('O')
        # return ((len(self.table.remaining_x)+1) - (len(self.table.remaining_o) + 1))*(self.table.safe_state_count('X') - self.table.safe_state_count('O'))

    # @cache
    def alphabeta(self, player, depth, alpha, beta, tablehash):

        # print(tablehash)

        if depth == 0 or not self.table.can_play(player):
            return self.state_value(tablehash)

        if player == 'X':
            best_value = -0xFFFFFFFF
            for m in (self.table.remaining_x):
                played = self.table.play('X', m)
                score = self.alphabeta(
                    'O', depth-1, alpha, beta, self.table.get_hash())
                self.table.restore(played[1], played[2], played[3], played[4])
                best_value = max(best_value, score)
                alpha = max(alpha, best_value)
                if alpha >= beta:
                    return beta
            return alpha
        else:
            best_value = 0xFFFFFFFF
            for m in (self.table.remaining_o):
                played = self.table.play('O', m)
                score = self.alphabeta(
                    'X', depth-1, alpha, beta, self.table.get_hash())
                self.table.restore(played[1], played[2], played[3], played[4])
                best_value = min(best_value, score)
                beta = min(beta, best_value)
                if beta <= alpha:
                    return alpha
            return beta


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
