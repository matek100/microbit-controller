//TO DO LIST
//target avoid


function getDistance() {
    let distanceLeft = DFRobotMaqueenPlus.readeDistance(Motors1.M1);
    let distanceRight = DFRobotMaqueenPlus.readeDistance(Motors1.M2);
    return Math.round((parseFloat(distanceLeft) + parseFloat(distanceRight)) / 2 * 13.188);
}
function park() { //removes itself for the circle and turns off
    DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CCW, 255);
    DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 255);
    basic.pause(300)
    DFRobotMaqueenPlus.mototRun(Motors.ALL, Dir.CW, 255);
    basic.pause(100);
    DFRobotMaqueenPlus.mototStop(Motors.ALL);
}

function stop() { //stops the vehicle and goes into idle
    DFRobotMaqueenPlus.mototStop(Motors.ALL);
    isStoped = true;
    stopTime = input.runningTime();
}

function clearDisplay() { //helper function, clears display
    for (let i = 0; i <= 4; i++) {
        for (let j = 0; j <= 4; j++) {
            if (led.point(j, i)) {
                led.unplot(j, i)
            }
        }
    }
}
function displayPower() { //displays power
    clearDisplay()
    let counter = 0
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

function clearDistance() { //rests the distacne
    DFRobotMaqueenPlus.clearDistance(Motors.ALL)
}
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () { //BLE comm section
    let serialInput = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (serialInput == "getDistance()") {
        bluetooth.uartWriteNumber(getDistance())
    } else if (serialInput == "clearDistance()") {
        clearDistance()
    } else if (serialInput == "getBattIndic()") {
        bluetooth.uartWriteNumber(getBattIndic())
        basic.showNumber(0)
    } else if (serialInput == "charged()") {
        charged()
    } else if (serialInput == "returnCorners()") {
        bluetooth.uartWriteNumber(corners);
    } else if (serialInput == "goToNextPump()") {
        goToPump = true;
    }
    else if (serialInput == "stop()") {
        stop()
    }
     /*else if (serialInput == "park()") { //?
        park()
    }*/
});


function consume() { //consume the power
    battPower += -1
    if (battPower < 1) {
        park() //removes itself from the game if it is empty

        displayPower()
    }
}

    function charged() { //charges itself by 1 unit
        if (battPower < 25) {
            battPower += 1;
        }
        displayPower()
        isStoped = false;
    }

    function getBattIndic() { //returns the battery status
        return battPower
    }


    input.onButtonPressed(Button.A, function () { //for debug
        turn(1)
        forward()
        turn(0)
    })
    function turn(parm: number) {
        if (parm == 0) {
            // left turn
            DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CCW, 255)
            DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 255)
            while (DFRobotMaqueenPlus.readPatrol(Patrol.L2)) {
            }
        } else if (parm == 1) {
            // right turn
            DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 255)
            DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CCW, 255)
            while (DFRobotMaqueenPlus.readPatrol(Patrol.R2)) {
            }
        }
        DFRobotMaqueenPlus.mototStop(Motors.ALL)
        return 0
    }
    function forward() {
        DFRobotMaqueenPlus.mototRun(Motors.ALL, Dir.CW, 100)
        while (DFRobotMaqueenPlus.readPatrol(Patrol.L3)) {
        }
        DFRobotMaqueenPlus.mototStop(Motors.ALL)
        return 0
    }

    function goThroughPump() {
        //TO DO 
        return 0;
    }
    basic.forever(function () {
        // control.waitForEvent(turn(1), 0);
        // control.waitForEvent(forward(), 0);
        // control.waitForEvent(turn(0), 0);
        // control.waitForEvent(forward(), 0);
        // control.waitForEvent(turn(0), 0);
        // control.waitForEvent(forward(), 0);
        // control.waitForEvent(turn(1), 0);
        if (!isStoped) {
            if (goToPump && !(DFRobotMaqueenPlus.readPatrol(Patrol.R3))) { //detects a right turn
                rightCounter++
                if (rightCounter >= 2) {
                    goToPump = false;
                }
                control.waitForEvent(turn(0), 0)
            } else if (!(DFRobotMaqueenPlus.readPatrol(Patrol.L3))) { //detes a left turn
                if(!goToPump){
                    corners += 1
                    consume();
                }
                control.waitForEvent(turn(0), 0)
            } else { //normal straight line following
                let L1 = DFRobotMaqueenPlus.readPatrol(Patrol.L1)
                let L2 = DFRobotMaqueenPlus.readPatrol(Patrol.L2)
                let R1 = DFRobotMaqueenPlus.readPatrol(Patrol.R1)
                let R2 = DFRobotMaqueenPlus.readPatrol(Patrol.R2)
                if (L2 && L1 && R1 && R2) {
                    // 1111
                    DFRobotMaqueenPlus.mototRun(Motors.ALL, Dir.CW, 100)
                } else if (!(L2) && !(L1) && R1 && R2) {
                    // 0011
                    DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 0)
                    DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 100)
                } else if (!(L2) && L1 && R1 && R2) {
                    // 0111
                    DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CCW, 75)
                    DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 100)
                } else if (L2 && !(L1) && R1 && R2) {
                    // 1011
                    DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CCW, 50)
                    DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 100)
                } else if (L2 && !(L1) && !(R1) && R2) {
                    // 1001 middle
                    DFRobotMaqueenPlus.mototRun(Motors.ALL, Dir.CW, 100)
                } else if (L2 && L1 && !(R1) && R2) {
                    // 1101
                    DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 100)
                    DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CCW, 50)
                } else if (L2 && L1 && R1 && !(R2)) {
                    // 1110
                    DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 100)
                    DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CCW, 75)
                } else if (L2 && L1 && !(R1) && !(R2)) {
                    // 1100
                    DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 100)
                    DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 0)
                }
            }
        }
    })


    //callcucaltes idle time
    loops.everyInterval(100, function () {
        if (isStoped) {
            let consumedIldeEnergy = Math.round((input.runningTime() - stopTime) * idleConsumption);
            if (consumedIldeEnergy >= 1) {
                stopTime = input.runningTime();
                while (consumedIldeEnergy > 0) {
                    consume();
                    consumedIldeEnergy--;
                }
            }
        }
    })

    //init parameters
    DFRobotMaqueenPlus.I2CInit()
    DFRobotMaqueenPlus.PID(PID.OFF)
    let battPower = 20
    displayPower()
    let idleConsumption = 0.00003333333
    let corners = 0
    let goToPump = true;
    let isStoped = false;
    let stopTime = 0;
    let rightCounter = 0;
    bluetooth.startUartService();


