import copy


class MinMax:

    def __init__(self) -> None:
        pass

    def nova_stanja(self, stanje, player):
        nova_stanja = set()
        if player == 'X':
            for move in stanje[0].remaining_x:
                game = copy.deepcopy(stanje[0])
                valid = game.play(player, move)
                if valid == True:
                    nova_stanja.add((game, move))
        else:
            for move in stanje[0].remaining_o:
                game = copy.deepcopy(stanje[0])
                valid = game.play(player, move)
                if valid == True:
                    nova_stanja.add((game, move))
        return nova_stanja

    def proceni_stanje(self, stanje, player):
        # if player == 'X':
        #     return len(stanje.remaining_o) + 10
        # return len(stanje.remaining_x) - 10
        if player == 'X':
            return stanje.safe_state_count(player)
        else:
            return -stanje.safe_state_count(player)

    def max_stanje(self, lsv):
        return max(lsv, key=lambda x: x[1])

    def min_stanje(self, lsv):
        return min(lsv, lambda x: x[1])

    def max_value(self, stanje, dubina, alpha, beta):
        lista_novih_stanja = self.nova_stanja(stanje, 'X')
        if dubina == 0 or lista_novih_stanja is None or len(lista_novih_stanja) <= 1:
            return (stanje[0], alpha[1] if len(lista_novih_stanja) < 1 else self.proceni_stanje(list(lista_novih_stanja)[0][0], 'X'), None if len(lista_novih_stanja) < 1 else list(lista_novih_stanja)[0][1])
        else:
            for s in lista_novih_stanja:
                alphaP = max(alpha, self.min_value(
                    s, dubina - 1, alpha, beta), key=lambda x: x[1])
                if alphaP[1] >= alpha[1]:
                    alpha = tuple([stanje[0], alphaP[1], s[1]])
                if alpha[1] >= beta[1]:
                    return tuple([alpha[0], beta[1], alpha[2]])
        return alpha

    def min_value(self, stanje, dubina, alpha, beta):
        lista_novih_stanja = self.nova_stanja(stanje, 'O')
        if dubina == 0 or lista_novih_stanja is None or len(lista_novih_stanja) <= 1:
            return (stanje[0], beta[1] if len(lista_novih_stanja) < 1 else self.proceni_stanje(list(lista_novih_stanja)[0][0], 'O'), None if len(lista_novih_stanja) < 1 else list(lista_novih_stanja)[0][1])
        else:
            for s in lista_novih_stanja:
                betaP = min(beta, self.max_value(
                    s, dubina - 1, alpha, beta), key=lambda x: x[1])
                if betaP[1] <= beta[1]:
                    beta = tuple([stanje[0], betaP[1], s[1]])
                if beta[1] <= alpha[1]:
                    return tuple([beta[0], alpha[1], beta[2]])
        return beta

    def minimax(self, stanje, dubina, moj_potez, alpha, beta):
        if moj_potez == 'X':
            return self.max_value(stanje, dubina, alpha, beta)
        else:
            return self.min_value(stanje, dubina, alpha, beta)
