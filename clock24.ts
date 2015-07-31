/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="ramda.d.ts" />

const _ = R.__;

interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

const BACKGROUND_COLOR = "#181818";
const HAND_COLOR = "red";
const DIAL_COLOR = "linen";
const oneHourAngle = Math.PI/12;
const midnightAngle = Math.PI/2;

const HOUR_TICK_HALF_ANGLE = Math.PI/180;
const MINUTE_GAP_ANGLE = Math.PI * 0.4/180;

const dialLineWidth = 50;
const handLineWidth = 25;
const buttonRadius = 50;
const innerButton = 30;
const innerDialRadius = 1000 -dialLineWidth/2;   // so the edge of circle is aligned with browse edge.
const handRadius = 750;
const minuteRadius = innerDialRadius - dialLineWidth+1;

let getHourAngle = R.compose(R.add(midnightAngle), R.multiply(oneHourAngle));

function getHourSeconds(now){
    return now.getMinutes()*60 + now.getSeconds();
}

function getTimeAngle(now){
    var hourAngle = now.getHours() * oneHourAngle;
    var minuteAngle = now.getMinutes() * oneHourAngle / 60;
    var secondAngle = now.getSeconds() * oneHourAngle / 3600;
    return hourAngle + minuteAngle + secondAngle;
}

function getWindowSize() {
  return [ window.innerWidth, window.innerHeight ];
}

// ------------ drawing operations --------------
const logicalWidth = 1000;
const logicalHeight = 1000;

let fillStyle = R.curry((color, g: CanvasRenderingContext2D) => {
    g.fillStyle = color;
    return g;
});

let fill0 = (g: CanvasRenderingContext2D) => {
    g.fill();
    return g;
};

let fill = color => R.compose(fill0, fillStyle(color));

let stroke = R.curry((color, g: CanvasRenderingContext2D) => {
    g.strokeStyle = color;
    g.stroke();
    return g;
});

let arc0 = R.curry((spec: number[], r:number, g:CanvasRenderingContext2D) => {
    let [start, end] = spec;
    g.arc(0,0, r, start, end, false);
    return g;
});

let circle0 = arc0([0, Math.PI*2]);

let drawCircle = R.curry((radius: number, drawOp: Function, g: CanvasRenderingContext2D) => {
    g.beginPath();
    circle0(radius, g);
    g.closePath();
    drawOp(g);
    return g;
});

let getCanvas = <((canvas_id: string) => HTMLCanvasElement)> document.getElementById.bind(document);
let get2DCanvas = (canvas: HTMLCanvasElement) => canvas.getContext("2d");

let safeState = R.curry((f: Function, g: CanvasRenderingContext2D) => {
    g.save();
    let ret = f(g);
    g.restore();
    return ret;
    });

// ----------------- MAIN ---------------------
$(document).ready(main);

