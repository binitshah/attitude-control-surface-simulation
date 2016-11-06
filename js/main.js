var slider = document.getElementById('timeline');

function setCanvasSizes(){
	//initial canvas width should be the percentage of the container multiplied by the width of the container.
	//the width of the container is given by container width percentage multipled by the actual browser width.

	var twodmain = document.getElementById("2dmain");
	var twodfin = document.getElementById("2dfin");
	var threedmain = document.getElementById("3dmain");
	var threedfin = document.getElementById("3dfin");
	var datafield = document.getElementById("twodfin");

	twodmain.width = ($("#twodmain").width()/100) * (window.innerWidth*($(".container").width()/window.innerWidth));
	twodmain.height = (window.innerHeight*0.69); //lol, but don't make it 0.7, for real, no one like the scroll bar
	datafield.height = (window.innerHeight*0.69);
	//twodfin.width = ($("#twodfin").width()/100) * (window.innerWidth*($(".container").width()/window.innerWidth));
	//twodfin.height = (window.innerHeight*0.69);
	//threedmain.width = ($("#threedmain").width()/100) * (window.innerWidth*($(".container").width()/window.innerWidth));
	//threedmain.height = (window.innerHeight*0.69);
	//threedfin.width = ($("#threedfin").width()/100) * (window.innerWidth*($(".container").width()/window.innerWidth));
	//threedfin.height = (window.innerHeight*0.69);
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
	rocketDiameter = 0.3;
	caliber = 2;
	rocketMass = 120;
	rocketVelocity = 1372;
	thetaPitch = 7;
	omegaPitch = 0;
	thetaYaw = 5;
	omegaYaw = 0;
	rocketLength = 6.5;
	airDensity = 0.03;
	dragCoefficent = 0.5; //approximated by long cylinder with nose cone
	timeStep = 2;
	proportionalGain = 1;
	integrativeGain = 0;
	derivativeGain = 0;
	controlSurfaceArea = 1;
	simulationLength = 500;
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
	rocketRender.setLocs();
}

var twodmainCanvas = document.getElementById('2dmain');
//var twodfinCanvas = document.getElementById('2dfin');
var ctxMain = twodmainCanvas.getContext('2d');
//var ctxFin = twodfinCanvas.getContext('2d');
var raf;
var firstIterationDone = false;

function draw(){
	ctxMain.fillStyle="rgba(255,255,255,1)";
	ctxMain.fillRect(0,0,twodmainCanvas.width,twodmainCanvas.height);

	//ctxFin.fillStyle="#fff";
	//ctxFin.fillRect(0,0,twodfinCanvas.width,twodfinCanvas.height);

	//ctxmain animation
	ctxMain.beginPath();
	ctxMain.setLineDash([5]);
	ctxMain.lineWidth=1;
	ctxMain.moveTo(0, twodmainCanvas.height/2);
	ctxMain.lineTo(twodmainCanvas.width, twodmainCanvas.height/2);
	ctxMain.strokeStyle="#00ff00";
	ctxMain.stroke();


	rocketRender.renderLine();
	rocketRender.renderCG();
	rocketRender.renderCP();
	rocketRender.renderForce();

	raf = window.requestAnimationFrame(draw);
}

raf = window.requestAnimationFrame(draw);

