from cprint import cprint

class Table:
    def __init__(self,rows,cols) -> None:
        self.rows = rows
        self.cols = cols
        self.matrix = [[None for _ in range(self.cols)] for _ in range(self.rows)]

    def draw_table(self) -> None:
        print(' ', end=' ')
        for i in range(1, self.cols+1):
            print('  ' + (chr(64+i) ), end=' ') # column indices
        print()
        print(' ', end=' ')   
        for j in range(0,self.cols): # horizontal walls
            print('===', end='=')
        print() 
        for i in range(0, self.rows):
            print(chr(ord('0')+ i + 1) if i < 10 else chr(ord('A')+i-10), end=' | ') # row index
            for j in range(0, self.cols): # cells and vertical walls
               
                if self.matrix[i][j] == None:
                    print(' ' , end=' | ')
                else:
                    print(self.matrix[i][j], end=' | ')     

                if (j == self.cols-1):
                    print(chr(ord('0')+ i + 1), end='')
                    print()
            print(' ', end=' ')        
            for j in range(0,self.cols): # horizontal walls
                    print('===', end='=')
            print()
        
        print(' ', end=' ')
        for i in range(1, self.cols+1):
            print('  ' + (chr(64+i) ), end=' ') # column indices
        print()
        return        
