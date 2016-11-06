var slider = document.getElementById('timeline');

function setCanvasSizes(){
	//initial canvas width should be the percentage of the container multiplied by the width of the container.
	//the width of the container is given by container width percentage multipled by the actual browser width.

	var twodmain = document.getElementById("2dmain");
	var twodfin = document.getElementById("2dfin");
	var threedmain = document.getElementById("3dmain");
	var threedfin = document.getElementById("3dfin");

	twodmain.width = ($("#twodmain").width()/100) * (window.innerWidth*($(".container").width()/window.innerWidth));
	twodmain.height = (window.innerHeight*0.69); //lol, but don't make it 0.7, for real, no one like the scroll bar
	twodfin.width = ($("#twodfin").width()/100) * (window.innerWidth*($(".container").width()/window.innerWidth));
	twodfin.height = (window.innerHeight*0.69);
	threedmain.width = ($("#threedmain").width()/100) * (window.innerWidth*($(".container").width()/window.innerWidth));
	threedmain.height = (window.innerHeight*0.69);
	threedfin.width = ($("#threedfin").width()/100) * (window.innerWidth*($(".container").width()/window.innerWidth));
	threedfin.height = (window.innerHeight*0.69);
}

function invalidateCanvases(){
	Materialize.toast('Since the browser was resized, this simulation will need to be resized. The page will refresh now.', 4000)
	setTimeout(function(){ location.reload(); }, 4000);
}

$(".button-collapse").sideNav();

$("#continueButton").click(function() {
	if($('#rocket_diameter').val() == "" || $('#cal').val() == "" || $('#mass').val() == "" || $('#net_aero_forces').val() == "" || $('#velocity').val() == "" || $('#length').val() == "" || $('#theta_pitch').val() == "" || $('#theta_yaw').val() == "" || $('#omega_pitch').val() == "" || $('#omega_yaw').val() == "" || $('#air_density').val() == "" || $('#drag_coefficent').val() == "" || $('#time_step').val() == "" || $('#proportional_gain').val() == "" || $('#integrative_gain').val() == "" || $('#derivative_gain').val() == "" || $('#control_surface_area').val() == "" || $('#simulation_length').val() == ""){
		Materialize.toast('One or more of the fields are empty!', 4000)
	}
	else{
		$("#inputvars").hide();
		$("#visibilityWrapper").show();
		rocketDiameter = $('#rocket_diameter').val();
		caliber = $('#cal').val();
		rocketMass = $('#mass').val();
		netAeroForces = $('#net_aero_forces').val();
		rocketVelocity = $('#velocity').val();
		rocketLength = $('#length').val();
		thetaPitch = $('#theta_pitch').val();
		thetaYaw = $('#theta_yaw').val();
		omegaPitch = $('#omega_pitch').val();
		omegaYaw = $('#omega_yaw').val();
		airDensity = $('#air_density').val();
		dragCoefficent = $('#drag_coefficent').val();
		timeStep = $('#time_step').val();
		proportionalGain = $('#proportional_gain').val();
		integrativeGain = $('#integrative_gain').val();
		derivativeGain = $('#derivative_gain').val();
		controlSurfaceArea = $('#control_surface_area').val();
		simulationLength = $('#simulation_length').val();
		preprocessing();
	}
});

$("#continueDefaultButton").click(function() {
	$("#inputvars").hide();
	$("#visibilityWrapper").show();
	//TODO CHANGE DUMMY VALUES
	rocketDiameter = 1;
	caliber = 1;
	rocketMass = 1;
	rocketVelocity = 1;
	thetaPitch = 1;
	omegaPitch = 1;
	thetaYaw = 1;
	omegaYaw = 1;
	rocketLength = 1;
	airDensity = 1;
	dragCoefficent = 1; //approximated by long cylinder with nose cone
	timeStep = 1;
	proportionalGain = 1;
	integrativeGain = 1;
	derivativeGain = 1;
	controlSurfaceArea = 1;
	simulationLength = 1;
	preprocessing();
});

function preprocessing(){
	momentArm = calculateMomentArm(rocketDiameter, caliber);
	momentOfInertia = calculateMomentOfInertia(rocketMass, rocketDiameter, rocketLength);
	prevIntegral = 0;
	//TODO CHECK WHETHER WE ARE RENDERING PITCH OR YAW
	thetaOff = thetaPitch;
	omegaOff = omegaPitch;


	noUiSlider.create(slider, {
		start: [ 0 ],
		step: timeStep,
		range: {
			'min': [ 0 ],
			'max': [ simulationLength ]
		}
	});
	timeControls.initialized = true;
}

var twodmainCanvas = document.getElementById('2dmain');
var twodfinCanvas = document.getElementById('2dfin');
var ctxMain = twodmainCanvas.getContext('2d');
var ctxFin = twodfinCanvas.getContext('2d');
var raf;
var firstIterationDone = false;

