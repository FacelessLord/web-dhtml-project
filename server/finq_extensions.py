from typing import Tuple

from finq import FINQ, T, T2, TList


def extract_key(self: FINQ[Tuple[T, T2]]) -> Tuple[T, TList[T2]]:
    value_list = []
    key = None
    for k, v in self:
        if not key:
            key = k
        value_list.append(v)

    return key, value_list
