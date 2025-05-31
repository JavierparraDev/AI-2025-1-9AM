def decide_actuators(temp):
    if temp > 30:
        return "ventilador_on"
    elif temp < 20:
        return "bombillo_on"
    return "nada"