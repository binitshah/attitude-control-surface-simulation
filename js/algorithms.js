/*
Initial State

rocketDiameter = 0.3;
caliber = 2;
rocketMass = 120;
rocketVelocity = 1372;
thetaPitch = 7;
omegaPitch = -0.5;
thetaYaw = 2;
omegaYaw = 1;
rocketLength = 5;
airDensity = 0.017007501;
dragCoefficent = 0.3;
timeStep = 0.1;
proportionalGain = 0.7;
integrativeGain = 0.9;
derivativeGain = 1.2;
controlSurfaceArea = 0.0098;
simulationLength = 50;


Functions
//////Striked out///0) calculate rocketRadius and call it rocketRadius.
1) calculate distance from cp to cg and that's called r.
2) calculate the moment of inertia and that's called I.
//////Striked out///3) calculate the pressure air exerts on a surface and that's called P<sub>air</sub>
4) calculate theta out and that's called thata<sub>out</sub>
5) calculate angle of deflection of control surface and that's called theta def.
*/

/*function calculateRocketRadius(rocketDiameterVar){
	return rocketDiameterVar/2;
}*/

function calculateMomentArm(rocketDiameterVar, caliberVar){
	return rocketDiameterVar * caliberVar;
}

//ASSUMPTION: Rocket is a cylindrical body of uniform density.
function calculateMomentOfInertia(rocketMassVar, rocketDiameterVar, rocketLengthVar){
	return 0.25*rocketMassVar*Math.pow(rocketDiameterVar/2, 2) + (1/12)*rocketMassVar*Math.pow(rocketLengthVar,2);
}

/*function calculateAirPressureOnSurface(airDensityVar, velocityVar, dragCoefficentVar){
	return 0.5*airDensityVar*dragCoefficentVar*Math.pow(velocityVar,2);
}*/

//TODO - when implementing the PID loop, use the other values in the array to set previous stuff & hold off on changing omegaOff until after the timestep
//This is the PID loop
function calculateThetaOut(proportionalGainVar, integrativeGainVar, derivativeGainVar, thetaOffVar, omegaOffVar, timeStepVar){
	integral = integral + thetaOffVar*timeStepVar;
	var thetaOut = proportionalGainVar*thetaOffVar + integrativeGainVar*integral - derivativeGainVar*omegaOffVar;
	return thetaOut;
}

//This is the simulation calculations
function calculateThetaDef(thetaOutVar, omegaOffVar, timeStepVar, momentOfInertiaVar, momentArmVar, airDensityVar, rocketVelocityVar, dragCoefficentVar, controlSurfaceAreaVar) {
	var numerator = ((4*(thetaOutVar - omegaOffVar*timeStepVar))/Math.pow(timeStepVar, 2)) * 2 * momentOfInertiaVar;
	var arccosineable = numerator/(momentArmVar * airDensityVar * Math.pow(rocketVelocityVar,2) * dragCoefficentVar * controlSurfaceAreaVar);
	console.log(arccosineable);
	var thetadef = Math.asin(arccosineable)/2;
	return thetadef;
}