function stop() { //stops the vehicle and goes into idle
    DFRobotMaqueenPlus.mototStop(Motors.ALL);
    isStoped = true;
    stopTime = input.runningTime();
}



bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () { //BLE comm section
    let serialInput = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (serialInput == "b") { //getBattIndic
        bluetooth.uartWriteNumber(battPower);
    } else if (serialInput == "c") { //charged
        charged();
    } else if (serialInput == "r") { //returnCroners
        bluetooth.uartWriteNumber(corners);
    } else if (serialInput == "n") { //nextPump
        goToPump = true;
    }
    else if (serialInput == "s") { //stop
        stop()
    }

});


function consume() { //consume the power
    battPower += -1
    if(battPower <= 0){
        stop();
    }
}

function charged() { //charges itself by 1 unit
    if (battPower < 25) {
        battPower += 1;
    }
    isStoped = false;
}



function turn(parm: boolean) {
    if (parm) {
        // left turn
        DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CCW, 100)
        DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 100)
    } else {
        // right turn
        DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 100)
        DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CCW, 100)
    }
    basic.pause(330);
    //DFRobotMaqueenPlus.mototRun(Motors.ALL, Dir.CW, 20);
    //basic.pause(50)
    
    return 0
}

//check how it works when turning left once back on track


basic.forever(function () {
    if (!isStoped && (distance > 15 || distance == 0)) {
        if (goToPump && !(DFRobotMaqueenPlus.readPatrol(Patrol.R3))) { //detects a right turn
            
            control.waitForEvent(turn(false), 0)
            pumpRightCounter++;
            if (pumpRightCounter > 1) {
                goToPump = false;
            }
        } else if (!(DFRobotMaqueenPlus.readPatrol(Patrol.L3))) { //detects a left turn
            
            control.waitForEvent(turn(true), 0);
            if (!goToPump) {
                corners += 1
                consume()
            }

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
                DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 50)
                DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 100)
            } else if (L2 && !(L1) && !(R1) && R2) {
                // 1001 middle
                DFRobotMaqueenPlus.mototRun(Motors.ALL, Dir.CW, 100)
            } else if (L2 && L1 && !(R1) && R2) {
                // 1101
                DFRobotMaqueenPlus.mototRun(Motors.M1, Dir.CW, 100)
                DFRobotMaqueenPlus.mototRun(Motors.M2, Dir.CW, 50)
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
    if(!isStoped && distance <= 15){
        DFRobotMaqueenPlus.mototStop(Motors.ALL);
    }
    
    
})


//callcucaltes idle time
loops.everyInterval(300, function () {
    if (isStoped) {
        let consumedIldeEnergy = Math.round((input.runningTime() - stopTime) * 0.00003333333);
        if (consumedIldeEnergy >= 1) {
            stopTime = input.runningTime();
            while (consumedIldeEnergy > 0) {
                consume();
                consumedIldeEnergy--;
            }
        }
    }

    /*if (!turn && distance <= 5 && distance != 0) {
        stop();
        basic.pause(600)
    }
    
    else {
        isStoped = false;
    }*/
})

loops.everyInterval(50, function() {
    distance = DFRobotMaqueenPlus.ultraSonic(PIN.P1, PIN.P2);
})

/*loops.everyInterval(100, function () {
    basic.showNumber(0);
    if (DFRobotMaqueenPlus.ultraSonic(PIN.P1, PIN.P2) <= 5) {
        stop();
        basic.showNumber(2);
    }
    else {
        isStoped = false;
    }

})*/


//init parameters
DFRobotMaqueenPlus.I2CInit();
DFRobotMaqueenPlus.PID(PID.OFF);
let battPower = 10;
//let idleConsumption = 0.00003333333;
let corners = 0;
let goToPump = true;
let isStoped = false;
let stopTime = 0;
let pumpRightCounter = 0;
let distance = 0;
bluetooth.startUartService();
//displays the number of the robot
basic.showNumber(1)

