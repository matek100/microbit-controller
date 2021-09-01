function getDistance () {
    distanceLeft = DFRobotMaqueenPlus.readeDistance(Motors1.M1)
    distanceRight = DFRobotMaqueenPlus.readeDistance(Motors1.M2)
    return Math.round((parseFloat(distanceLeft) + parseFloat(distanceRight)) / 2 * 13.188)
}
function getDistanceLast () {
    return getDistance() - distanceLast
}
function park () {
    nextMove(1)
    runTime = input.runningTime() - idleStart
    isIdle = 0
    idleTime += runTime
    DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 255)
    DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 255)
    basic.pause(200)
    DFRobotMaqueenPlus.mototStop(Motors.M1)
    DFRobotMaqueenPlus.mototStop(Motors.M2)
}
function nextMove (num: number) {
    if (isIdle) {
        runTime = input.runningTime() - idleStart
        idleTime += runTime
    }
    isIdle = 0
    if (num == 0) {
        DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 255)
        DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 255)
        basic.pause(600)
        stop()
    } else if (num == 1) {
        DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 255)
        basic.pause(420)
        stop()
    } else if (num == 2) {
        DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 255)
        basic.pause(420)
        stop()
    }
}
function stop () {
    DFRobotMaqueenPlus.mototStop(Motors.M1)
    DFRobotMaqueenPlus.mototStop(Motors.M2)
    isIdle = 1
    idleStart = input.runningTime()
}
function clearDisplay () {
    for (let i = 0; i <= 4; i++) {
        for (let j = 0; j <= 4; j++) {
            if (led.point(j, i)) {
                led.unplot(j, i)
            }
        }
    }
}
function displayPower () {
    clearDisplay()
    counter = 0
    for (let k = 0; k <= 4; k++) {
        for (let l = 0; l <= 4; l++) {
            if (counter > battPower) {
                break;
            }
            led.plot(l, k)
            counter += 1
        }
    }
}
function clearDistance () {
    DFRobotMaqueenPlus.clearDistance(Motors.M1)
    DFRobotMaqueenPlus.clearDistance(Motors.M2)
}
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    serialInput = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (serialInput == "getDistance()") {
        bluetooth.uartWriteNumber(getDistance())
    } else if (serialInput == "clearDistance()") {
        clearDistance()
    } else if (serialInput == "getBattIndic()") {
        bluetooth.uartWriteNumber(getBattIndic())
    } else if (serialInput == "charged()") {
        charged()
    } else if (serialInput == "moveNext(0)") {
        nextMove(0)
    } else if (serialInput == "moveNext(1)") {
        nextMove(1)
    } else if (serialInput == "moveNext(2)") {
        nextMove(2)
    } else if (serialInput == "stop()") {
        stop()
    } else if (serialInput == "park()") {
        park()
    }
})
function consume () {
    battPower += -1
    if (battPower < 1) {
        stop()
    }
    displayPower()
}
function charged () {
    if (battPower < 25) {
        battPower += 1
    }
    displayPower()
}
function getBattIndic () {
    return battPower
}
let consumedEnergy = 0
let counter = 0
let idleTime = 0
let isIdle = 0
let idleStart = 0
let runTime = 0
let distanceRight = ""
let distanceLeft = ""
let battPower = 0
let distanceLast = 0
let serialInput = ""
serialInput = ""
distanceLast = 0
DFRobotMaqueenPlus.I2CInit()
DFRobotMaqueenPlus.PID(PID.OFF)
battPower = 20
displayPower()
let batteryConsumption = 50
let idleConsumption = 0.00003333333
bluetooth.startUartService()
loops.everyInterval(50, function () {
	
})
loops.everyInterval(100, function () {
    let index: number;
if (isIdle) {
        idleTime += input.runningTime() - idleStart
        idleStart = input.runningTime()
    }
    consumedEnergy += getDistanceLast() / batteryConsumption
    consumedEnergy += idleTime * idleConsumption
    idleTime = 0
    if (consumedEnergy >= 1) {
        index = 0
        while (index <= consumedEnergy) {
            consume()
            index += 1
        }
        distanceLast = getDistance()
        consumedEnergy = 0
    }
})
