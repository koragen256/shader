class shaderWrapper{
    constructor(canvas,vcode,fcode){
        this.c, this.cw, this.ch, this.mx, this.my, this.gl, this.run, this.eCheck;
        this.startTime;
        this.time = 0.0;
        this.tempTime = 0.0;
        this.fps = 1000 / 60;
        this.uniLocation = new Array();
        setTimeout(this.init(canvas,vcode,fcode),1000);
    }
    
    init(canvasElm,vcode,fcode){
    	this.c = canvasElm;
    	this.cw = window.innerWidth; this.ch = window.innerHeight;
    	this.c.width = this.cw; this.c.height = this.ch;
    	this.c.addEventListener('mousemove', this.mouseMove, true);
    	this.gl = this.c.getContext('webgl') || this.c.getContext('experimental-webgl');
    
    	var prg = this.create_program(this.create_shader(vcode,'x-shader/x-vertex'), this.create_shader(fcode,'x-shader/x-fragment'));
    	this.run = (prg != null);
    	this.uniLocation[0] = this.gl.getUniformLocation(prg, 'time');
    	this.uniLocation[1] = this.gl.getUniformLocation(prg, 'mouse');
    	this.uniLocation[2] = this.gl.getUniformLocation(prg, 'resolution');
    
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
    	var vPosition = this.create_vbo(position);
    	var vIndex = this.create_ibo(index);
    	var vAttLocation = this.gl.getAttribLocation(prg, 'position');
    	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vPosition);
    	this.gl.enableVertexAttribArray(vAttLocation);
    	this.gl.vertexAttribPointer(vAttLocation, 3, this.gl.FLOAT, false, 0, 0);
    	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vIndex);

    	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    	this.mx = 0.5; this.my = 0.5;
    	this.startTime = new Date().getTime();

    	this.render();
    }

    mouseMove(e){
        this.mx = e.offsetX / this.cw;
        this.my = e.offsetY / this.ch;
    }

    render(){
    	if(!this.run){return;}

    	this.time = (new Date().getTime() - this.startTime) * 0.001;
    
    	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    	this.gl.uniform1f(this.uniLocation[0], this.time + this.tempTime);
    	this.gl.uniform2fv(this.uniLocation[1], [this.mx, this.my]);
    	this.gl.uniform2fv(this.uniLocation[2], [this.cw, this.ch]);
    
    	this.gl.drawElements(this.gl.TRIANglES, 6, this.gl.UNSIGNED_SHORT, 0);
    	this.gl.flush();
    	setTimeout(this.render.bind(this), this.fps);
    }

    create_shader(code,type){
    	var shader;
    
    	switch(type){
    		case 'x-shader/x-vertex':
    			shader = this.gl.createShader(this.gl.VERTEX_SHADER);
    			break;
    		case 'x-shader/x-fragment':
    			shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    			break;
    		default :
    			return;
    	}
    
    	this.gl.shaderSource(shader, code);
    
    	this.gl.compileShader(shader);
    
    	if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
    		return shader;
    	}else{
        
    		alert(this.gl.getShaderInfoLog(shader));
    		console.log(this.gl.getShaderInfoLog(shader));
    	}
    }

    create_program(vs, fs){
    	var program = this.gl.createProgram();
    
    	this.gl.attachShader(program, vs);
    	this.gl.attachShader(program, fs);
    
    	this.gl.linkProgram(program);
    
    	if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
    		this.gl.useProgram(program);
    		return program;
    	}else{
    		return null;
    	}
    }

    create_vbo(data){
    	var vbo = this.gl.createBuffer();
    	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
    	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    
    	return vbo;
    }

    create_ibo(data){
    	var ibo = this.gl.createBuffer();
    	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
    	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    
    	return ibo;
    }

}

//モーダル表示
$(".modal-open").modaal({
    overlay_close: true,//モーダル背景クリック時に閉じるか
    before_open: function () {// モーダルが開く前に行う動作
        $('html').css('overflow-y', 'hidden');/*縦スクロールバーを出さない*/
    },
    after_close: function () {// モーダルが閉じた後に行う動作
        $('html').css('overflow-y', 'scroll');/*縦スクロールバーを出す*/
    }
});