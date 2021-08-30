def getDistance():
    global distanceLeft, distanceRight
    distanceLeft = DFRobotMaqueenPlus.reade_distance(Motors1.M1)
    distanceRight = DFRobotMaqueenPlus.reade_distance(Motors1.M2)
    return Math.round((parse_float(distanceLeft) + parse_float(distanceRight)) / 2 * 13.188)
def park():
    global runTime, isIdle, idleTime
    nextMove(1)
    runTime = input.running_time() - idleStart
    isIdle = 0
    idleTime += runTime
    DFRobotMaqueenPlus.motot_run(Motors.M2, Dir.CW, 255)
    DFRobotMaqueenPlus.motot_run(Motors.M1, Dir.CW, 255)
    basic.pause(200)
    DFRobotMaqueenPlus.motot_stop(Motors.M1)
    DFRobotMaqueenPlus.motot_stop(Motors.M2)
def nextMove(num: number):
    global runTime, idleTime, isIdle
    if isIdle:
        runTime = input.running_time() - idleStart
        idleTime += runTime
    isIdle = 0
    if num == 0:
        DFRobotMaqueenPlus.motot_run(Motors.M1, Dir.CW, 255)
        DFRobotMaqueenPlus.motot_run(Motors.M2, Dir.CW, 255)
        basic.pause(600)
        stop()
    elif num == 1:
        DFRobotMaqueenPlus.motot_run(Motors.M2, Dir.CW, 255)
        basic.pause(420)
        stop()
    elif num == 2:
        DFRobotMaqueenPlus.motot_run(Motors.M1, Dir.CW, 255)
        basic.pause(420)
        stop()
def stop():
    global isIdle, idleStart
    DFRobotMaqueenPlus.motot_stop(Motors.M1)
    DFRobotMaqueenPlus.motot_stop(Motors.M2)
    isIdle = 1
    idleStart = input.running_time()
def clearDisplay():
    for i in range(5):
        for j in range(5):
            if led.point(j, i):
                led.unplot(j, i)
def displayPower():
    global counter
    clearDisplay()
    counter = 0
    for k in range(5):
        for l in range(5):
            if counter > battPower:
                break
            led.plot(l, k)
            counter += 1
def clearDistance():
    DFRobotMaqueenPlus.clear_distance(Motors.M1)
    DFRobotMaqueenPlus.clear_distance(Motors.M2)

def on_uart_data_received():
    global serialInput
    serialInput = bluetooth.uart_read_until(serial.delimiters(Delimiters.NEW_LINE))
    if serialInput == "getDistance()":
        bluetooth.uart_write_number(getDistance())
    elif serialInput == "clearDistance()":
        clearDistance()
    elif serialInput == "getBattIndic()":
        bluetooth.uart_write_number(getBattIndic())
        basic.show_number(0)
    elif serialInput == "charged()":
        charged()
    elif serialInput == "moveNext(0)":
        nextMove(0)
    elif serialInput == "moveNext(1)":
        nextMove(1)
    elif serialInput == "moveNext(2)":
        nextMove(2)
    elif serialInput == "stop()":
        stop()
    elif serialInput == "park()":
        park()
bluetooth.on_uart_data_received(serial.delimiters(Delimiters.NEW_LINE),
    on_uart_data_received)

def consume():
    global battPower
    battPower += -1
    if battPower < 1:
        stop()
    displayPower()
def charged():
    global battPower
    if battPower < 25:
        battPower += 1
    displayPower()
def getBattIndic():
    return battPower
consumedEnergy = 0
counter = 0
idleTime = 0
isIdle = 0
idleStart = 0
runTime = 0
distanceRight = ""
distanceLeft = ""
battPower = 0
serialInput = ""
serialInput = ""
DFRobotMaqueenPlus.i2c_init()
DFRobotMaqueenPlus.PID(PID.OFF)
battPower = 20
displayPower()
batteryConsumption = 50
idleConsumption = 0.00003333333
bluetooth.start_uart_service()

def on_every_interval():
    pass
loops.every_interval(50, on_every_interval)

def on_every_interval2():
    global idleTime, idleStart, consumedEnergy
    if isIdle:
        idleTime += input.running_time() - idleStart
        idleStart = input.running_time()
    consumedEnergy += getDistance() / batteryConsumption
    consumedEnergy += idleTime * idleConsumption
    idleTime = 0
    if consumedEnergy >= 1:
        index = 0
        while index <= consumedEnergy:
            consume()
            index += 1
        clearDistance()
        consumedEnergy = 0
loops.every_interval(100, on_every_interval2)
