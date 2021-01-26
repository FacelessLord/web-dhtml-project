from random import randint


def format_length(num: int, size: int, filler: str = "0"):
    if len(filler) > 1:
        filler = filler[-1]
    str_num = str(num)
    if len(str_num) > size:
        return str_num[len(str_num) - size:]
    elif len(str_num) < size:
        return filler * (size - len(str_num)) + str_num
    else:
        return str_num


def random_code(length: int):
    return format_length(randint(0, 10 ** length-1), length)
