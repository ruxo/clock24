/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="ramda.d.ts" />

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

    var canvas = <HTMLCanvasElement> document.getElementById("clock");
    var g = canvas.getContext("2d");

    var logicalWidth = 1000;
    var logicalHeight = 1000;
    var ratio = logicalHeight / logicalWidth;

    var w = $(window).width();
    var h = $(window).height();

    var cx = w/2;
    var cy = h/2;

    canvas.width = w;
    canvas.height = h;;

    var fitSize = Math.min(w/2, h/2);

    var BACKGROUND_COLOR = "#181818";
    var HAND_COLOR = "red";
    var DIAL_COLOR = "linen";

    var dialLineWidth = 50;
    var handLineWidth = 25;
    var buttonRadius = 50;
    var innerButton = 30;
    var r = 1000 -dialLineWidth/2;   // so the edge of circle is aligned with browse edge.
    var handRadius = 750;

    function _drawCenterButton(){
        g.beginPath();
        g.arc(0,0,buttonRadius,0, Math.PI*2, false);
        g.closePath();
        g.fillStyle = HAND_COLOR;
        g.fill();

        g.beginPath();
        g.arc(0,0,innerButton,0, Math.PI*2, false);
        g.closePath();
        g.fillStyle = BACKGROUND_COLOR;
        g.fill();
    }
    function _drawDial(){
        g.lineWidth = dialLineWidth;
        g.beginPath();
        g.arc(0,0,r,0, Math.PI*2, false);
        g.closePath();
        g.strokeStyle = DIAL_COLOR;
        g.stroke();
    }
    var midnightAngle = Math.PI/2;
    function _drawHand(now){
        g.save();
        var timeAngle = getTimeAngle(now) + midnightAngle;
        g.rotate( timeAngle );

        g.lineWidth = handLineWidth;
        g.lineCap = 'round';
        g.strokeStyle = HAND_COLOR;
        g.beginPath();
        g.moveTo(0,0);
        g.lineTo(handRadius, 0);
        g.stroke();

//                  var minute100 = getHourSeconds(now) / 36;
//                  g.fillStyle = HAND_COLOR;
//                  g.font = "24px sans-serif";
//                  g.fillText(minute100.toFixed(1), buttonRadius, -handLineWidth);
        g.restore();
    }
    var HOUR_TICK_HALF_ANGLE = Math.PI/180;
    function _drawHour(hour){
        g.save();
        var hourAngle = getHourAngle(hour);

        // draw hour tick
        var tickLength = dialLineWidth;
        g.beginPath();
        g.arc(0,0,r-dialLineWidth+1, hourAngle-HOUR_TICK_HALF_ANGLE, hourAngle+HOUR_TICK_HALF_ANGLE, false);
        g.lineWidth = tickLength;
        g.lineCap = "butt";
        g.strokeStyle = DIAL_COLOR;
        g.stroke();

        g.font = "72px serif";

        var hourText = hour;

        var metrics = g.measureText(hourText);

        g.rotate(hourAngle);
        var startNormal = r -130;
        g.translate(startNormal, 0);

        g.fillStyle = HAND_COLOR;
        g.beginPath();
        g.arc(0,0,2,0,Math.PI*2,false);
        g.closePath();
        g.fill();

        g.rotate( -hourAngle);
        g.translate(-metrics.width/2, 25);

        g.fillStyle = "gray";
        g.fillText(hourText, 0,0);
        g.restore();
    }
    var MINUTE_GAP_ANGLE = Math.PI * 0.4/180;
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
        g.strokeStyle = color;

        var startAngle = getHourAngle(hour) +HOUR_TICK_HALF_ANGLE;

        while(minuteFraction > 0){
            var segmentAngle = Math.min(minuteFraction, fullMinuteRadius/4);

            g.beginPath();
            g.arc(0,0,r-dialLineWidth+1, startAngle, startAngle+segmentAngle, false);
            g.stroke();

            startAngle += segmentAngle +MINUTE_GAP_ANGLE;
            minuteFraction -= segmentAngle;
        }
    }
    var oneHourAngle = Math.PI/12;
    function getTimeAngle(now){
        var hourAngle = now.getHours() * oneHourAngle;
        var minuteAngle = now.getMinutes() * oneHourAngle / 60;
        var secondAngle = now.getSeconds() * oneHourAngle / 3600;
        return hourAngle + minuteAngle + secondAngle;
    }
    function getHourSeconds(now){
        return now.getMinutes()*60 + now.getSeconds();
    }
    function getHourAngle(hour){
        return hour * oneHourAngle + midnightAngle;
    }

    self.render = function(){
        var now = new Date();

        g.save();
        g.fillStyle = BACKGROUND_COLOR;
        g.fillRect(0,0, w,h);

        g.translate(cx,cy);
        g.scale(fitSize/logicalWidth, fitSize/logicalHeight);

        _drawDial();
        _drawHand(now);
        _drawCenterButton();
        _drawMinuteFraction(now);

        for(var i=1; i<=24; ++i)
            _drawHour(i);

        g.restore();

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
        _drawCenterButton();
        _drawMinuteFraction(now);

        g.restore();

        self.lastUpdate = now;
    };
}