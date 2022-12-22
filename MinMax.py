import copy


class MinMax:

    def __init__(self) -> None:
        pass

    def nova_stanja(self, stanje,player):
        
        nova_stanja = set()

        if player == 'X':
            for move in stanje.remaining_x:
                game = copy.deepcopy(stanje)
                game.play(player,move)
                nova_stanja.add(game)
        else:
            for move in stanje.remaining_o:
                game = copy.deepcopy(stanje)
                game.play(player,move)
                nova_stanja.add(game)
        return nova_stanja        
            
    def proceni_stanje(self, stanje,player):
        if player == 'X':
            return len(stanje.remaining_o)
        return len(stanje.remaining_x)

    def max_stanje(self,lsv):
        return max(lsv, key=lambda x: x[1])

    def min_stanje(self, lsv):
        return min(lsv, lambda x: x[1])

    def max_value(self,stanje, dubina, alpha, beta):
        lista_novih_stanja = self.nova_stanja(stanje,'X')
        if dubina == 0 or lista_novih_stanja is None:
            return (stanje, self.proceni_stanje(stanje,'X'))
        else:
            for s in lista_novih_stanja:
                alpha = max(alpha,
                self.min_value(s, dubina - 1, alpha, beta),
                key = lambda x: x[1])
                if alpha[1] >= beta[1]:
                     return beta
        return alpha 

    def min_value(self,stanje, dubina, alpha, beta):
        lista_novih_stanja = self.nova_stanja(stanje, 'O')
        if dubina == 0 or lista_novih_stanja is None:
            return (stanje, self.proceni_stanje(stanje,'O'))
        else:
            for s in lista_novih_stanja:
                beta = min(beta,
                self.max_value(s, dubina - 1, alpha, beta),
                key = lambda x: x[1])
            if beta[1] <= alpha[1]:
             return alpha
        return beta
    
    def minimax(self,stanje, dubina, moj_potez, alpha, beta):
        if moj_potez == 'X':
            return self.max_value(stanje, dubina, alpha, beta)
        else:
            return self.min_value(stanje, dubina, alpha, beta)

        