var rocketRender = {
	cgxloc: -10,
	cgyloc: -10,
	cpxloc: -10,
	cpyloc: -10,
	cpthetaoff: 7*Math.PI/180,
	setLocs: function(){
		this.cgxloc = twodmainCanvas.width*(2/3);
		this.cgyloc = twodmainCanvas.height/2;
		this.cpxloc = twodmainCanvas.width*(1/3);
		this.cpyloc = twodmainCanvas.height/2;
	},
	renderCG: function(){
		ctxMain.beginPath();
		ctxMain.setLineDash([0]);
		ctxMain.lineWidth=3;
		ctxMain.moveTo(this.cgxloc, this.cgyloc-10);
		ctxMain.lineTo(this.cgxloc, this.cgyloc+10);
		ctxMain.strokeStyle="#000000";
		ctxMain.stroke();

		ctxMain.beginPath();
		ctxMain.setLineDash([0]);
		ctxMain.lineWidth=3;
		ctxMain.moveTo(this.cgxloc-10,this.cgyloc);
		ctxMain.lineTo(this.cgxloc+10,this.cgyloc);
		ctxMain.strokeStyle="#000000";
		ctxMain.stroke();

		ctxMain.fillStyle="#000000";
		ctxMain.font = "13px Arial";
		ctxMain.fillText("CG", this.cgxloc + 5, this.cgyloc - 10);
	},
	renderCP: function(){
		this.cpxloc = this.cgxloc - momentArm*Math.cos(this.cpthetaoff)*400;
		this.cpyloc = this.cgyloc + momentArm*Math.sin(this.cpthetaoff)*400;

		ctxMain.beginPath();
		ctxMain.setLineDash([0]);
		ctxMain.lineWidth=3;
		ctxMain.moveTo(this.cpxloc, this.cpyloc-10);
		ctxMain.lineTo(this.cpxloc, this.cpyloc+10);
		ctxMain.strokeStyle="#ff0000";
		ctxMain.stroke();

		ctxMain.beginPath();
		ctxMain.setLineDash([0]);
		ctxMain.lineWidth=3;
		ctxMain.moveTo(this.cpxloc-10,this.cpyloc);
		ctxMain.lineTo(this.cpxloc+10,this.cpyloc);
		ctxMain.strokeStyle="#ff0000";
		ctxMain.stroke();

		ctxMain.fillStyle="#ff0000";
		ctxMain.font = "13px Arial";
		ctxMain.fillText("CP", this.cpxloc + 5, this.cpyloc - 10);
	},
	renderLine: function(){
		ctxMain.beginPath();
		ctxMain.setLineDash([0]);
		ctxMain.lineWidth=3;
		ctxMain.moveTo(this.cpxloc,this.cpyloc);
		ctxMain.lineTo(this.cgxloc,this.cgyloc);
		ctxMain.strokeStyle="#0000ff";
		ctxMain.stroke();
	},
	renderForce: function(){
		if(this.cpthetaoff > 0){
			ctxMain.beginPath();
			ctxMain.setLineDash([0]);
			ctxMain.lineWidth=3;
			ctxMain.moveTo(this.cpxloc + Math.atan(this.cpthetaoff)*100,this.cpyloc + 100);
			ctxMain.lineTo(this.cpxloc,this.cpyloc);
			ctxMain.strokeStyle="#ba6adf";
			ctxMain.stroke();

			ctxMain.beginPath();
			ctxMain.setLineDash([0]);
			ctxMain.lineWidth=3;
			ctxMain.moveTo(this.cpxloc,this.cpyloc);
			ctxMain.lineTo(this.cpxloc+10,this.cpyloc + 10);
			ctxMain.strokeStyle="#ba6adf";
			ctxMain.stroke();

			ctxMain.beginPath();
			ctxMain.setLineDash([0]);
			ctxMain.lineWidth=3;
			ctxMain.moveTo(this.cpxloc,this.cpyloc);
			ctxMain.lineTo(this.cpxloc-10,this.cpyloc + 10);
			ctxMain.strokeStyle="#ba6adf";
			ctxMain.stroke();
		}
		else {
			ctxMain.beginPath();
			ctxMain.setLineDash([0]);
			ctxMain.lineWidth=3;
			ctxMain.moveTo(this.cpxloc + Math.atan(this.cpthetaoff)*100,-(this.cpyloc + 100));
			ctxMain.lineTo(this.cpxloc,this.cpyloc);
			ctxMain.strokeStyle="#ba6adf";
			ctxMain.stroke();

			ctxMain.beginPath();
			ctxMain.setLineDash([0]);
			ctxMain.lineWidth=3;
			ctxMain.moveTo(this.cpxloc,this.cpyloc);
			ctxMain.lineTo(this.cpxloc+10,this.cpyloc - 10);
			ctxMain.strokeStyle="#ba6adf";
			ctxMain.stroke();

			ctxMain.beginPath();
			ctxMain.setLineDash([0]);
			ctxMain.lineWidth=3;
			ctxMain.moveTo(this.cpxloc,this.cpyloc);
			ctxMain.lineTo(this.cpxloc-10,this.cpyloc - 10);
			ctxMain.strokeStyle="#ba6adf";
			ctxMain.stroke();
		}
	},
	renderThetaOff: function(){
		ctxMain.beginPath();
		ctxMain.setLineDash([5]);
		ctxMain.lineWidth=1;
		ctxMain.moveTo(this.cpxloc, this.cpyloc);
		ctxMain.lineTo(this.cgxloc*2, this.cgyloc*0.5);
		ctxMain.strokeStyle="#00ff00";
		ctxMain.stroke();
	}
}

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
		rocketRender.cpthetaoff = thetaOff;

		thetaDeflection = calculateThetaDef(thetaOut, omegaOff, timeStep, momentOfInertia, momentArm, airDensity, rocketVelocity, dragCoefficent, controlSurfaceArea);
		$("#twodfin").append("<b>Current time: </b>" + timeControls.currentTime + "<br>");
		$("#twodfin").append("<b>New theta: </b> " + thetaOff + "<br>");
		$("#twodfin").append("<b>New omega: </b> " + omegaOff+ "<br>");
		$("#twodfin").append("<b class='teal-text'>ThetaDeflection: </b> " + thetaDeflection+ "<br>");
		$("#twodfin").append("<br>");

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