function draw(){
	ctxMain.fillStyle="rgba(255,255,255,1)";
	ctxMain.fillRect(0,0,twodmainCanvas.width,twodmainCanvas.height);

	ctxFin.fillStyle="#fff";
	ctxFin.fillRect(0,0,twodfinCanvas.width,twodfinCanvas.height);

	//ctxmain animation
	ctxMain.beginPath();
	ctxMain.setLineDash([5]);
	ctxMain.lineWidth=1;
	ctxMain.moveTo(0, twodmainCanvas.height/2);
	ctxMain.lineTo(twodmainCanvas.width, twodmainCanvas.height/2);
	ctxMain.strokeStyle="#00ff00";
	ctxMain.stroke();

	ctxMain.beginPath();
	ctxMain.setLineDash([0]);
	ctxMain.lineWidth=3;
	ctxMain.moveTo(twodmainCanvas.width*(1/3),twodmainCanvas.height/2);
	ctxMain.lineTo(twodmainCanvas.width*(2/3),twodmainCanvas.height/2);
	ctxMain.strokeStyle="#0000ff";
	ctxMain.stroke();

	ctxMain.beginPath();
	ctxMain.setLineDash([0]);
	ctxMain.lineWidth=3;
	ctxMain.moveTo(twodmainCanvas.width*(2/3),twodmainCanvas.height/2-10);
	ctxMain.lineTo(twodmainCanvas.width*(2/3),twodmainCanvas.height/2+10);
	ctxMain.strokeStyle="#000000";
	ctxMain.stroke();

	ctxMain.beginPath();
	ctxMain.setLineDash([0]);
	ctxMain.lineWidth=3;
	ctxMain.moveTo(twodmainCanvas.width*(2/3) - 10,twodmainCanvas.height/2);
	ctxMain.lineTo(twodmainCanvas.width*(2/3) + 10,twodmainCanvas.height/2);
	ctxMain.strokeStyle="#000000";
	ctxMain.stroke();

	ctxMain.fillStyle="#000000";
	ctxMain.font = "13px Arial";
	ctxMain.fillText("CG", twodmainCanvas.width*(2/3) + 5, twodmainCanvas.height/2 - 10);

	ctxMain.beginPath();
	ctxMain.setLineDash([0]);
	ctxMain.lineWidth=3;
	ctxMain.moveTo(twodmainCanvas.width*(1/3),twodmainCanvas.height/2-10);
	ctxMain.lineTo(twodmainCanvas.width*(1/3),twodmainCanvas.height/2+10);
	ctxMain.strokeStyle="#ff0000";
	ctxMain.stroke();

	ctxMain.beginPath();
	ctxMain.setLineDash([0]);
	ctxMain.lineWidth=3;
	ctxMain.moveTo(twodmainCanvas.width*(1/3) - 10,twodmainCanvas.height/2);
	ctxMain.lineTo(twodmainCanvas.width*(1/3) + 10,twodmainCanvas.height/2);
	ctxMain.strokeStyle="#ff0000";
	ctxMain.stroke();

	ctxMain.fillStyle="#000000";
	ctxMain.font = "13px Arial";
	ctxMain.fillText("CP", twodmainCanvas.width*(1/3) + 5, twodmainCanvas.height/2 - 10);

	raf = window.requestAnimationFrame(draw);
}

raf = window.requestAnimationFrame(draw);

//rocket render

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

setInterval(function(){
	if(timeControls.playing && timeControls.initialized && timeControls.currentTime <= simulationLength) {
		//math for pitch
		thetaOut = calculateThetaOut(proportionalGain, integrativeGain, derivativeGain, thetaOff, omegaOff, timeStep);
		console.log("Attempted Pitch Angle Correction: " + thetaOut);
		var theta_store = thetaOff;
		thetaOff = thetaOff - thetaOut + omegaOff*timeStep;
		omegaOff = (thetaOff - theta_store)/timeStep;
		console.log("new theta: " + thetaOff);
		console.log("new omega: " + omegaOff);

		thetaDeflection = calculateThetaDef(thetaOut, omegaOff, timeStep, momentOfInertia, momentArm, airDensity, rocketVelocity, dragCoefficent, controlSurfaceArea);
		console.log("thetaDeflection: " + thetaDeflection);

		//math for yaw

		timeControls.currentTime = timeControls.currentTime + timeStep;
		timeControls.currentTime = round(timeControls.currentTime, 1);
		slider.noUiSlider.set([timeControls.currentTime]);
		$("#timecode").text(timeControls.currentTime.toString());
	}
	else if(timeControls.initialized) {
		timeControls.playing = false;
		$("#play_button").text("play_circle_filled");
		timeControls.currentTime = parseFloat(slider.noUiSlider.get());
		$("#timecode").text(timeControls.currentTime.toString());
	}
}, 100);

var timeControls = {
	initialized: false,
	currentTime: 0,
	playing: false,
	changePlayingState: function(){
		if(this.playing){
			$("#play_button").text("play_circle_filled");
			this.playing = false;
		}
		else{
			$("#play_button").text("pause_circle_filled");
			this.playing = true;
		}
	}
}

$("#play_button_wrapper").click(function() {
	timeControls.changePlayingState();
});