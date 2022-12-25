from functools import reduce
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
            move = self.get_move_from_player()
            #game = self.table.call_MinMax(self.current_on_move)
            self.table.play(self.current_on_move, move)
            print(move)
        else:
            print("POZIV AI")  # TODO : ovde cemo da pozovemo AI da odigra
            #move = self.get_move_from_player()
            game = self.table.call_MinMax(self.current_on_move)
            self.table.play(self.current_on_move, game[2])
            print(game[2])
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
