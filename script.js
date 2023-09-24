var c, cw, ch, mx, my, gl, run, eCheck;
var startTime;
var time = 0.0;
var tempTime = 0.0;
var fps = 1000 / 60;
var uniLocation = new Array();

window.onload = function(){
	c = document.getElementById('canvas');
	cw = window.innerWidth*0.65; ch = window.innerHeight*0.65;
	c.width = cw; c.height = ch;
	c.addEventListener('mousemove', mouseMove, true);
	gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	
	var prg = create_program(create_shader('vs'), create_shader('fs'));
	run = (prg != null); if(!run){eCheck.checked = false;}
	uniLocation[0] = gl.getUniformLocation(prg, 'time');
	uniLocation[1] = gl.getUniformLocation(prg, 'mouse');
	uniLocation[2] = gl.getUniformLocation(prg, 'resolution');
	
	var position = [
		-1.0,  1.0,  0.0,
		 1.0,  1.0,  0.0,
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0
	];
	var index = [
		0, 2, 1,
		1, 2, 3
	];
	var vPosition = create_vbo(position);
	var vIndex = create_ibo(index);
	var vAttLocation = gl.getAttribLocation(prg, 'position');
	gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
	gl.enableVertexAttribArray(vAttLocation);
	gl.vertexAttribPointer(vAttLocation, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	mx = 0.5; my = 0.5;
	startTime = new Date().getTime();

	render();
};

window.addEventListener('resize', function() {
    c = document.getElementById('canvas');
	cw = window.innerWidth; ch = window.innerHeight;
	c.width = cw; c.height = ch;
});

function mouseMove(e){
	mx = e.offsetX / cw;
	my = e.offsetY / ch;
}

function render(){
	if(!run){return;}

	time = (new Date().getTime() - startTime) * 0.001;
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.uniform1f(uniLocation[0], time + tempTime);
	gl.uniform2fv(uniLocation[1], [mx, my]);
	gl.uniform2fv(uniLocation[2], [cw, ch]);
	
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	gl.flush();
	setTimeout(render, fps);
}

function create_shader(id){
	var shader;
	var scriptElement = document.getElementById(id);
	if(!scriptElement){return;}
	
	switch(scriptElement.type){
		case 'x-shader/x-vertex':
			shader = gl.createShader(gl.VERTEX_SHADER);
			break;
		case 'x-shader/x-fragment':
			shader = gl.createShader(gl.FRAGMENT_SHADER);
			break;
		default :
			return;
	}
	
	gl.shaderSource(shader, scriptElement.text);
	
	gl.compileShader(shader);
	
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		return shader;
	}else{
		
		alert(gl.getShaderInfoLog(shader));
		console.log(gl.getShaderInfoLog(shader));
	}
}

function create_program(vs, fs){
	var program = gl.createProgram();
	
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	
	gl.linkProgram(program);
	
	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
		gl.useProgram(program);
		return program;
	}else{
		return null;
	}
}

function create_vbo(data){
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	return vbo;
}

function create_ibo(data){
	var ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	return ibo;
}
