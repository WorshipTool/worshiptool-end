from typing import List

from .line import Line

class Section:
    def __init__(self, lines: List[Line]):
        self.lines = lines
        self.name = "V"


    