function main(){
    var clock = new Clock();
    clock.render();
    setInterval(function(){
        clock.renderUpdate();
    }, 1000);
}
function Clock(){
    var self = this;

    var canvas = getCanvas("clock");
    var g = get2DCanvas(canvas);

    var ratio = logicalHeight / logicalWidth;

    let [w,h] = getWindowSize();

    var cx = w/2;
    var cy = h/2;

    canvas.width = w;
    canvas.height = h;;

    const fitSize = Math.min(w/2, h/2);

    let _drawCenterButton = R.compose(
        drawCircle(innerButton, fill(BACKGROUND_COLOR)),
        drawCircle(buttonRadius, fill(HAND_COLOR))
    );
    function _drawDial(){
        g.lineWidth = dialLineWidth;
        drawCircle(innerDialRadius, stroke(DIAL_COLOR), g);
    }
    function _drawHand(now){
        g.save();
        var timeAngle = getTimeAngle(now) + midnightAngle;
        g.rotate( timeAngle );

        g.lineWidth = handLineWidth;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(0,0);
        g.lineTo(handRadius, 0);
        g.strokeStyle = HAND_COLOR;
        g.stroke();

                 var minute100 = getHourSeconds(now) / 36;
                 g.fillStyle = HAND_COLOR;
                 g.font = "24px sans-serif";
                 g.fillText(minute100.toFixed(1), buttonRadius, -handLineWidth);
        g.restore();
    }
    function _drawHour(hour){
        g.save();
        var hourAngle = getHourAngle(hour);

        // draw hour tick
        var tickLength = dialLineWidth;
        g.beginPath();
        g.arc(0,0,innerDialRadius-dialLineWidth+1, hourAngle-HOUR_TICK_HALF_ANGLE, hourAngle+HOUR_TICK_HALF_ANGLE, false);
        g.lineWidth = tickLength;
        g.lineCap = "butt";
        stroke(DIAL_COLOR, g);

        g.font = "72px serif";

        var hourText = hour;

        var metrics = g.measureText(hourText);

        g.rotate(hourAngle);
        var startNormal = innerDialRadius -130;
        g.translate(startNormal, 0);

        drawCircle(2, fill(HAND_COLOR), g);

        g.rotate( -hourAngle);
        g.translate(-metrics.width/2, 25);

        g.fillStyle = "gray";
        g.fillText(hourText, 0,0);
        g.restore();
    }
    function _drawMinuteFraction(now){
        _drawMinuteFractionBars(now.getHours(), 3600, "dimgrey");
        _drawMinuteFractionBars(now.getHours(), getHourSeconds(now), "lime");
    }
    function _drawMinuteFractionBars(hour, hourSeconds, color){
        var fractionLength = dialLineWidth;

        var fullMinuteRadius = oneHourAngle -HOUR_TICK_HALF_ANGLE*2 -MINUTE_GAP_ANGLE*3;

        var minuteFraction = fullMinuteRadius * hourSeconds/3600;

        g.lineWidth = fractionLength;
        g.lineCap = "butt";
        
        let strokeMinute = stroke(color);

        var startAngle = getHourAngle(hour) +HOUR_TICK_HALF_ANGLE;

        while(minuteFraction > 0){
            var segmentAngle = Math.min(minuteFraction, fullMinuteRadius/4);

            g.beginPath();
            arc0([startAngle, startAngle+segmentAngle], minuteRadius, g);
            strokeMinute(g);

            startAngle += segmentAngle +MINUTE_GAP_ANGLE;
            minuteFraction -= segmentAngle;
        }
    }
    
    let renderClock = R.curry((now: Date, g: CanvasRenderingContext2D) => {
        g.fillStyle = BACKGROUND_COLOR;
        g.fillRect(0,0, w,h);

        g.translate(cx,cy);
        g.scale(fitSize/logicalWidth, fitSize/logicalHeight);

        _drawDial();
        _drawHand(now);
        _drawCenterButton(g);
        _drawMinuteFraction(now);

        R.range(1,25).forEach(_drawHour);

        return g;
    });
    let safeRenderClock = R.compose(safeState, renderClock);

    self.render = function(){
        var now = new Date();

        safeState(renderClock(now))(g);

        self.lastUpdate = now;
    };
    self.renderUpdate = function(){
        var now = new Date();

        if (self.lastUpdate.getHours() != now.getHours()){
            self.lastUpdate = now;
            self.render();  // perform full update when hour changed.
            return;
        }

        g.save();
        g.translate(cx,cy);
        g.scale(fitSize/logicalWidth, fitSize/logicalHeight);

        g.fillStyle = BACKGROUND_COLOR;
        g.beginPath();
        g.arc(0,0, handRadius+50, 0,Math.PI*2,false); // 50 = cap
        g.fill();

        _drawHand(now);
        _drawCenterButton(g);
        _drawMinuteFraction(now);

        g.restore();

        self.lastUpdate = now;
    };
}
